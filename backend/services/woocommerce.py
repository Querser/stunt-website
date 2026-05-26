from __future__ import annotations

import asyncio
import html
import logging
import re
from typing import Any

import httpx

from config import get_settings


logger = logging.getLogger(__name__)
settings = get_settings()

_TAG_RE = re.compile(r"<[^>]+>")
_SPACE_RE = re.compile(r"\s+")
_IMG_RE = re.compile(r"<img[^>]+src=[\"']([^\"']+)[\"']", re.IGNORECASE)
WP_BIKE_ID_OFFSET = 900000
UNCATEGORIZED_CATEGORY_ID = 0

DEFAULT_WOO_PIT_CONFIGS = [
    {"name": "Lite", "wheels": "12/12", "price_add": 0},
    {"name": "Lite", "wheels": "14/14", "price_add": 8000},
    {"name": "Pro", "wheels": "12/12", "price_add": 18000},
]

PITBIKE_HINTS = (
    "питбайк",
    "pitbajk",
    "kayo k125",
    "kayo tt",
    "bse ",
    "stg fs",
)

PTS_HINTS = ("с птс", "c птс", "pts")


class WooCommerceUnavailable(Exception):
    pass


class WooCommerceStoreClient:
    def __init__(self) -> None:
        self.base_url = settings.woocommerce_store_api_url
        self.per_page = max(1, min(settings.woocommerce_per_page, 100))

    async def list_products(self) -> list[dict[str, Any]]:
        products = await self._list_products_raw()
        categories_by_id = await self._list_categories_by_id()
        parts: list[dict[str, Any]] = []
        for product in products:
            if _bike_type(product):
                continue
            parts.append(self._map_product(product, categories_by_id))

        return parts

    async def list_bikes(self) -> list[dict[str, Any]]:
        products = await self._list_products_raw()
        categories_by_id = await self._list_categories_by_id()
        bikes: list[dict[str, Any]] = []
        for product in products:
            bike_type = _bike_type(product)
            if not bike_type:
                continue
            bikes.append(self._map_bike(product, bike_type, categories_by_id))

        return bikes

    async def _list_products_raw(self) -> list[dict[str, Any]]:
        if not settings.woocommerce_enabled:
            raise WooCommerceUnavailable("WooCommerce integration is disabled")

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(25.0), headers={"Accept": "application/json"}) as client:
                first_items, total_pages = await self._fetch_products_page(client, page=1)
                if total_pages <= 1:
                    return first_items

                semaphore = asyncio.Semaphore(4)

                async def fetch_page(page: int) -> list[dict[str, Any]]:
                    async with semaphore:
                        items, _ = await self._fetch_products_page(client, page=page)
                        return items

                page_batches = await asyncio.gather(*(fetch_page(page) for page in range(2, total_pages + 1)))
                products = first_items
                for batch in page_batches:
                    products.extend(batch)
        except (httpx.HTTPError, ValueError) as exc:
            raise WooCommerceUnavailable("WooCommerce products request failed") from exc

        return products

    async def _fetch_products_page(self, client: httpx.AsyncClient, page: int) -> tuple[list[dict[str, Any]], int]:
        response = await client.get(
            f"{self.base_url}/products",
            params={"per_page": self.per_page, "page": page},
        )
        if response.status_code >= 400:
            raise WooCommerceUnavailable(f"WooCommerce products request failed: {response.status_code}")

        try:
            total_pages = int(response.headers.get("X-WP-TotalPages", "1"))
        except ValueError:
            total_pages = 1

        payload = response.json()
        if not isinstance(payload, list):
            raise WooCommerceUnavailable("WooCommerce products response is not a list")

        return payload, total_pages

    async def _list_categories_by_id(self) -> dict[int, dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(25.0), headers={"Accept": "application/json"}) as client:
                first_items, total_pages = await self._fetch_categories_page(client, page=1)
                categories = first_items
                if total_pages > 1:
                    page_batches = await asyncio.gather(
                        *(self._fetch_categories_page(client, page=page) for page in range(2, total_pages + 1))
                    )
                    for batch, _ in page_batches:
                        categories.extend(batch)
        except (httpx.HTTPError, ValueError, WooCommerceUnavailable) as exc:
            logger.warning("WooCommerce categories request failed, product image fallback is limited: %s", exc)
            return {}

        result: dict[int, dict[str, Any]] = {}
        for category in categories:
            if not isinstance(category, dict):
                continue
            try:
                category_id = int(category.get("id"))
            except (TypeError, ValueError):
                continue
            result[category_id] = category

        return result

    async def _fetch_categories_page(self, client: httpx.AsyncClient, page: int) -> tuple[list[dict[str, Any]], int]:
        response = await client.get(
            f"{self.base_url}/products/categories",
            params={"per_page": 100, "page": page},
        )
        if response.status_code >= 400:
            raise WooCommerceUnavailable(f"WooCommerce categories request failed: {response.status_code}")

        try:
            total_pages = int(response.headers.get("X-WP-TotalPages", "1"))
        except ValueError:
            total_pages = 1

        payload = response.json()
        if not isinstance(payload, list):
            raise WooCommerceUnavailable("WooCommerce categories response is not a list")

        return payload, total_pages

    def _map_product(self, product: dict[str, Any], categories_by_id: dict[int, dict[str, Any]]) -> dict[str, Any]:
        product_id = int(product.get("id") or 0)
        category = _product_primary_category(product)
        image_urls = _image_urls(product, categories_by_id)
        image_url = image_urls[0] if image_urls else ""

        prices = product.get("prices") if isinstance(product.get("prices"), dict) else {}
        price = _to_int_price(prices.get("price"))
        description = _clean_html(product.get("short_description") or product.get("description") or "")
        stock = product.get("stock_availability") if isinstance(product.get("stock_availability"), dict) else {}

        return {
            "id": product_id,
            "category_id": category["id"],
            "name": str(product.get("name") or "Товар Stunt Tech"),
            "price": price,
            "description": description,
            "image_url": image_url,
            "in_stock": bool(product.get("is_in_stock")),
            "category": category,
            "sku": product.get("sku") or None,
            "source": "woocommerce",
            "source_url": product.get("permalink") or None,
            "stock_text": stock.get("text") or None,
            "gallery_urls": image_urls,
        }

    def _map_bike(self, product: dict[str, Any], bike_type: str, categories_by_id: dict[int, dict[str, Any]]) -> dict[str, Any]:
        product_id = int(product.get("id") or 0)
        bike_images = []
        for index, image_url in enumerate(_image_urls(product, categories_by_id)):
            bike_images.append(
                {
                    "id": product_id * 100 + index,
                    "image_url": image_url,
                    "is_main": index == 0,
                }
            )

        prices = product.get("prices") if isinstance(product.get("prices"), dict) else {}
        original_name = str(product.get("name") or "Мотоцикл Stunt Tech")

        return {
            "id": WP_BIKE_ID_OFFSET + product_id,
            "name": _clean_bike_name(original_name),
            "price": _to_int_price(prices.get("price")),
            "description": _clean_html(product.get("short_description") or product.get("description") or ""),
            "bike_type": bike_type,
            "specs": "Колёса: По комплектации" if bike_type == "PITBIKE" else "Колёса: 17/17",
            "pit_configs": DEFAULT_WOO_PIT_CONFIGS if bike_type == "PITBIKE" else None,
            "has_pts": _has_pts(product),
            "in_stock": bool(product.get("is_in_stock")),
            "frame_type_id": None,
            "frame_type_name": _infer_frame_type_name(original_name),
            "images": bike_images,
        }


