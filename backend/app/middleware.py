"""
Global response wrapper middleware.

Wraps all JSON responses in a consistent envelope:
    { "success": bool, "data": ..., "message": str }

File-upload responses (e.g. multipart) are passed through unchanged.
"""

import json
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response, StreamingResponse, JSONResponse


class ResponseWrapperMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        # Skip wrapping for non-JSON responses (file downloads, HTML, redirects, etc.)
        content_type = response.headers.get("content-type", "")
        if "application/json" not in content_type:
            return response

        # Skip OpenAPI docs endpoints
        if request.url.path in ("/docs", "/redoc", "/openapi.json"):
            return response

        # Read the original body
        body_chunks: list[bytes] = []
        async for chunk in response.body_iterator:
            body_chunks.append(chunk if isinstance(chunk, bytes) else chunk.encode())
        raw_body = b"".join(body_chunks)

        try:
            original = json.loads(raw_body)
        except (json.JSONDecodeError, ValueError):
            return response  # Not valid JSON — pass through

        is_success = 200 <= response.status_code < 400

        wrapped = {
            "success": is_success,
            "data": original if is_success else None,
            "message": "OK" if is_success else original.get("detail", "An error occurred"),
        }

        # For error responses, also include the error key for frontend compat
        if not is_success:
            detail = original.get("detail", "An error occurred") if isinstance(original, dict) else "An error occurred"
            wrapped["message"] = detail
            wrapped["error"] = detail

        return JSONResponse(
            content=wrapped,
            status_code=response.status_code,
        )
