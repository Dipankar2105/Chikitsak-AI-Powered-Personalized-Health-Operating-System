"""
Translation Service — lazy-loaded HuggingFace translation pipelines.

Models are loaded on first use (not at import time) to avoid:
  1. Slow server startup
  2. Hard crash if models aren't downloaded
  3. Wasted memory if translation is never used
"""

from backend.app.logging_config import get_logger

logger = get_logger("services.translation_service")

_hi_en_translator = None
_en_hi_translator = None


def _get_hi_en():
    global _hi_en_translator
    if _hi_en_translator is None:
        try:
            from transformers import pipeline
            logger.info("Loading Hindi→English translation model...")
            _hi_en_translator = pipeline("translation", model="Helsinki-NLP/opus-mt-hi-en")
        except Exception as e:
            logger.error("Failed to load Hindi→English model: %s", e)
            return None
    return _hi_en_translator


def _get_en_hi():
    global _en_hi_translator
    if _en_hi_translator is None:
        try:
            from transformers import pipeline
            logger.info("Loading English→Hindi translation model...")
            _en_hi_translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-hi")
        except Exception as e:
            logger.error("Failed to load English→Hindi model: %s", e)
            return None
    return _en_hi_translator


def translate_to_english(text: str, source_lang: str) -> str:
    """Translate text to English. Returns original text if translation unavailable."""
    if source_lang == "hi":
        translator = _get_hi_en()
        if translator:
            try:
                return translator(text)[0]["translation_text"]
            except Exception as e:
                logger.warning("Translation failed (hi→en): %s", e)
    return text


def translate_from_english(text: str, target_lang: str) -> str:
    """Translate text from English. Returns original text if translation unavailable."""
    if target_lang == "hi":
        translator = _get_en_hi()
        if translator:
            try:
                return translator(text)[0]["translation_text"]
            except Exception as e:
                logger.warning("Translation failed (en→hi): %s", e)
    return text