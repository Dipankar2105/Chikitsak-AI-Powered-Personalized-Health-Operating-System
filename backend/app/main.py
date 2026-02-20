from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ─────────────────────────────────────────
# Internal Imports (ALWAYS use backend.app)
# ─────────────────────────────────────────

from backend.app.config import get_settings
from backend.app.logging_config import setup_logging, get_logger
from backend.app.database import engine, Base
from backend.app.middleware import ResponseWrapperMiddleware
from backend.app.exception_handlers import register_exception_handlers

from backend.app.routes import (
    auth,
    users,
    symptoms,
    nutrition,
    medication,
    analytics,
    health_summary,
    analytics_service,
    xray_service,
    medication_interaction,
    nutrition_recommendation,
    medication_safety,
    prediction,
    lab,
    drug,
    full_health,
    mental,
    chat,
)

# ─────────────────────────────────────────
# Logging
# ─────────────────────────────────────────

logger = get_logger("main")
settings = get_settings()

# ─────────────────────────────────────────
# OpenAPI Tag Metadata
# ─────────────────────────────────────────

TAGS_METADATA = [
    {"name": "Root", "description": "Health check and API information."},
    {"name": "Users", "description": "User registration and profile retrieval."},
    {"name": "Symptoms", "description": "Log and retrieve symptom entries."},
    {"name": "Nutrition", "description": "Log and retrieve nutrition intake."},
    {"name": "Medication", "description": "Log medication entries."},
    {"name": "Health Analytics", "description": "BMI, calorie needs, and health score calculations."},
    {"name": "Health Summary", "description": "Comprehensive health snapshot with risk flags."},
    {"name": "Health Intelligence", "description": "Recurring conditions, nutrition & medication patterns, risk score."},
    {"name": "Medication Interactions", "description": "Drug-drug and drug-allergy interaction checking."},
    {"name": "Medication Safety", "description": "Full medication safety analysis — duplicates, frequency, allergies, condition conflicts."},
    {"name": "Nutrition Recommendations", "description": "Personalized nutrition targets and food suggestions."},
    {"name": "X-Ray Analysis", "description": "Chest X-ray pneumonia detection via uploaded image."},
    {"name": "Lab Analysis", "description": "Laboratory value abnormality detection and risk scoring."},
    {"name": "Prediction", "description": "ML-based disease prediction endpoints."},
    {"name": "Analytics", "description": "Symptom frequency, nutrition summaries, and health timelines."},
    {"name": "Mental Health", "description": "Mental state analysis and severity scoring."},
    {"name": "Unified Health Intelligence", "description": "Full health analysis orchestrating all AI engines."},
    {"name": "Chatbot", "description": "Dual-mode AI chatbot — health assistant & mental health therapist."},
]

# ─────────────────────────────────────────
# Lifespan Events
# ─────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Creating database tables…")
    import backend.app.models  # noqa: F401 – ensure all models register with Base
    Base.metadata.create_all(bind=engine)
    logger.info("Chikitsak API is ready")
    yield
    logger.info("Shutting down…")

# ─────────────────────────────────────────
# App Initialization
# ─────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    openapi_tags=TAGS_METADATA,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────
# Exception Handlers
# ─────────────────────────────────────────

register_exception_handlers(app)

# ─────────────────────────────────────────
# Middleware
# ─────────────────────────────────────────

app.add_middleware(ResponseWrapperMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# Routers (ALL registered AFTER app init)
# ─────────────────────────────────────────

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(symptoms.router)
app.include_router(nutrition.router)
app.include_router(medication.router)
app.include_router(analytics.router)
app.include_router(analytics_service.router)
app.include_router(health_summary.router)
app.include_router(medication_interaction.router)
app.include_router(nutrition_recommendation.router)
app.include_router(xray_service.router)
app.include_router(medication_safety.router)
app.include_router(prediction.router)
app.include_router(lab.router)
app.include_router(drug.router)
app.include_router(full_health.router)
app.include_router(mental.router)
app.include_router(chat.router)

# ─────────────────────────────────────────
# Root Endpoint
# ─────────────────────────────────────────

@app.get("/", tags=["Root"], summary="API Health Check")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
    }