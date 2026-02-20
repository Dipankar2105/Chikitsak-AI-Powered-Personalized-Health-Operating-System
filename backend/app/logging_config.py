import logging
import sys
from backend.app.config import get_settings


def setup_logging() -> None:
    """Configure application-wide logging."""
    settings = get_settings()

    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Root logger configuration
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)-25s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    # Silence noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DEBUG else logging.WARNING
    )

    logger = logging.getLogger("chikitsak")
    logger.info("Logging configured  [level=%s]", settings.LOG_LEVEL)


def get_logger(name: str) -> logging.Logger:
    """Return a namespaced logger for a module."""
    return logging.getLogger(f"chikitsak.{name}")
