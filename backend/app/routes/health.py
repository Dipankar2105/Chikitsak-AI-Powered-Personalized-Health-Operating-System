"""Health check and system status endpoints."""

from fastapi import APIRouter
from backend.app.config import get_settings
import platform
import sys

router = APIRouter(prefix="/health", tags=["Health"])
settings = get_settings()


@router.get("/status")
def health_status():
    """Check API health and basic system info."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "app_name": settings.APP_NAME,
    }


@router.get("/system")
def system_info():
    """Get system information."""
    return {
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "platform": platform.platform(),
        "processor": platform.processor() or "Unknown",
    }


@router.get("/ready")
def readiness_check():
    """
    Kubernetes-style readiness probe.
    Returns 200 if application is ready to handle traffic.
    """
    # In production, you'd check database connectivity, cache availability, etc.
    return {
        "ready": True,
        "timestamp": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    }


@router.get("/live")
def liveness_check():
    """
    Kubernetes-style liveness probe.
    Returns 200 if application is running.
    """
    return {
        "alive": True,
        "timestamp": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    }
