import logging
from dataclasses import dataclass
from html import escape
from typing import Iterable

import httpx

from config import get_settings


logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass(frozen=True)
class OrderNotification:
    customer_name: str
    phone: str
    telegram: str | None
    bike_name: str
    graphics: str
    accessories: list[str]
    total_price: int


async def send_telegram_notification(
    notification: OrderNotification,
    recipients: Iterable[str] | None = None,
) -> None:
    if not settings.telegram_bot_token:
        return

    chat_ids = [str(item).strip() for item in (recipients or settings.telegram_chat_ids) if str(item).strip()]
    if not chat_ids:
        return

    accs_text = ", ".join(notification.accessories) if notification.accessories else "Без допов"
    text = (
        "🔥 <b>Новая заявка!</b>\n\n"
        f"👤 <b>Имя:</b> {escape(notification.customer_name)}\n"
        f"📞 <b>Телефон:</b> <code>{escape(notification.phone)}</code>\n"
        f"✈️ <b>Telegram:</b> {escape(notification.telegram or 'Не указан')}\n\n"
        f"🏍 <b>Позиция:</b> {escape(notification.bike_name or 'Не указана')}\n"
        f"🎨 <b>Детали:</b> {escape(notification.graphics or 'Сток')}\n"
        f"⚙️ <b>Допы:</b> {escape(accs_text)}\n\n"
        f"💰 <b>Итого:</b> {notification.total_price:,.0f} руб."
    )
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            for chat_id in chat_ids:
                response = await client.post(
                    url,
                    json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
                )
                if response.status_code >= 400:
                    logger.warning("Telegram notification failed for chat_id=%s: %s", chat_id, response.text)
    except httpx.HTTPError:
        logger.exception("Failed to send Telegram order notification")
