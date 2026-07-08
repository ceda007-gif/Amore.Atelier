from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .errors import APIError
from .routers import disponibilidad, reservas

app = FastAPI(title="Motor de Reservaciones")

app.include_router(disponibilidad.router)
app.include_router(reservas.router)


@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code, content={"error": exc.error, "mensaje": exc.mensaje}
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            "error": "parametros_invalidos",
            "mensaje": "Parámetros de solicitud inválidos o faltantes.",
        },
    )
