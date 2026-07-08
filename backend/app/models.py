import uuid
from datetime import date as date_
from datetime import datetime
from decimal import Decimal

from sqlalchemy import TIMESTAMP, Boolean, Date, ForeignKey, Integer, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class CategoriaHabitacion(Base):
    __tablename__ = "categorias_habitacion"

    id_categoria_habitacion: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_hotel: Mapped[int] = mapped_column(Integer, nullable=False)
    nombre: Mapped[str] = mapped_column(Text, nullable=False)
    capacidad_maxima: Mapped[int] = mapped_column(Integer, nullable=False)


class TarifaDisponibilidadDiaria(Base):
    __tablename__ = "tarifas_disponibilidad_diaria"

    id_hotel: Mapped[int] = mapped_column(Integer, primary_key=True)
    fecha: Mapped[date_] = mapped_column(Date, primary_key=True)
    id_categoria_habitacion: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("categorias_habitacion.id_categoria_habitacion"),
        primary_key=True,
    )
    habitaciones_disponibles: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_venta: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    cierre_ventas: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    minimo_noches: Mapped[int] = mapped_column(Integer, nullable=False, default=1)


class Reserva(Base):
    __tablename__ = "reservas"

    id_reserva: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    id_hotel: Mapped[int] = mapped_column(Integer, nullable=False)
    id_categoria_habitacion: Mapped[int] = mapped_column(Integer, nullable=False)
    nombre_huesped: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    telefono: Mapped[str] = mapped_column(Text, nullable=False)
    fecha_entrada: Mapped[date_] = mapped_column(Date, nullable=False)
    fecha_salida: Mapped[date_] = mapped_column(Date, nullable=False)
    huespedes: Mapped[int] = mapped_column(Integer, nullable=False)
    total_estancia: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    estatus: Mapped[str] = mapped_column(Text, nullable=False, default="confirmada")
    creada_en: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
