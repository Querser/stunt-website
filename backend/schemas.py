from pydantic import BaseModel, ConfigDict, Field
from typing import Any, Dict, List, Literal, Optional
from models import BikeType


class MessageResponse(BaseModel):
    message: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UploadResponse(BaseModel):
    url: str


class CreatedOrderResponse(MessageResponse):
    order_id: int
    payment_url: Optional[str] = None
    payment_invoice_id: Optional[str] = None
    payment_form: Optional[Dict[str, Any]] = None


class PaymentStatusOut(BaseModel):
    order_id: int
    status: str
    is_paid: bool
    payment_method: Optional[str] = None
    payment_provider: Optional[str] = None
    payment_id: Optional[str] = None


class PaymentOptionsOut(BaseModel):
    paykeeper_enabled: bool
    installment_enabled: bool


class BikeImageOut(BaseModel):
    id: int
    image_url: str
    is_main: bool
    model_config = ConfigDict(from_attributes=True)


class FrameTypeOut(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)


class BikeOut(BaseModel):
    id: int
    name: str
    price: int
    description: Optional[str]
    bike_type: BikeType
    specs: Optional[str]
    pit_configs: Optional[List[Dict[str, Any]]] = None
    has_pts: bool
    in_stock: bool
    frame_type_id: Optional[int]
    images: List[BikeImageOut] = []
    model_config = ConfigDict(from_attributes=True)

class GraphicOptionOut(BaseModel):
    id: int
    frame_type_id: int
    name: str
    price_add: int
    image_overlay_url: str
    model_config = ConfigDict(from_attributes=True)


class GraphicOptionAdminOut(GraphicOptionOut):
    frame_type: Optional[FrameTypeOut] = None


class AccessoryOut(BaseModel):
    id: int
    name: str
    price: int
    description: Optional[str]
    image_url: str
    in_stock: bool
    model_config = ConfigDict(from_attributes=True)

class PartCategoryOut(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class PartOut(BaseModel):
    id: int
    category_id: int
    name: str
    price: int
    description: Optional[str]
    image_url: str
    in_stock: bool
    category: PartCategoryOut
    sku: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    stock_text: Optional[str] = None
    gallery_urls: List[str] = []
    model_config = ConfigDict(from_attributes=True)


OrderStatus = Literal["NEW", "PAID", "BUILDING", "COMPLETED", "CANCELLED"]
ItemKind = Literal["accessory", "part"]


class OrderOut(BaseModel):
    id: int
    customer_name: str
    phone: str
    telegram: Optional[str]
    contact_method: Optional[str] = None
    comment: Optional[str] = None
    payment_method: Optional[str] = None
    total_price: int
    status: OrderStatus
    configuration: Dict[str, Any]
    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=5, max_length=20)
    telegram: Optional[str] = Field(default=None, max_length=100)
    contact_method: Optional[str] = Field(default=None, max_length=50)
    comment: Optional[str] = Field(default=None, max_length=1000)
    payment_method: Optional[str] = Field(default=None, max_length=50)
    total_price: int = Field(ge=0)
    configuration: Dict[str, Any]
    model_config = ConfigDict(extra="forbid")


class LoginData(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=200)
    model_config = ConfigDict(extra="forbid")


class TelegramSettingsOut(BaseModel):
    bot_configured: bool
    recipients: List[str]


class TelegramSettingsUpdate(BaseModel):
    recipients: List[str] = Field(default_factory=list, max_length=50)
    model_config = ConfigDict(extra="forbid")


class TelegramTestMessage(BaseModel):
    message: Optional[str] = Field(default=None, max_length=500)
    model_config = ConfigDict(extra="forbid")


class OrderUpdate(BaseModel):
    customer_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    phone: Optional[str] = Field(default=None, min_length=5, max_length=20)
    telegram: Optional[str] = Field(default=None, max_length=100)
    contact_method: Optional[str] = Field(default=None, max_length=50)
    comment: Optional[str] = Field(default=None, max_length=1000)
    payment_method: Optional[str] = Field(default=None, max_length=50)
    total_price: Optional[int] = Field(default=None, ge=0)
    configuration: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(extra="forbid")


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    model_config = ConfigDict(extra="forbid")


class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: int = Field(ge=0)
    description: Optional[str] = Field(default=None, max_length=500)
    image_url: str = Field(min_length=1, max_length=500)
    category_id: Optional[int] = None
    model_config = ConfigDict(extra="forbid")


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    price: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = Field(default=None, max_length=500)
    image_url: Optional[str] = Field(default=None, min_length=1, max_length=500)
    in_stock: Optional[bool] = None
    category_id: Optional[int] = None
    model_config = ConfigDict(extra="forbid")


class GraphicCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price_add: int = Field(default=10000, ge=0)
    image_overlay_url: str = Field(min_length=1, max_length=500)
    frame_type_id: int
    model_config = ConfigDict(extra="forbid")


class GraphicUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    price_add: Optional[int] = Field(default=None, ge=0)
    image_overlay_url: Optional[str] = Field(default=None, min_length=1, max_length=500)
    frame_type_id: Optional[int] = None
    model_config = ConfigDict(extra="forbid")


class BikeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: int = Field(ge=0)
    description: Optional[str] = Field(default=None, max_length=1000)
    specs: Optional[str] = Field(default=None, max_length=2000)
    pit_configs: Optional[List[Dict[str, Any]]] = None
    bike_type: BikeType
    has_pts: bool = False
    in_stock: bool = True
    frame_type_id: Optional[int] = None
    image_url: Optional[str] = Field(default=None, max_length=500)
    gallery_urls: Optional[List[str]] = None
    model_config = ConfigDict(extra="forbid")


class BikeUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    price: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = Field(default=None, max_length=1000)
    specs: Optional[str] = Field(default=None, max_length=2000)
    pit_configs: Optional[List[Dict[str, Any]]] = None
    bike_type: Optional[BikeType] = None
    has_pts: Optional[bool] = None
    in_stock: Optional[bool] = None
    frame_type_id: Optional[int] = None
    image_url: Optional[str] = Field(default=None, max_length=500)
    gallery_urls: Optional[List[str]] = None
    model_config = ConfigDict(extra="forbid")
