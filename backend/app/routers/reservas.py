import logging
import uuid
from datetime import timedelta
from decimal import Decimal

from fastapi import APIRouter, BackgroundTasks
from sqlalchemy import select

from ..database import SessionLocal
from ..errors import APIError
from ..models import Reserva, TarifaDisponibilidadDiaria
from ..schemas import ReservaRequest, ReservaResponse
from ..validation import validar_campos_huesped, validar_fechas_y_huespedes
from ..webhooks import enviar_webhook_reserva

logger = logging.getLogger("reservas")

router = APIRouter()


@router.post("/api/reservar", response_model=ReservaResponse, status_code=201)
async def crear_reserva(
    payload: ReservaRequest, background_tasks: BackgroundTasks
) -> ReservaResponse:
    validar_fechas_y_huespedes(payload.fecha_entrada, payload.fecha_salida, payload.huespedes)
    validar_campos_huesped(payload.nombre_huesped, payload.telefono)

    noches = (payload.fecha_salida - payload.fecha_entrada).days
    fechas_estancia = [payload.fecha_entrada + timedelta(days=i) for i in range(noches)]

    id_reserva = uuid.uuid4()

    async with SessionLocal() as session:
        try:
            async with session.begin():
                # Lock every night's row for this category, ordered by fecha so
                # concurrent requests always acquire locks in the same order
                # and can never deadlock against each other.
                result = await session.execute(
                    select(TarifaDisponibilidadDiaria)
                    .where(
                        TarifaDisponibilidadDiaria.id_hotel == payload.id_hotel,
                        TarifaDisponibilidadDiaria.id_categoria_habitacion
                        == payload.id_categoria_habitacion,
                        TarifaDisponibilidadDiaria.fecha.in_(fechas_estancia),
                    )
                    .order_by(TarifaDisponibilidadDiaria.fecha)
                    .with_for_update()
                )
                tarifas = result.scalars().all()
                tarifas_por_fecha = {t.fecha: t for t in tarifas}

                if len(tarifas_por_fecha) != noches:
                    raise APIError(
                        409,
                        "sin_disponibilidad",
                        "No hay tarifa registrada para todas las noches solicitadas.",
                    )

                if any(
                    t.habitaciones_disponibles < 1 or t.cierre_ventas for t in tarifas
                ):
                    raise APIError(
                        409,
                        "sin_disponibilidad",
                        "No quedan habitaciones disponibles para el rango solicitado.",
                    )

                primera_noche = tarifas_por_fecha[payload.fecha_entrada]
                if noches < primera_noche.minimo_noches:
                    raise APIError(
                        409,
                        "minimo_noches",
                        f"Esta categoría requiere un mínimo de {primera_noche.minimo_noches} noches.",
                    )

                # Prices come from the locked rows, never from the client payload.
                total_estancia = sum(
                    (tarifas_por_fecha[f].precio_venta for f in fechas_estancia),
                    Decimal("0"),
                )

                session.add(
                    Reserva(
                        id_reserva=id_reserva,
                        id_hotel=payload.id_hotel,
                        id_categoria_habitacion=payload.id_categoria_habitacion,
                        nombre_huesped=payload.nombre_huesped,
                        email=payload.email,
                        telefono=payload.telefono,
                        fecha_entrada=payload.fecha_entrada,
                        fecha_salida=payload.fecha_salida,
                        huespedes=payload.huespedes,
                        total_estancia=total_estancia,
                        estatus="confirmada",
                    )
                )

                for fecha in fechas_estancia:
                    tarifas_por_fecha[fecha].habitaciones_disponibles -= 1
            # `session.begin()` committed here on clean exit, rolled back on exception.
        except APIError:
            raise
        except Exception:
            logger.exception(
                "Error inesperado creando reserva id_hotel=%s categoria=%s",
                payload.id_hotel,
                payload.id_categoria_habitacion,
            )
            raise APIError(500, "error_interno", "Ocurrió un error inesperado al procesar la reserva.")

    background_tasks.add_task(
        enviar_webhook_reserva,
        id_reserva=id_reserva,
        id_hotel=payload.id_hotel,
        total_estancia=total_estancia,
        fecha_entrada=payload.fecha_entrada,
    )

    return ReservaResponse(
        id_reserva=id_reserva,
        estatus="confirmada",
        total_estancia=total_estancia,
        fecha_entrada=payload.fecha_entrada,
        fecha_salida=payload.fecha_salida,
    )
