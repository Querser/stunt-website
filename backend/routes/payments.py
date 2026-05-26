from __future__ import annotations

import hashlib
from decimal import Decimal, InvalidOperation
from typing import Any

from fastapi import APIRouter, Depends, Form, Header, HTTPException, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from repositories.orders import OrderRepository
from schemas import PaymentOptionsOut, PaymentStatusOut


router = APIRouter()


def _format_sum(value: str) -> str:
    try:
        return f"{Decimal(str(value)).quantize(Decimal('0.01')):.2f}"
    except (InvalidOperation, ValueError):
        raise HTTPException(status_code=400, detail="Некорректная сумма платежа")


def _order_amount(value: int) -> str:
    return f"{Decimal(value).quantize(Decimal('0.01')):.2f}"


def _payment_snapshot(order) -> tuple[str | None, str | None]:
    payment = (order.configuration or {}).get("payment") or {}
    return payment.get("provider"), payment.get("payment_id")


def _is_vanta_ready(settings) -> bool:
    return bool(
        settings.vanta_enabled
        and settings.vanta_form_url
        and settings.vanta_partner_id
        and settings.vanta_trade_id
        and settings.vanta_webhook_secret
    )


async def read_vanta_payload(request: Request) -> dict[str, Any]:
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        payload = await request.json()
        return payload if isinstance(payload, dict) else {}

    form = await request.form()
    return dict(form)


async def process_vanta_webhook_payload(
    payload: dict[str, Any],
    db: AsyncSession,
    *,
    secret: str | None = None,
) -> dict[str, Any]:
    settings = get_settings()
    provided_secret = (
        secret
        or payload.get("secret")
        or payload.get("webhook_secret")
        or payload.get("x_webhook_secret")
        or payload.get("x_vanta_secret")
    )
    if settings.vanta_webhook_secret and provided_secret != settings.vanta_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid Vanta webhook secret")

    raw_order_id = payload.get("orderid") or payload.get("order_id") or payload.get("orderId")
    if not raw_order_id:
        raise HTTPException(status_code=400, detail="orderid is required")

    try:
        order_id = int(raw_order_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid orderid")

    status_text = str(payload.get("status") or payload.get("state") or payload.get("result") or "").lower()
    next_status = "NEW"
    if status_text in {"paid", "success", "approved", "completed", "signed", "ok"}:
        next_status = "PAID"
    elif status_text in {"cancelled", "canceled", "rejected", "failed", "expired", "fail"}:
        next_status = "CANCELLED"

    repo = OrderRepository(db)
    order = await repo.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    await repo.mark_payment_result(
        order,
        status=next_status,
        provider="vanta",
        payment_id=str(payload.get("id") or payload.get("application_id") or payload.get("applicationId") or ""),
        payload=payload,
    )
    await db.commit()

    return {"status": "ok", "order_id": order.id, "order_status": next_status}


@router.get("/orders/{order_id}/payment-status", response_model=PaymentStatusOut, tags=["Payments"])
async def get_payment_status(order_id: int, db: AsyncSession = Depends(get_db)):
    order = await OrderRepository(db).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    provider, payment_id = _payment_snapshot(order)
    return PaymentStatusOut(
        order_id=order.id,
        status=order.status,
        is_paid=order.status == "PAID",
        payment_method=order.payment_method,
        payment_provider=provider,
        payment_id=payment_id,
    )


@router.get("/payments/options", response_model=PaymentOptionsOut, tags=["Payments"])
async def get_payment_options():
    settings = get_settings()
    return PaymentOptionsOut(
        paykeeper_enabled=bool(settings.paykeeper_enabled and settings.paykeeper_form_url and settings.paykeeper_secret_seed),
        installment_enabled=_is_vanta_ready(settings),
    )


@router.post("/payments/paykeeper/webhook", response_class=PlainTextResponse, tags=["Payments"])
async def paykeeper_webhook(
    id: str = Form(...),
    sum: str = Form(...),
    clientid: str = Form(""),
    orderid: str = Form(...),
    key: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    if not settings.paykeeper_secret_seed:
        raise HTTPException(status_code=503, detail="PayKeeper secret is not configured")

    normalized_sum = _format_sum(sum)
    expected_key = hashlib.md5(
        f"{id}{normalized_sum}{clientid}{orderid}{settings.paykeeper_secret_seed}".encode("utf-8")
    ).hexdigest()
    if key != expected_key:
        raise HTTPException(status_code=400, detail="PayKeeper hash mismatch")

    try:
        local_order_id = int(orderid)
    except ValueError:
        raise HTTPException(status_code=400, detail="Некорректный номер заказа")

    repo = OrderRepository(db)
    order = await repo.get(local_order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if normalized_sum != _order_amount(order.total_price):
        raise HTTPException(status_code=400, detail="Сумма платежа не совпадает с заказом")

    if clientid and clientid.strip() != order.customer_name.strip():
        raise HTTPException(status_code=400, detail="Плательщик не совпадает с заказом")

    await repo.mark_payment_result(
        order,
        status="PAID",
        provider="paykeeper",
        payment_id=id,
        payload={
            "id": id,
            "sum": normalized_sum,
            "clientid": clientid,
            "orderid": orderid,
        },
    )
    await db.commit()

    return f"OK {hashlib.md5(f'{id}{settings.paykeeper_secret_seed}'.encode('utf-8')).hexdigest()}"


@router.post("/payments/vanta/webhook", tags=["Payments"])
async def vanta_webhook(
    request: Request,
    x_webhook_secret: str | None = Header(default=None),
    x_vanta_secret: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    payload = await read_vanta_payload(request)
    secret = x_webhook_secret or x_vanta_secret
    return await process_vanta_webhook_payload(payload, db, secret=secret)
