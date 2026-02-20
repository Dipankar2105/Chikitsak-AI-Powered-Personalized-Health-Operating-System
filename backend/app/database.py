from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool, StaticPool
from backend.app.config import get_settings

settings = get_settings()

# SQLite needs check_same_thread=False
# PostgreSQL uses QueuePool with configurable pool size.
is_sqlite = "sqlite" in settings.DATABASE_URL

engine_kwargs: dict = {}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    # Do NOT use StaticPool for file-based SQLite; it restricts to a single connection.
else:
    engine_kwargs["poolclass"] = QueuePool
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20
    engine_kwargs["pool_pre_ping"] = True  # Reconnect stale connections

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