def _to_int_price(value: Any) -> int:
    if value is None:
        return 0
    try:
        return int(float(str(value).replace(",", ".")))
    except (TypeError, ValueError):
        logger.warning("Cannot parse WooCommerce price: %r", value)
        return 0


def _clean_html(value: str) -> str:
    text = html.unescape(_TAG_RE.sub(" ", value))
    text = _SPACE_RE.sub(" ", text).strip()
    return text[:500] if text else ""


def _product_category_text(product: dict[str, Any]) -> str:
    chunks: list[str] = []

    categories = product.get("categories") if isinstance(product.get("categories"), list) else []
    for category in categories:
        if not isinstance(category, dict):
            continue
        chunks.append(str(category.get("name") or ""))
        chunks.append(str(category.get("slug") or ""))

    return " ".join(chunks).casefold()


def _product_primary_category(product: dict[str, Any]) -> dict[str, Any]:
    categories = product.get("categories") if isinstance(product.get("categories"), list) else []
    clean_categories = [category for category in categories if isinstance(category, dict)]
    if not clean_categories:
        return {"id": UNCATEGORIZED_CATEGORY_ID, "name": "Разное"}

    category = clean_categories[-1]
    category_id = category.get("id")
    try:
        category_id = int(category_id)
    except (TypeError, ValueError):
        category_id = UNCATEGORIZED_CATEGORY_ID

    return {
        "id": category_id,
        "name": str(category.get("name") or "Разное"),
    }


