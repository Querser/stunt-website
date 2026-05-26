from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from cache import get_json, set_json
from config import get_settings
from models import BikeType, FrameType
from repositories.bikes import BikeRepository
from repositories.graphics import GraphicRepository
from repositories.items import ItemRepository
from schemas import AccessoryOut, BikeOut, GraphicOptionOut, PartOut
from services.exceptions import NotFoundError
from services.serialization import dump_schema, dump_schema_many
from services.woocommerce import WP_BIKE_ID_OFFSET, WooCommerceStoreClient, WooCommerceUnavailable


CacheResult = tuple[object, str]
logger = logging.getLogger(__name__)


class CatalogService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.bikes = BikeRepository(session)
        self.graphics = GraphicRepository(session)
        self.items = ItemRepository(session)
        self.woocommerce = WooCommerceStoreClient()
        self.settings = get_settings()

    async def list_bikes(
        self,
        bike_type: BikeType | None,
        has_pts: bool | None,
        *,
        local_only: bool = False,
        configurable_only: bool = False,
    ) -> CacheResult:
        bike_type_key = bike_type.value if bike_type else "all"
        has_pts_key = "all" if has_pts is None else str(has_pts).lower()
        source_key = "local" if local_only or configurable_only or not self.settings.woocommerce_enabled else "woo:v2"
        cache_key = f"catalog:bikes:{source_key}:{bike_type_key}:{has_pts_key}"

        cached = await get_json(cache_key)
        if cached is not None:
            return cached, "HIT"

        if self.settings.woocommerce_enabled and not local_only and not configurable_only:
            try:
                payload = await self._external_bikes(bike_type=bike_type, has_pts=has_pts)
                await set_json(cache_key, payload, ttl_seconds=self.settings.woocommerce_cache_ttl_seconds)
                return payload, "MISS-WOO"
            except WooCommerceUnavailable as exc:
                logger.warning("WooCommerce bikes are unavailable, falling back to local catalog: %s", exc)

        payload = dump_schema_many(BikeOut, await self.bikes.list(bike_type=bike_type, has_pts=has_pts))
        payload = self._sort_by_stock(payload)
        await set_json(cache_key, payload)
        return payload, "MISS"

    async def get_bike(self, bike_id: int) -> CacheResult:
        cache_key = f"catalog:bike:v2:{bike_id}"
        cached = await get_json(cache_key)
        if cached is not None:
            return cached, "HIT"

        if self.settings.woocommerce_enabled and bike_id >= WP_BIKE_ID_OFFSET:
            try:
                for bike in await self._external_bikes(bike_type=None, has_pts=None):
                    if bike["id"] == bike_id:
                        await set_json(cache_key, bike, ttl_seconds=self.settings.woocommerce_cache_ttl_seconds)
                        return bike, "MISS-WOO"
            except WooCommerceUnavailable as exc:
                logger.warning("WooCommerce bike %s is unavailable: %s", bike_id, exc)

        bike = await self.bikes.get(bike_id)
        if not bike:
            raise NotFoundError("Техника не найдена")

        payload = dump_schema(BikeOut, bike)
        await set_json(cache_key, payload)
        return payload, "MISS"

    async def list_graphics(self, frame_type_id: int) -> CacheResult:
        cache_key = f"catalog:graphics:{frame_type_id}"
        cached = await get_json(cache_key)
        if cached is not None:
            return cached, "HIT"

        payload = dump_schema_many(GraphicOptionOut, await self.graphics.list_by_frame_type(frame_type_id))
        await set_json(cache_key, payload)
        return payload, "MISS"

    async def list_accessories(self) -> CacheResult:
        cache_key = "catalog:accessories"
        cached = await get_json(cache_key)
        if cached is not None:
            return cached, "HIT"

        payload = dump_schema_many(AccessoryOut, await self.items.list_accessories(in_stock_only=True))
        await set_json(cache_key, payload)
        return payload, "MISS"

    async def list_parts(self) -> CacheResult:
        cache_key = "catalog:parts:all:v1" if self.settings.woocommerce_enabled else "catalog:parts:local"
        cached = await get_json(cache_key)
        if cached is not None:
            return cached, "HIT"

        if self.settings.woocommerce_enabled:
            try:
                payload = await self.woocommerce.list_products()
                payload = self._sort_by_stock(payload)
                await set_json(cache_key, payload, ttl_seconds=self.settings.woocommerce_cache_ttl_seconds)
                return payload, "MISS-WOO"
            except WooCommerceUnavailable as exc:
                logger.warning("WooCommerce products are unavailable, returning empty parts list: %s", exc)
                payload: list[dict] = []
                await set_json(cache_key, payload, ttl_seconds=30)
                return payload, "MISS-WOO-FAILED"

        payload = dump_schema_many(PartOut, await self.items.list_parts())
        payload = self._sort_by_stock(payload)
        await set_json(cache_key, payload)
        return payload, "MISS"

    async def _external_bikes(self, bike_type: BikeType | None, has_pts: bool | None) -> list[dict]:
        payload = await self.woocommerce.list_bikes()
        payload = await self._attach_frame_type_ids(payload)
        payload = self._filter_bike_payload(payload, bike_type=bike_type, has_pts=has_pts)
        return self._sort_by_stock(payload)

    async def _attach_frame_type_ids(self, bikes: list[dict]) -> list[dict]:
        frame_ids = await self._frame_ids_by_name()
        for bike in bikes:
            frame_name = bike.pop("frame_type_name", None)
            if frame_name:
                bike["frame_type_id"] = frame_ids.get(frame_name)
        return bikes

    async def _frame_ids_by_name(self) -> dict[str, int]:
        result = await self.session.execute(select(FrameType))
        return {frame.name: frame.id for frame in result.scalars().all()}

    @staticmethod
    def _filter_bike_payload(
        bikes: list[dict],
        *,
        bike_type: BikeType | None,
        has_pts: bool | None,
    ) -> list[dict]:
        filtered = bikes
        if bike_type:
            filtered = [bike for bike in filtered if bike.get("bike_type") == bike_type.value]
        if has_pts is not None:
            filtered = [bike for bike in filtered if bool(bike.get("has_pts")) is has_pts]
        return filtered

    @staticmethod
    def _sort_by_stock(items: list[dict]) -> list[dict]:
        return sorted(items, key=lambda item: (not bool(item.get("in_stock")), str(item.get("name") or "").casefold()))
