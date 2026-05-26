from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, Response, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from auth import create_access_token, verify_admin_credentials, verify_token
from config import get_settings
from database import get_db
from schemas import (
    BikeCreate,
    BikeOut,
    BikeUpdate,
    FrameTypeOut,
    GraphicCreate,
    GraphicOptionAdminOut,
    GraphicUpdate,
    ItemCreate,
    ItemKind,
    ItemUpdate,
    LoginData,
    MessageResponse,
    PartCategoryOut,
    TelegramSettingsOut,
    TelegramSettingsUpdate,
    TelegramTestMessage,
    TokenResponse,
    UploadResponse,
)
from services.admin import AdminService
from services.exceptions import NotFoundError, ValidationError
from services.settings import AdminSettingsService
from notifications import OrderNotification, send_telegram_notification


router = APIRouter()
settings = get_settings()

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def get_admin_service(db: AsyncSession = Depends(get_db)) -> AdminService:
    return AdminService(db)


def get_admin_settings_service(db: AsyncSession = Depends(get_db)) -> AdminSettingsService:
    return AdminSettingsService(db)


def _admin_dependency(admin: str = Depends(verify_token)) -> str:
    return admin


def _set_cache_header(response: Response, cache_status: str) -> None:
    response.headers["X-Cache"] = cache_status


@router.post("/admin/login", response_model=TokenResponse, tags=["Admin: Auth"])
async def login_admin(data: LoginData):
    username = data.username.strip()
    password = data.password.strip()
    if verify_admin_credentials(username, password):
        return TokenResponse(access_token=create_access_token(data={"sub": username}))
    raise HTTPException(status_code=401, detail="Неверный логин или пароль")


@router.post("/admin/upload", response_model=UploadResponse, tags=["Admin: Uploads"])
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    admin: str = Depends(_admin_dependency),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Разрешены только JPG, PNG, WebP и GIF")

    content = await file.read(settings.max_upload_bytes + 1)
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Файл слишком большой")

    settings.uploads_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{ALLOWED_IMAGE_TYPES[file.content_type]}"
    file_path = settings.uploads_dir / filename
    file_path.write_bytes(content)

    if settings.public_backend_url:
        url = f"{settings.public_backend_url}/static/uploads/{filename}"
    else:
        url = str(request.url_for("uploads", path=filename))
    return UploadResponse(url=url)


@router.get("/admin/settings/telegram", response_model=TelegramSettingsOut, tags=["Admin: Settings"])
async def get_telegram_settings(
    service: AdminSettingsService = Depends(get_admin_settings_service),
    admin: str = Depends(_admin_dependency),
):
    return TelegramSettingsOut(
        bot_configured=service.is_telegram_bot_configured(),
        recipients=await service.get_telegram_recipients(),
    )


@router.put("/admin/settings/telegram", response_model=TelegramSettingsOut, tags=["Admin: Settings"])
async def update_telegram_settings(
    data: TelegramSettingsUpdate,
    service: AdminSettingsService = Depends(get_admin_settings_service),
    admin: str = Depends(_admin_dependency),
):
    recipients = await service.set_telegram_recipients(data.recipients)
    return TelegramSettingsOut(
        bot_configured=service.is_telegram_bot_configured(),
        recipients=recipients,
    )


@router.post("/admin/settings/telegram/test", response_model=MessageResponse, tags=["Admin: Settings"])
async def test_telegram_settings(
    data: TelegramTestMessage,
    service: AdminSettingsService = Depends(get_admin_settings_service),
    admin: str = Depends(_admin_dependency),
):
    recipients = await service.get_telegram_recipients()
    await send_telegram_notification(
        OrderNotification(
            customer_name="Stunt Tech",
            phone="test",
            telegram=None,
            bike_name=data.message or "Тест уведомлений",
            graphics="Проверка Telegram-бота",
            accessories=[],
            total_price=0,
        ),
        recipients=recipients,
    )
    return MessageResponse(message="Тестовое уведомление отправлено")


@router.get("/admin/frame_types", response_model=List[FrameTypeOut], tags=["Admin: References"])
async def get_frame_types(
    response: Response,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    payload, cache_status = await service.list_frame_types()
    _set_cache_header(response, cache_status)
    return payload


@router.get("/admin/categories", response_model=List[PartCategoryOut], tags=["Admin: References"])
async def get_categories(
    response: Response,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    payload, cache_status = await service.list_part_categories()
    _set_cache_header(response, cache_status)
    return payload


@router.get("/admin/graphics", response_model=List[GraphicOptionAdminOut], tags=["Admin: Graphics"])
async def get_all_graphics(
    response: Response,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    payload, cache_status = await service.list_graphics()
    _set_cache_header(response, cache_status)
    return payload


@router.post("/bikes", response_model=BikeOut, tags=["Admin: Bikes"])
async def create_bike(
    bike_in: BikeCreate,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    return await service.create_bike(bike_in)


@router.put("/bikes/{bike_id}", response_model=MessageResponse, tags=["Admin: Bikes"])
async def update_bike(
    bike_id: int,
    data: BikeUpdate,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    try:
        await service.update_bike(bike_id, data)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.detail)

    return MessageResponse(message="Техника обновлена")


@router.delete("/bikes/{bike_id}", response_model=MessageResponse, tags=["Admin: Bikes"])
async def delete_bike(
    bike_id: int,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    try:
        await service.delete_bike(bike_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.detail)

    return MessageResponse(message="Техника удалена")


@router.post("/graphics", response_model=MessageResponse, tags=["Admin: Graphics"])
async def create_graphic(
    data: GraphicCreate,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    await service.create_graphic(data)
    return MessageResponse(message="Графика создана")


@router.put("/graphics/{graphic_id}", response_model=MessageResponse, tags=["Admin: Graphics"])
async def update_graphic(
    graphic_id: int,
    data: GraphicUpdate,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    try:
        await service.update_graphic(graphic_id, data)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.detail)

    return MessageResponse(message="Графика обновлена")


@router.delete("/graphics/{graphic_id}", response_model=MessageResponse, tags=["Admin: Graphics"])
async def delete_graphic(
    graphic_id: int,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    try:
        await service.delete_graphic(graphic_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.detail)

    return MessageResponse(message="Графика удалена")


@router.post("/items/{item_kind}", response_model=MessageResponse, tags=["Admin: Items"])
async def create_item(
    item_kind: ItemKind,
    item: ItemCreate,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    try:
        await service.create_item(item_kind, item)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=exc.detail)

    return MessageResponse(message="Объект создан")


@router.put("/items/{item_kind}/{item_id}", response_model=MessageResponse, tags=["Admin: Items"])
async def update_item(
    item_kind: ItemKind,
    item_id: int,
    data: ItemUpdate,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    try:
        await service.update_item(item_kind, item_id, data)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.detail)

    return MessageResponse(message="Объект обновлен")


@router.delete("/items/{item_kind}/{item_id}", response_model=MessageResponse, tags=["Admin: Items"])
async def delete_item(
    item_kind: ItemKind,
    item_id: int,
    service: AdminService = Depends(get_admin_service),
    admin: str = Depends(_admin_dependency),
):
    try:
        await service.delete_item(item_kind, item_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.detail)

    return MessageResponse(message="Объект удален")