def _image_urls(product: dict[str, Any], categories_by_id: dict[int, dict[str, Any]] | None = None) -> list[str]:
    urls: list[str] = []
    images = product.get("images") if isinstance(product.get("images"), list) else []
    for image in images:
        if not isinstance(image, dict):
            continue
        for key in ("src", "thumbnail"):
            value = image.get(key)
            if value:
                urls.append(str(value))

        srcset = str(image.get("srcset") or "")
        if srcset:
            for item in srcset.split(","):
                url = item.strip().split(" ")[0]
                if url:
                    urls.append(url)

    for html_field in (product.get("short_description"), product.get("description")):
        if not isinstance(html_field, str):
            continue
        urls.extend(_IMG_RE.findall(html_field))

    if not urls and categories_by_id:
        urls.extend(_category_image_urls(product, categories_by_id))

    unique_urls: list[str] = []
    seen: set[str] = set()
    for url in urls:
        clean_url = html.unescape(url).strip()
        if not clean_url or clean_url in seen:
            continue
        seen.add(clean_url)
        unique_urls.append(clean_url)

    return unique_urls


def _category_image_urls(product: dict[str, Any], categories_by_id: dict[int, dict[str, Any]]) -> list[str]:
    urls: list[str] = []
    categories = product.get("categories") if isinstance(product.get("categories"), list) else []
    visited: set[int] = set()

    def append_category_images(category_id: int) -> None:
        while category_id and category_id not in visited:
            visited.add(category_id)
            category = categories_by_id.get(category_id)
            if not category:
                return

            image = category.get("image") if isinstance(category.get("image"), dict) else {}
            for key in ("src", "thumbnail"):
                value = image.get(key)
                if value:
                    urls.append(str(value))

            srcset = str(image.get("srcset") or "")
            if srcset:
                for item in srcset.split(","):
                    url = item.strip().split(" ")[0]
                    if url:
                        urls.append(url)

            try:
                category_id = int(category.get("parent") or 0)
            except (TypeError, ValueError):
                return

    for category in reversed(categories):
        if not isinstance(category, dict):
            continue
        try:
            append_category_images(int(category.get("id")))
        except (TypeError, ValueError):
            continue

    return urls


def _bike_type(product: dict[str, Any]) -> str | None:
    category_text = _product_category_text(product)
    product_name = str(product.get("name") or "").casefold()

    if "питбайки под стант" in category_text or "pitbajki-pod-stant" in category_text:
        return "PITBIKE"

    if ("питбайки" in category_text or "pitbajki" in category_text) and "stunt" in product_name:
        return "PITBIKE"

    if any(hint in product_name for hint in PITBIKE_HINTS) and "stunt" in product_name:
        return "PITBIKE"

    if "мотоциклы stunt" in category_text or "motocikly-stunt-motard" in category_text:
        return "BIG_BIKE"

    if ("motard" in product_name or "stunt edition" in product_name) and (
        "мотоцикл" in product_name or "regulmoto" in product_name or "kayo k1" in product_name or "progasi" in product_name
    ):
        return "BIG_BIKE"

    return None


def _has_pts(product: dict[str, Any]) -> bool:
    text = " ".join(
        [
            str(product.get("name") or ""),
            str(product.get("slug") or ""),
            _product_category_text(product),
            _clean_html(product.get("short_description") or ""),
        ]
    ).casefold()
    return any(hint in text for hint in PTS_HINTS)


def _clean_bike_name(name: str) -> str:
    text = html.unescape(name)
    text = re.sub(r"\s+(?:с|c)\s+птс\b", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\b(?:с|c)\s+птс\s+", "", text, flags=re.IGNORECASE)
    text = _SPACE_RE.sub(" ", text).strip(" /-")
    return text


def _infer_frame_type_name(name: str) -> str | None:
    text = name.casefold()
    if "kayo k1" in text:
        return "K5"
    if "gto short max" in text or "progasi" in text:
        return "K10"
    if "gto short" in text:
        return "K8"
    if "athlete" in text or "sport-003" in text or "holeshot" in text:
        return "Husqvarna"
    if "regulmoto" in text or "regul moto" in text:
        return "Regulmoto Pro"
    return "Regulmoto Pro"
