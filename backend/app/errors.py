class APIError(Exception):
    """Domain error carrying the HTTP status and the {error, mensaje} payload shape."""

    def __init__(self, status_code: int, error: str, mensaje: str):
        self.status_code = status_code
        self.error = error
        self.mensaje = mensaje
        super().__init__(mensaje)
