import asyncio
import logging
import os
from datetime import date
from decimal import Decimal
from uuid import UUID

import httpx

logger = logging.getLogger("webhooks")

WEBHOOK_URL = os.environ.get("WEBHOOK_URL")
_MAX_INTENTOS = 3
_TIMEOUT_SEGUNDOS = 5.0


async def enviar_webhook_reserva(
    id_reserva: UUID, id_hotel: int, total_estancia: Decimal, fecha_entrada: date
) -> None:
    """Notifies WEBHOOK_URL that a reservation was created. Never raises: the
    reservation is already committed by the time this runs, so a webhook
    failure must only be logged, not surfaced to the client."""
    if not WEBHOOK_URL:
        return

    payload = {
        "id_reserva": str(id_reserva),
        "id_hotel": id_hotel,
        "total_estancia": float(total_estancia),
        "fecha_entrada": fecha_entrada.isoformat(),
        "evento": "reserva.creada",
    }

    espera = 1.0
    async with httpx.AsyncClient(timeout=_TIMEOUT_SEGUNDOS) as client:
        for intento in range(1, _MAX_INTENTOS + 1):
            try:
                respuesta = await client.post(WEBHOOK_URL, json=payload)
                respuesta.raise_for_status()
                return
            except httpx.HTTPError as exc:
                logger.warning(
                    "Intento %s/%s de webhook para reserva %s falló: %s",
                    intento,
                    _MAX_INTENTOS,
                    id_reserva,
                    exc,
                )
                if intento == _MAX_INTENTOS:
                    logger.error(
                        "Webhook para reserva %s falló definitivamente tras %s intentos.",
                        id_reserva,
                        _MAX_INTENTOS,
                    )
                    return
                await asyncio.sleep(espera)
                espera *= 2
