from datetime import date

from .errors import APIError


def validar_fechas_y_huespedes(fecha_entrada: date, fecha_salida: date, huespedes: int) -> None:
    if fecha_entrada < date.today():
        raise APIError(400, "fecha_pasado", "La fecha de entrada no puede ser en el pasado.")
    if fecha_salida <= fecha_entrada:
        raise APIError(
            400,
            "rango_fechas_invalido",
            "La fecha de salida debe ser posterior a la fecha de entrada.",
        )
    if huespedes < 1:
        raise APIError(400, "huespedes_invalido", "El número de huéspedes debe ser al menos 1.")


def validar_campos_huesped(nombre_huesped: str, telefono: str) -> None:
    if not nombre_huesped.strip():
        raise APIError(400, "campo_obligatorio", "El nombre del huésped es obligatorio.")
    if not telefono.strip():
        raise APIError(400, "campo_obligatorio", "El teléfono es obligatorio.")
