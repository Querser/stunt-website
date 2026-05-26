from __future__ import annotations

import hashlib
from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from config import get_settings
from schemas import OrderCreate


class PaymentUnavailable(Exception):
    pass


@dataclass(frozen=True)
class PaymentForm:
    provider: str
    action_url: str
    method: str
    fields: dict[str, str]


class PaymentService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def create_payment_form(self, order_id: int, data: OrderCreate) -> PaymentForm | None:
        if data.payment_method == "paykeeper":
            return self._paykeeper_form(order_id, data)

        if data.payment_method == "installment":
            return self._vanta_form(order_id, data)

        return None

    def _paykeeper_form(self, order_id: int, data: OrderCreate) -> PaymentForm:
        if not (self.settings.paykeeper_enabled and self.settings.paykeeper_form_url and self.settings.paykeeper_secret_seed):
            raise PaymentUnavailable("PayKeeper не настроен: нужны PAYKEEPER_ENABLED=true, PAYKEEPER_FORM_URL и PAYKEEPER_SECRET_SEED")

        amount = _format_amount(data.total_price)
        clientid = data.customer_name
        orderid = str(order_id)
        service_name = _service_name(data.configuration)
        client_email = ""
        client_phone = data.phone
        result_callback = _join_url(self.settings.public_site_url, f"/payment-result?order_id={order_id}")
        sign_source = "".join(
            [
                amount,
                clientid,
                orderid,
                service_name,
                client_email,
                client_phone,
                self.settings.paykeeper_secret_seed,
            ]
        )
        sign = hashlib.sha256(sign_source.encode("utf-8")).hexdigest()

        return PaymentForm(
            provider="paykeeper",
            action_url=self.settings.paykeeper_form_url,
            method="POST",
            fields={
                "sum": amount,
                "clientid": clientid,
                "orderid": orderid,
                "service_name": service_name,
                "client_email": client_email,
                "client_phone": client_phone,
                "sign": sign,
                "user_result_callback": result_callback,
            },
        )

    def _vanta_form(self, order_id: int, data: OrderCreate) -> PaymentForm | None:
        if not self.settings.vanta_enabled:
            return None

        missing = []
        if not self.settings.vanta_form_url:
            missing.append("VANTA_FORM_URL")
        if not self.settings.vanta_partner_id:
            missing.append("VANTA_PARTNER_ID")
        if not self.settings.vanta_trade_id:
            missing.append("VANTA_TRADE_ID")
        if not self.settings.vanta_webhook_secret:
            missing.append("VANTA_WEBHOOK_SECRET")
        if missing:
            raise PaymentUnavailable("Рассрочка временно недоступна: не хватает настроек Ванты")

        return PaymentForm(
            provider="vanta",
            action_url=self.settings.vanta_form_url,
            method="POST",
            fields={
                "orderid": str(order_id),
                "amount": _format_amount(data.total_price),
                "partner_id": self.settings.vanta_partner_id,
                "trade_id": self.settings.vanta_trade_id,
                "x-partner-id": self.settings.vanta_partner_id,
                "x-trade-id": self.settings.vanta_trade_id,
                "application_type": self.settings.vanta_application_type,
                "terms": ",".join(self.settings.vanta_terms),
                "success_url": _join_url(self.settings.public_site_url, f"/payment-result?installment=1&order_id={order_id}"),
                "fail_url": _join_url(self.settings.public_site_url, f"/payment-result?installment=1&order_id={order_id}&result=fail"),
                "webhook_url": _join_url(self.settings.public_site_url, "/api/v1/payments/vanta/webhook"),
            },
        )


def _format_amount(value: int) -> str:
    return f"{Decimal(value):.2f}"


def _service_name(configuration: dict[str, Any]) -> str:
    order_type = configuration.get("order_type") or configuration.get("type") or "order"
    if order_type == "cart":
        return f"Stunt Tech: корзина, {configuration.get('items_count') or 0} поз."
    if configuration.get("bike"):
        return f"Stunt Tech: {configuration['bike']}"
    if configuration.get("item_name"):
        return f"Stunt Tech: {configuration['item_name']}"
    return "Stunt Tech: заказ"


def _join_url(base_url: str, path: str) -> str:
    if not base_url:
        return path
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"
