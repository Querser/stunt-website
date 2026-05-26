from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from repositories.settings import SettingsRepository


TELEGRAM_RECIPIENTS_KEY = "telegram_recipients"


class AdminSettingsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = SettingsRepository(session)
        self.settings = get_settings()

    async def get_telegram_recipients(self) -> list[str]:
        setting = await self.repository.get(TELEGRAM_RECIPIENTS_KEY)
        recipients = []
        if setting and isinstance(setting.value, dict):
            raw_recipients = setting.value.get("recipients") or []
            if isinstance(raw_recipients, list):
                recipients = [str(item) for item in raw_recipients]

        return _sanitize_recipients(recipients or self.settings.telegram_chat_ids)

    async def set_telegram_recipients(self, recipients: list[str]) -> list[str]:
        sanitized = _sanitize_recipients(recipients)
        await self.repository.set(TELEGRAM_RECIPIENTS_KEY, {"recipients": sanitized})
        await self.session.commit()
        return sanitized

    def is_telegram_bot_configured(self) -> bool:
        return bool(self.settings.telegram_bot_token)


def _sanitize_recipients(recipients: list[str]) -> list[str]:
    normalized: list[str] = []
    seen = set()
    for recipient in recipients:
        value = str(recipient).strip()
        if not value or value in seen:
            continue
        if len(value) > 120:
            continue
        seen.add(value)
        normalized.append(value)
    return normalized
