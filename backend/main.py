from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import inspect, select, text

from cache import close_redis, ping_redis
from config import get_settings
from database import engine, AsyncSessionLocal
from database import get_db
from routers import router
from models import Base, FrameType, Bike, BikeType, Accessory, BikeImage, Part, PartCategory, GraphicOption
from routes.payments import process_vanta_webhook_payload, read_vanta_payload

settings = get_settings()


DEFAULT_PIT_CONFIGS = [
    {"name": "Lite", "wheels": "12/12", "price_add": 0},
    {"name": "Lite", "wheels": "14/14", "price_add": 5000},
    {"name": "Pro", "wheels": "12/12", "price_add": 15000},
]


async def ensure_schema():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        def migrate(sync_conn):
            inspector = inspect(sync_conn)
            tables = set(inspector.get_table_names())

            if "bikes" in tables:
                bike_cols = {col["name"] for col in inspector.get_columns("bikes")}
                if "specs" not in bike_cols:
                    sync_conn.execute(text("ALTER TABLE bikes ADD COLUMN specs VARCHAR(2000)"))
                if "pit_configs" not in bike_cols:
                    sync_conn.execute(text("ALTER TABLE bikes ADD COLUMN pit_configs JSON"))

            if "orders" in tables:
                order_cols = {col["name"] for col in inspector.get_columns("orders")}
                if "contact_method" not in order_cols:
                    sync_conn.execute(text("ALTER TABLE orders ADD COLUMN contact_method VARCHAR(50)"))
                if "comment" not in order_cols:
                    sync_conn.execute(text("ALTER TABLE orders ADD COLUMN comment VARCHAR(1000)"))
                if "payment_method" not in order_cols:
                    sync_conn.execute(text("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50)"))

        await conn.run_sync(migrate)


async def get_or_create(db, model, name: str, **kwargs):
    item = (await db.execute(select(model).where(model.name == name))).scalars().first()
    if item:
        return item
    item = model(name=name, **kwargs)
    db.add(item)
    await db.flush()
    return item


