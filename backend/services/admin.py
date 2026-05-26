from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from cache import delete_patterns, get_json, set_json
from repositories.bikes import BikeRepository
from repositories.graphics import GraphicRepository
from repositories.items import ItemRepository
from repositories.references import ReferenceRepository
from schemas import (
    BikeCreate,
    BikeOut,
    BikeUpdate,
    FrameTypeOut,
    GraphicCreate,
    GraphicOptionAdminOut,
    GraphicUpdate,
    ItemCreate,
    ItemKind,
    ItemUpdate,
    PartCategoryOut,
)
from services.exceptions import NotFoundError, ValidationError
from services.serialization import dump_schema, dump_schema_many


CacheResult = tuple[object, str]


class AdminService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.bikes = BikeRepository(session)
        self.graphics = GraphicRepository(session)
        self.items = ItemRepository(session)
        self.refs = ReferenceRepository(session)

    async def list_frame_types(self) -> CacheResult:
        cache_key = "admin:refs:frame_types"
        cached = await get_json(cache_key)
        if cached is not None:
            return cached, "HIT"

        payload = dump_schema_many(FrameTypeOut, await self.refs.list_frame_types())
        await set_json(cache_key, payload)
        return payload, "MISS"

    async def list_part_categories(self) -> CacheResult:
        cache_key = "admin:refs:categories"
        cached = await get_json(cache_key)
        if cached is not None:
            return cached, "HIT"

        payload = dump_schema_many(PartCategoryOut, await self.refs.list_part_categories())
        await set_json(cache_key, payload)
        return payload, "MISS"

    async def list_graphics(self) -> CacheResult:
        cache_key = "admin:graphics"
        cached = await get_json(cache_key)
        if cached is not None:
            return cached, "HIT"

        payload = dump_schema_many(GraphicOptionAdminOut, await self.graphics.list_all())
        await set_json(cache_key, payload)
        return payload, "MISS"

    async def create_bike(self, data: BikeCreate):
        bike = await self.bikes.create(data)
        await self.session.commit()
        await self.invalidate_bike_cache()
        created = await self.bikes.get(bike.id)
        return dump_schema(BikeOut, created)

    async def update_bike(self, bike_id: int, data: BikeUpdate) -> None:
        bike = await self.bikes.get(bike_id)
        if not bike:
            raise NotFoundError("Техника не найдена")

        await self.bikes.update(bike, data)
        await self.session.commit()
        await self.invalidate_bike_cache(bike_id)

    async def delete_bike(self, bike_id: int) -> None:
        bike = await self.bikes.get(bike_id)
        if not bike:
            raise NotFoundError("Техника не найдена")

        await self.bikes.delete(bike)
        await self.session.commit()
        await self.invalidate_bike_cache(bike_id)

    async def create_graphic(self, data: GraphicCreate) -> None:
        await self.graphics.create(data)
        await self.session.commit()
        await self.invalidate_graphics_cache()

    async def update_graphic(self, graphic_id: int, data: GraphicUpdate) -> None:
        graphic = await self.graphics.get(graphic_id)
        if not graphic:
            raise NotFoundError("Графика не найдена")

        await self.graphics.update(graphic, data)
        await self.session.commit()
        await self.invalidate_graphics_cache()

    async def delete_graphic(self, graphic_id: int) -> None:
        graphic = await self.graphics.get(graphic_id)
        if not graphic:
            raise NotFoundError("Графика не найдена")

        await self.graphics.delete(graphic)
        await self.session.commit()
        await self.invalidate_graphics_cache()

    async def create_item(self, item_kind: ItemKind, data: ItemCreate) -> None:
        if item_kind == "part" and data.category_id is None:
            raise ValidationError("category_id обязателен для запчасти")

        await self.items.create(item_kind, data)
        await self.session.commit()
        await self.invalidate_item_cache(item_kind)

    async def update_item(self, item_kind: ItemKind, item_id: int, data: ItemUpdate) -> None:
        item = await self.items.get(item_kind, item_id)
        if not item:
            raise NotFoundError("Объект не найден")

        await self.items.update(item_kind, item, data)
        await self.session.commit()
        await self.invalidate_item_cache(item_kind)

    async def delete_item(self, item_kind: ItemKind, item_id: int) -> None:
        item = await self.items.get(item_kind, item_id)
        if not item:
            raise NotFoundError("Объект не найден")

        await self.items.delete(item)
        await self.session.commit()
        await self.invalidate_item_cache(item_kind)

    async def invalidate_bike_cache(self, bike_id: int | None = None) -> None:
        patterns = ["catalog:bikes:*"]
        patterns.append(f"catalog:bike:{bike_id}" if bike_id else "catalog:bike:*")
        await delete_patterns(*patterns)

    async def invalidate_graphics_cache(self) -> None:
        await delete_patterns("catalog:graphics:*", "admin:graphics")

    async def invalidate_item_cache(self, item_kind: ItemKind) -> None:
        if item_kind == "accessory":
            await delete_patterns("catalog:accessories")
        else:
            await delete_patterns("catalog:parts")
