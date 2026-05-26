from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models import Bike, BikeImage, BikeType
from schemas import BikeCreate, BikeUpdate


class BikeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list(self, bike_type: BikeType | None = None, has_pts: bool | None = None) -> list[Bike]:
        query = select(Bike).options(selectinload(Bike.images))
        if bike_type:
            query = query.where(Bike.bike_type == bike_type)
        if has_pts is not None:
            query = query.where(Bike.has_pts == has_pts)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get(self, bike_id: int) -> Bike | None:
        result = await self.session.execute(
            select(Bike)
            .options(selectinload(Bike.images))
            .where(Bike.id == bike_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: BikeCreate) -> Bike:
        bike = Bike(
            name=data.name,
            price=data.price,
            description=data.description,
            specs=data.specs,
            pit_configs=data.pit_configs,
            bike_type=data.bike_type,
            has_pts=data.has_pts,
            in_stock=data.in_stock,
            frame_type_id=data.frame_type_id,
        )
        self.session.add(bike)
        await self.session.flush()
        await self._replace_images(bike.id, data.image_url, data.gallery_urls or [])
        return bike

    async def update(self, bike: Bike, data: BikeUpdate) -> None:
        for key, value in data.model_dump(
            exclude_unset=True,
            exclude={"image_url", "gallery_urls"},
        ).items():
            setattr(bike, key, value)

        if data.image_url is not None or data.gallery_urls is not None:
            await self._replace_images(bike.id, data.image_url, data.gallery_urls or [])

    async def delete(self, bike: Bike) -> None:
        await self.session.delete(bike)

    async def _replace_images(self, bike_id: int, image_url: str | None, gallery_urls: list[str]) -> None:
        existing_images = (
            await self.session.execute(select(BikeImage).where(BikeImage.bike_id == bike_id))
        ).scalars().all()
        for image in existing_images:
            await self.session.delete(image)

        if image_url:
            self.session.add(BikeImage(bike_id=bike_id, image_url=image_url, is_main=True))

        for url in gallery_urls:
            if url and url != image_url:
                self.session.add(BikeImage(bike_id=bike_id, image_url=url, is_main=False))
