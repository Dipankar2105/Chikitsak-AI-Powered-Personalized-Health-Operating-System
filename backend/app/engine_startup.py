"""
Engine Startup — Pre-loads all ML models into memory at server startup
to ensure fast first-request response times and verify resource availability.
"""

from backend.app.logging_config import get_logger

logger = get_logger("engine_startup")

def init_engines():
    """
    Trigger singleton loaders for all ML engines and services.
    This ensures models are loaded on the GPU (if available) before the first request.
    """
    logger.info("=" * 80)
    logger.info("Initializing ML ENGINES and MODELS...")
    logger.info("=" * 80)

    # Initialize ML models registry (loads all trained models)
    try:
        from backend.app.services.ml_models_registry import initialize_ml_models
        initialize_ml_models()
    except Exception as e:
        logger.warning(f"ML models registry initialization failed: {e}")

    # Core model services
    try:
        from backend.app.services.model_services import preload_models_once
        preload_models_once()
    except Exception as e:
        logger.warning(f"Core model preload failed: {e}")

    # Data-driven engines
    try:
        from backend.app.ml_models.lab_engine import _get_reference_map
        _get_reference_map()
        logger.info("✅ Lab engine data loaded")
    except Exception as e:
        logger.warning(f"Lab engine data failed to load: {e}")

    try:
        from backend.app.ml_models.nutrition_engine import _get_nutrition_df
        _get_nutrition_df()
        logger.info("✅ Nutrition database loaded")
    except Exception as e:
        logger.warning(f"Nutrition database failed to load: {e}")

    logger.info("=" * 80)
    logger.info("ML engine initialization sequence complete.")
    logger.info("=" * 80)
