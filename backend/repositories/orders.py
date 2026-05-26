from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Order
from schemas import OrderCreate, OrderStatusUpdate, OrderUpdate


class OrderRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, data: OrderCreate) -> Order:
        order = Order(
            customer_name=data.customer_name,
            phone=data.phone,
            telegram=data.telegram,
            contact_method=data.contact_method,
            comment=data.comment,
            payment_method=data.payment_method,
            total_price=data.total_price,
            configuration=data.configuration,
            status="NEW",
        )
        self.session.add(order)
        return order

    async def list(self) -> list[Order]:
        result = await self.session.execute(select(Order).order_by(Order.id.desc()))
        return list(result.scalars().all())

    async def get(self, order_id: int) -> Order | None:
        result = await self.session.execute(select(Order).where(Order.id == order_id))
        return result.scalar_one_or_none()

    async def update(self, order: Order, data: OrderUpdate) -> None:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(order, key, value)

    async def update_status(self, order: Order, data: OrderStatusUpdate) -> None:
        order.status = data.status

    async def mark_payment_result(
        self,
        order: Order,
        *,
        status: str,
        provider: str,
        payment_id: str | None = None,
        payload: dict | None = None,
    ) -> None:
        order.status = status
        payment_data = {
            **((order.configuration or {}).get("payment") or {}),
            "provider": provider,
        }
        if payment_id:
            payment_data["payment_id"] = payment_id
        if payload:
            payment_data["last_payload"] = payload

        order.configuration = {
            **(order.configuration or {}),
            "payment": payment_data,
        }
