from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models import Accessory, Part
from schemas import ItemCreate, ItemKind, ItemUpdate


class ItemRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_accessories(self, in_stock_only: bool = False) -> list[Accessory]:
        query = select(Accessory)
        if in_stock_only:
            query = query.where(Accessory.in_stock.is_(True))

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def list_parts(self) -> list[Part]:
        result = await self.session.execute(select(Part).options(selectinload(Part.category)))
        return list(result.scalars().all())

    async def get(self, item_kind: ItemKind, item_id: int) -> Accessory | Part | None:
        model = Accessory if item_kind == "accessory" else Part
        result = await self.session.execute(select(model).where(model.id == item_id))
        return result.scalar_one_or_none()

    async def create(self, item_kind: ItemKind, data: ItemCreate) -> Accessory | Part:
        if item_kind == "accessory":
            item = Accessory(
                name=data.name,
                price=data.price,
                description=data.description,
                image_url=data.image_url,
            )
        else:
            item = Part(
                category_id=data.category_id,
                name=data.name,
                price=data.price,
                description=data.description,
                image_url=data.image_url,
            )

        self.session.add(item)
        return item

    async def update(self, item_kind: ItemKind, item: Accessory | Part, data: ItemUpdate) -> None:
        for key, value in data.model_dump(exclude_unset=True).items():
            if key == "category_id" and item_kind == "accessory":
                continue
            setattr(item, key, value)

    async def delete(self, item: Accessory | Part) -> None:
        await self.session.delete(item)
