from datetime import date, timedelta
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..models import CategoriaHabitacion, TarifaDisponibilidadDiaria
from ..schemas import (
    CategoriaDisponible,
    CategoriaNoDisponible,
    DisponibilidadResponse,
    NocheDesglose,
)
from ..validation import validar_fechas_y_huespedes

router = APIRouter()


@router.get("/api/disponibilidad", response_model=DisponibilidadResponse)
async def consultar_disponibilidad(
    id_hotel: int = Query(...),
    fecha_entrada: date = Query(...),
    fecha_salida: date = Query(...),
    huespedes: int = Query(...),
    session: AsyncSession = Depends(get_session),
) -> DisponibilidadResponse:
    validar_fechas_y_huespedes(fecha_entrada, fecha_salida, huespedes)

    noches = (fecha_salida - fecha_entrada).days
    fechas_estancia = [fecha_entrada + timedelta(days=i) for i in range(noches)]

    categorias_result = await session.execute(
        select(CategoriaHabitacion).where(
            CategoriaHabitacion.id_hotel == id_hotel,
            CategoriaHabitacion.capacidad_maxima >= huespedes,
        )
    )
    categorias = categorias_result.scalars().all()

    disponibles: List[CategoriaDisponible] = []
    no_disponibles: List[CategoriaNoDisponible] = []

    for categoria in categorias:
        tarifas_result = await session.execute(
            select(TarifaDisponibilidadDiaria)
            .where(
                TarifaDisponibilidadDiaria.id_hotel == id_hotel,
                TarifaDisponibilidadDiaria.id_categoria_habitacion
                == categoria.id_categoria_habitacion,
                TarifaDisponibilidadDiaria.fecha >= fecha_entrada,
                TarifaDisponibilidadDiaria.fecha < fecha_salida,
            )
            .order_by(TarifaDisponibilidadDiaria.fecha)
        )
        tarifas = tarifas_result.scalars().all()
        tarifas_por_fecha = {t.fecha: t for t in tarifas}

        # A missing rate row for any night in the range means the category
        # can't be offered for this stay at all.
        if len(tarifas_por_fecha) != noches:
            continue
        if any(t.habitaciones_disponibles <= 0 or t.cierre_ventas for t in tarifas):
            continue

        primera_noche = tarifas_por_fecha[fecha_entrada]
        if noches < primera_noche.minimo_noches:
            no_disponibles.append(
                CategoriaNoDisponible(
                    id_categoria_habitacion=categoria.id_categoria_habitacion,
                    motivo="minimo_noches",
                    minimo_requerido=primera_noche.minimo_noches,
                )
            )
            continue

        total_estancia = sum(
            (tarifas_por_fecha[f].precio_venta for f in fechas_estancia), Decimal("0")
        )
        disponibles.append(
            CategoriaDisponible(
                id_categoria_habitacion=categoria.id_categoria_habitacion,
                nombre=categoria.nombre,
                total_estancia=total_estancia,
                desglose_noches=[
                    NocheDesglose(fecha=f, precio=tarifas_por_fecha[f].precio_venta)
                    for f in fechas_estancia
                ],
            )
        )

    return DisponibilidadResponse(
        id_hotel=id_hotel,
        fecha_entrada=fecha_entrada,
        fecha_salida=fecha_salida,
        noches=noches,
        disponibles=disponibles,
        no_disponibles=no_disponibles,
    )
