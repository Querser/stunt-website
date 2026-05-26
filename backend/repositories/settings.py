from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import AdminSetting


class SettingsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, key: str) -> AdminSetting | None:
        result = await self.session.execute(select(AdminSetting).where(AdminSetting.key == key))
        return result.scalar_one_or_none()

    async def set(self, key: str, value: dict) -> AdminSetting:
        setting = await self.get(key)
        if setting:
            setting.value = value
            return setting

        setting = AdminSetting(key=key, value=value)
        self.session.add(setting)
        return setting