async def init_db_data():
    await ensure_schema()

    async with AsyncSessionLocal() as db:
        frames = {
            name: await get_or_create(db, FrameType, name)
            for name in ["K5", "K8", "K10", "Husqvarna", "Regulmoto Pro"]
        }

        categories = {
            name: await get_or_create(db, PartCategory, name)
            for name in ["Дублеры", "Бугели", "Лёгкий выжим", "Колёса", "Фары", "Подсветки"]
        }

        accessories = [
            ("Дублер", 15000, "Второй тормоз под левую руку для контроля в вилли.", "https://picsum.photos/seed/stunt-dubler/640/480"),
            ("Лёгкий выжим", 4500, "Мягкий ход сцепления для долгих тренировок.", "https://picsum.photos/seed/stunt-clutch/640/480"),
            ("Бугель", 12000, "Защита хвоста и точка опоры для стант-трюков.", "https://picsum.photos/seed/stunt-cage/640/480"),
            ("Фары RGB", 8000, "Яркий световой комплект с RGB-эффектами.", "https://picsum.photos/seed/stunt-rgb/640/480"),
            ("Подсветка седла", 3000, "Акцентная подсветка зоны седла.", "https://picsum.photos/seed/stunt-seat-light/640/480"),
            ("Защиты в руль", 2500, "Защита рук и рычагов при падениях.", "https://picsum.photos/seed/stunt-bars/640/480"),
            ("Слайдеры на оси", 3500, "Сменные слайдеры для защиты осей.", "https://picsum.photos/seed/stunt-sliders/640/480"),
        ]
        for name, price, description, image_url in accessories:
            item = await get_or_create(db, Accessory, name, price=price, description=description, image_url=image_url)
            if not item.description:
                item.description = description

        if not settings.woocommerce_enabled:
            parts = [
                ("Дублер V2 Neo", categories["Дублеры"], 15000, "Фирменный дублер Stunt Tech под городские и площадочные тренировки.", "https://picsum.photos/seed/part-dubler/640/480"),
                ("Бугель Titanium", categories["Бугели"], 12000, "Жесткий бугель с усиленными точками крепления.", "https://picsum.photos/seed/part-cage/640/480"),
                ("Лёгкий выжим ST", categories["Лёгкий выжим"], 4500, "Собственная ручка легкого выжима.", "https://picsum.photos/seed/part-clutch/640/480"),
                ("Комплект колёс 17/17", categories["Колёса"], 32000, "Колёса под стант-сборки больших мотоциклов.", "https://picsum.photos/seed/part-wheels/640/480"),
                ("Фара RGB Strip", categories["Фары"], 8000, "RGB-фары для ночных выездов и шоу.", "https://picsum.photos/seed/part-lights/640/480"),
                ("Подсветка седла ST", categories["Подсветки"], 3000, "Компактная подсветка седла с влагозащитой.", "https://picsum.photos/seed/part-seat-light/640/480"),
            ]
            for name, category, price, description, image_url in parts:
                await get_or_create(
                    db,
                    Part,
                    name,
                    category_id=category.id,
                    price=price,
                    description=description,
                    image_url=image_url,
                )

        bikes = [
            ("Kayo TT 125EM (с электростартером)", BikeType.PITBIKE, False, None, 110000, "Двигатель: 125cc\nСтартер: Электростартер\nКолёса: По комплектации"),
            ("Kayo TT 140EM (с электростартером)", BikeType.PITBIKE, False, None, 125000, "Двигатель: 140cc\nСтартер: Электростартер\nКолёса: По комплектации"),
            ("Kayo TT125 (без стартера)", BikeType.PITBIKE, False, None, 99000, "Двигатель: 125cc\nСтартер: Кикстартер\nКолёса: По комплектации"),
            ("BSE PH 125", BikeType.PITBIKE, False, None, 105000, "Двигатель: 125cc\nКолёса: По комплектации"),
            ("BSE PH 150", BikeType.PITBIKE, False, None, 125000, "Двигатель: 150cc\nКолёса: По комплектации"),
            ("BSE MX 125", BikeType.PITBIKE, False, None, 115000, "Двигатель: 125cc\nКолёса: По комплектации"),
            ("BSE EX 125", BikeType.PITBIKE, False, None, 118000, "Двигатель: 125cc\nКолёса: По комплектации"),
            ("BSE MXS 125", BikeType.PITBIKE, False, None, 120000, "Двигатель: 125cc\nКолёса: По комплектации"),
            ("STG FS 125", BikeType.PITBIKE, False, None, 110000, "Двигатель: 125cc\nКолёса: По комплектации"),
            ("STG FS 140", BikeType.PITBIKE, False, None, 128000, "Двигатель: 140cc\nКолёса: По комплектации"),
            ("Kayo K1 250", BikeType.BIG_BIKE, False, "K5", 250000, "Колёса: 17/17\nДвигатель: 250cc"),
            ("GTO Short 300", BikeType.BIG_BIKE, False, "K8", 275000, "Колёса: 17/17\nДвигатель: 300cc"),
            ("GTO Short MAX 300", BikeType.BIG_BIKE, False, "K10", 295000, "Колёса: 17/17\nДвигатель: 300cc"),
            ("Regulmoto Crosstrek 350", BikeType.BIG_BIKE, True, "Regulmoto Pro", 345000, "Колёса: 17/17\nДвигатель: 350cc"),
            ("Regulmoto Six Days 350", BikeType.BIG_BIKE, True, "Regulmoto Pro", 355000, "Колёса: 17/17\nДвигатель: 350cc"),
            ("Regulmoto Legend 300", BikeType.BIG_BIKE, True, "Regulmoto Pro", 310000, "Колёса: 17/17\nДвигатель: 300cc"),
            ("Regulmoto HolShot 300", BikeType.BIG_BIKE, True, "Regulmoto Pro", 315000, "Колёса: 17/17\nДвигатель: 300cc"),
            ("Regulmoto Athlete 300 5Gear", BikeType.BIG_BIKE, True, "Husqvarna", 305000, "Колёса: 17/17\nДвигатель: 300cc\nКПП: 5 передач"),
            ("Regulmoto Athlete 300 PRO 4Valve 6gear", BikeType.BIG_BIKE, True, "Husqvarna", 335000, "Колёса: 17/17\nДвигатель: 300cc\nКПП: 6 передач"),
            ("Regulmoto Athlete 300 Pro", BikeType.BIG_BIKE, True, "Husqvarna", 325000, "Колёса: 17/17\nДвигатель: 300cc"),
            ("Regulmoto Athlete 300 Pro 4Valve 6gear", BikeType.BIG_BIKE, True, "Husqvarna", 340000, "Колёса: 17/17\nДвигатель: 300cc\nКПП: 6 передач"),
        ]

        for name, bike_type, has_pts, frame_name, price, specs in bikes:
            bike = (await db.execute(select(Bike).where(Bike.name == name))).scalars().first()
            if not bike:
                bike = Bike(
                    name=name,
                    price=price,
                    description="Описание можно заменить в админке.",
                    specs=specs,
                    pit_configs=DEFAULT_PIT_CONFIGS if bike_type == BikeType.PITBIKE else None,
                    bike_type=bike_type,
                    has_pts=has_pts,
                    in_stock=True,
                    frame_type_id=frames[frame_name].id if frame_name else None,
                )
                db.add(bike)
                await db.flush()
            else:
                if not bike.specs:
                    bike.specs = specs
                if bike_type == BikeType.PITBIKE and not bike.pit_configs:
                    bike.pit_configs = DEFAULT_PIT_CONFIGS
                if frame_name and not bike.frame_type_id:
                    bike.frame_type_id = frames[frame_name].id

            has_image = (await db.execute(select(BikeImage).where(BikeImage.bike_id == bike.id))).scalars().first()
            if not has_image:
                db.add(BikeImage(bike_id=bike.id, image_url=f"https://picsum.photos/seed/{bike.id}-bike/1200/900", is_main=True))

        graphics = [
            ("Neon Cyan", 10000),
            ("Hot Magenta", 10000),
            ("Acid Race", 10000),
            ("Blackout", 10000),
        ]
        for frame in frames.values():
            for name, price_add in graphics:
                exists = (await db.execute(
                    select(GraphicOption).where(
                        GraphicOption.frame_type_id == frame.id,
                        GraphicOption.name == name,
                    )
                )).scalars().first()
                if not exists:
                    db.add(GraphicOption(
                        frame_type_id=frame.id,
                        name=name,
                        price_add=price_add,
                        image_overlay_url=f"https://picsum.photos/seed/{frame.name}-{name}/1200/900",
                    ))

        await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_data()
    try:
        yield
    finally:
        await close_redis()

