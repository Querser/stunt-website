from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models import GraphicOption
from schemas import GraphicCreate, GraphicUpdate


class GraphicRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_by_frame_type(self, frame_type_id: int) -> list[GraphicOption]:
        result = await self.session.execute(
            select(GraphicOption).where(GraphicOption.frame_type_id == frame_type_id)
        )
        return list(result.scalars().all())

    async def list_all(self) -> list[GraphicOption]:
        result = await self.session.execute(
            select(GraphicOption).options(selectinload(GraphicOption.frame_type))
        )
        return list(result.scalars().all())

    async def get(self, graphic_id: int) -> GraphicOption | None:
        result = await self.session.execute(
            select(GraphicOption).where(GraphicOption.id == graphic_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: GraphicCreate) -> GraphicOption:
        graphic = GraphicOption(**data.model_dump())
        self.session.add(graphic)
        return graphic

    async def update(self, graphic: GraphicOption, data: GraphicUpdate) -> None:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(graphic, key, value)

    async def delete(self, graphic: GraphicOption) -> None:
        await self.session.delete(graphic)
