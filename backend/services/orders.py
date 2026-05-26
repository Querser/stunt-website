from __future__ import annotations

import asyncio

from sqlalchemy.ext.asyncio import AsyncSession

from notifications import OrderNotification, send_telegram_notification
from repositories.orders import OrderRepository
from schemas import OrderCreate, OrderStatusUpdate, OrderUpdate
from services.exceptions import NotFoundError
from services.payments import PaymentForm, PaymentService, PaymentUnavailable
from services.settings import AdminSettingsService


class OrderService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.orders = OrderRepository(session)
        self.payments = PaymentService()
        self.settings = AdminSettingsService(session)

    async def create_order(self, data: OrderCreate) -> tuple[int, PaymentForm | None]:
        order = await self.orders.create(data)
        await self.session.flush()

        payment_invoice = await self._create_payment_if_needed(order.id, data)
        if payment_invoice:
            order.configuration = {
                **(order.configuration or {}),
                "payment": {
                    "provider": payment_invoice.provider,
                    "action_url": payment_invoice.action_url,
                },
            }

        configuration = data.configuration
        order_type = configuration.get("order_type") or configuration.get("type")
        order_title = configuration.get("bike") or configuration.get("item_name") or ("Запись на сервис" if order_type == "service" else "")
        order_meta = configuration.get("graphic") or configuration.get("category") or configuration.get("pit_config") or ""
        accessories = configuration.get("accessories") or []
        telegram_recipients = await self.settings.get_telegram_recipients()

        await self.session.commit()
        await self.session.refresh(order)

        asyncio.create_task(
            send_telegram_notification(
                OrderNotification(
                    customer_name=order.customer_name,
                    phone=order.phone,
                    telegram=order.telegram,
                    bike_name=order_title,
                    graphics=order_meta,
                    accessories=accessories,
                    total_price=order.total_price,
                ),
                recipients=telegram_recipients,
            )
        )
        return order.id, payment_invoice

    async def list_orders(self):
        return await self.orders.list()

    async def update_order(self, order_id: int, data: OrderUpdate) -> None:
        order = await self.orders.get(order_id)
        if not order:
            raise NotFoundError("Заказ не найден")

        await self.orders.update(order, data)
        await self.session.commit()

    async def update_order_status(self, order_id: int, data: OrderStatusUpdate) -> None:
        order = await self.orders.get(order_id)
        if not order:
            raise NotFoundError("Заказ не найден")

        await self.orders.update_status(order, data)
        await self.session.commit()

    async def _create_payment_if_needed(self, order_id: int, data: OrderCreate) -> PaymentForm | None:
        return self.payments.create_payment_form(order_id=order_id, data=data)