settings.uploads_dir.mkdir(parents=True, exist_ok=True)

tags_metadata = [
    {"name": "Bikes", "description": "Публичный каталог техники."},
    {"name": "Configurator", "description": "Графика и допы для конфигуратора."},
    {"name": "Parts", "description": "Публичный каталог собственных запчастей."},
    {"name": "Orders", "description": "Создание клиентских заявок."},
    {"name": "Payments", "description": "Платежные статусы, webhooks PayKeeper и рассрочки."},
    {"name": "Admin: Auth", "description": "Авторизация администратора."},
    {"name": "Admin: Uploads", "description": "Загрузка изображений в админке."},
    {"name": "Admin: References", "description": "Справочники для форм админки."},
    {"name": "Admin: Bikes", "description": "Управление техникой."},
    {"name": "Admin: Graphics", "description": "Управление вариантами графики."},
    {"name": "Admin: Items", "description": "Управление допами и запчастями."},
    {"name": "Admin: Orders", "description": "Просмотр и обработка заявок."},
    {"name": "Admin: Settings", "description": "Настройки уведомлений и интеграций."},
    {"name": "System", "description": "Служебные проверки состояния API."},
]

app = FastAPI(
    title="Stunt Tech API",
    version="2.0.0",
    lifespan=lifespan,
    openapi_tags=tags_metadata,
)

if settings.trusted_hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_hosts)

app.mount("/static/uploads", StaticFiles(directory=settings.uploads_dir), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def healthcheck():
    return {"status": "ok", "redis": "ok" if await ping_redis() else "unavailable"}


@app.api_route("/wc-api/vanta_credit_gateway/", methods=["GET", "POST"], tags=["Payments"])
async def legacy_vanta_webhook(
    request: Request,
    secret: str | None = None,
    db=Depends(get_db),
):
    payload = await read_vanta_payload(request)
    return await process_vanta_webhook_payload(payload, db, secret=secret)


app.include_router(router)
