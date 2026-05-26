from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import FrameType, PartCategory


class ReferenceRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_frame_types(self) -> list[FrameType]:
        result = await self.session.execute(select(FrameType).order_by(FrameType.name))
        return list(result.scalars().all())

    async def list_part_categories(self) -> list[PartCategory]:
        result = await self.session.execute(select(PartCategory).order_by(PartCategory.name))
        return list(result.scalars().all())
