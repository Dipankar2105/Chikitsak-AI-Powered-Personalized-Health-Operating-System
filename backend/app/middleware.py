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

        # If response already follows the API envelope contract, don't re-wrap.
        if (
            isinstance(original, dict)
            and "status" in original
            and ("message" in original or "data" in original or "response" in original)
        ):
            return JSONResponse(content=original, status_code=response.status_code)

        is_success = 200 <= response.status_code < 400
        status_str = "success" if is_success else "error"

        # Construct the standardized envelope
        wrapped = {
            "status": status_str,
            "data": original if is_success else (original.get("data") if isinstance(original, dict) else None),
            "message": "OK" if is_success else (original.get("detail", "An error occurred") if isinstance(original, dict) else str(original)),
        }

        # Inject confidence if available in the original response
        if isinstance(original, dict) and "confidence" in original:
            wrapped["confidence"] = original["confidence"]

        return JSONResponse(
            content=wrapped,
            status_code=response.status_code,
        )
