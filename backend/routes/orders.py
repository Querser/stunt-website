from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from auth import verify_token
from database import get_db
from schemas import CreatedOrderResponse, MessageResponse, OrderCreate, OrderOut, OrderStatusUpdate, OrderUpdate
from services.exceptions import NotFoundError
from services.orders import OrderService
from services.payments import PaymentUnavailable


router = APIRouter()


def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(db)


@router.post("/orders", response_model=CreatedOrderResponse, tags=["Orders"])
async def create_order(
    order_in: OrderCreate,
    service: OrderService = Depends(get_order_service),
):
    try:
        order_id, payment_invoice = await service.create_order(order_in)
    except PaymentUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    return CreatedOrderResponse(
        message="Заявка создана",
        order_id=order_id,
        payment_form={
            "provider": payment_invoice.provider,
            "action_url": payment_invoice.action_url,
            "method": payment_invoice.method,
            "fields": payment_invoice.fields,
        } if payment_invoice and payment_invoice.action_url else None,
    )


@router.get("/orders", response_model=List[OrderOut], tags=["Admin: Orders"])
async def get_orders(
    service: OrderService = Depends(get_order_service),
    admin: str = Depends(verify_token),
):
    return await service.list_orders()


@router.put("/orders/{order_id}", response_model=MessageResponse, tags=["Admin: Orders"])
async def update_order(
    order_id: int,
    data: OrderUpdate,
    service: OrderService = Depends(get_order_service),
    admin: str = Depends(verify_token),
):
    try:
        await service.update_order(order_id, data)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.detail)

    return MessageResponse(message="Заказ обновлен")


@router.patch("/orders/{order_id}/status", response_model=MessageResponse, tags=["Admin: Orders"])
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    service: OrderService = Depends(get_order_service),
    admin: str = Depends(verify_token),
):
    try:
        await service.update_order_status(order_id, data)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.detail)

    return MessageResponse(message="Статус обновлен")
