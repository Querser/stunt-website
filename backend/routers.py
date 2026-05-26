from fastapi import APIRouter

from routes.admin import router as admin_router
from routes.catalog import router as catalog_router
from routes.orders import router as orders_router
from routes.payments import router as payments_router


router = APIRouter(prefix="/api/v1")
router.include_router(catalog_router)
router.include_router(orders_router)
router.include_router(payments_router)
router.include_router(admin_router)
