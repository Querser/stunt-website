import enum
from typing import List, Optional
from sqlalchemy import String, Integer, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase): pass


class BikeType(str, enum.Enum):
    PITBIKE = "PITBIKE"
    BIG_BIKE = "BIG_BIKE"


class FrameType(Base):
    __tablename__ = "frame_types"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    bikes: Mapped[List["Bike"]] = relationship(back_populates="frame_type")
    graphics: Mapped[List["GraphicOption"]] = relationship(back_populates="frame_type")


class BikeImage(Base):
    __tablename__ = "bike_images"
    id: Mapped[int] = mapped_column(primary_key=True)
    bike_id: Mapped[int] = mapped_column(ForeignKey("bikes.id"))
    image_url: Mapped[str] = mapped_column(String(500))
    is_main: Mapped[bool] = mapped_column(Boolean, default=False)
    bike: Mapped["Bike"] = relationship(back_populates="images")


class Bike(Base):
    __tablename__ = "bikes"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    price: Mapped[int] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(String(1000))
    specs: Mapped[Optional[str]] = mapped_column(String(2000))
    pit_configs: Mapped[Optional[list[dict]]] = mapped_column(JSON, nullable=True)
    bike_type: Mapped[BikeType] = mapped_column(Enum(BikeType))
    has_pts: Mapped[bool] = mapped_column(Boolean, default=False)
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    frame_type_id: Mapped[Optional[int]] = mapped_column(ForeignKey("frame_types.id"))

    frame_type: Mapped[Optional["FrameType"]] = relationship(back_populates="bikes")
    images: Mapped[List["BikeImage"]] = relationship(back_populates="bike", cascade="all, delete-orphan")


class GraphicOption(Base):
    __tablename__ = "graphic_options"
    id: Mapped[int] = mapped_column(primary_key=True)
    frame_type_id: Mapped[int] = mapped_column(ForeignKey("frame_types.id"))
    name: Mapped[str] = mapped_column(String(100))
    price_add: Mapped[int] = mapped_column(Integer, default=10000)
    image_overlay_url: Mapped[str] = mapped_column(String(500))
    frame_type: Mapped["FrameType"] = relationship(back_populates="graphics")


class Accessory(Base):
    __tablename__ = "accessories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    price: Mapped[int] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(String(500))
    image_url: Mapped[str] = mapped_column(String(500))
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)


class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(20))
    telegram: Mapped[Optional[str]] = mapped_column(String(100))
    contact_method: Mapped[Optional[str]] = mapped_column(String(50))
    comment: Mapped[Optional[str]] = mapped_column(String(1000))
    payment_method: Mapped[Optional[str]] = mapped_column(String(50))
    total_price: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(50), default="NEW")
    configuration: Mapped[dict] = mapped_column(JSON)


class PartCategory(Base):
    __tablename__ = "part_categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))  # Бугели, Дублеры, Фары и тд

    parts: Mapped[List["Part"]] = relationship(back_populates="category")


class Part(Base):
    __tablename__ = "parts"
    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("part_categories.id"))
    name: Mapped[str] = mapped_column(String(100))
    price: Mapped[int] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(String(500))
    image_url: Mapped[str] = mapped_column(String(500))
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)

    category: Mapped["PartCategory"] = relationship(back_populates="parts")

class AdminUser(Base):
    __tablename__ = "admin_users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(200)) # Храним только хэши!


class AdminSetting(Base):
    __tablename__ = "admin_settings"
    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(100), unique=True)
    value: Mapped[dict] = mapped_column(JSON)
