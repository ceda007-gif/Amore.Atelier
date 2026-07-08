from datetime import date
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class NocheDesglose(BaseModel):
    fecha: date
    precio: Decimal


class CategoriaDisponible(BaseModel):
    id_categoria_habitacion: int
    nombre: str
    total_estancia: Decimal
    desglose_noches: List[NocheDesglose]


class CategoriaNoDisponible(BaseModel):
    id_categoria_habitacion: int
    motivo: str
    minimo_requerido: Optional[int] = None


class DisponibilidadResponse(BaseModel):
    id_hotel: int
    fecha_entrada: date
    fecha_salida: date
    noches: int
    disponibles: List[CategoriaDisponible]
    no_disponibles: List[CategoriaNoDisponible]


class ReservaRequest(BaseModel):
    id_hotel: int
    id_categoria_habitacion: int
    fecha_entrada: date
    fecha_salida: date
    huespedes: int
    nombre_huesped: str
    email: EmailStr
    telefono: str


class ReservaResponse(BaseModel):
    id_reserva: UUID
    estatus: str
    total_estancia: Decimal
    fecha_entrada: date
    fecha_salida: date


class ErrorResponse(BaseModel):
    error: str
    mensaje: str
