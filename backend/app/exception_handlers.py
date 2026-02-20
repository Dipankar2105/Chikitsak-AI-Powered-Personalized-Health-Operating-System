"""
Global exception handlers for consistent error responses.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from backend.app.logging_config import get_logger

logger = get_logger("exception_handlers")


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all global exception handlers to the app."""

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        logger.warning("HTTP %d on %s: %s", exc.status_code, request.url.path, exc.detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": exc.detail,
                "data": None,
                "message": exc.detail,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        logger.warning("Validation error on %s: %s", request.url.path, errors)
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": "Validation error — check your request body.",
                "data": errors,
                "message": "Validation error — check your request body.",
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception on %s: %s", request.url.path, str(exc), exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error.",
                "data": None,
                "message": "Internal server error.",
            },
        )
