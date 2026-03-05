"""
OpenRouter LLM Service — Fallback AI for when local models are unavailable or low confidence.

This service provides hybrid AI support:
1. Try local ML model first
2. If confidence < threshold OR model unavailable → use OpenRouter LLM
3. Return structured response with confidence scores
"""

import logging
from typing import Optional, Any, Dict
from datetime import datetime
from backend.app.config import get_settings
import json
import time

logger = logging.getLogger(__name__)
settings = get_settings()

# Global cache for API response to avoid rate limiting during testing
_response_cache: Dict[str, Any] = {}
_cache_ttl = 300  # 5 minutes


def _get_cached_response(key: str) -> Optional[Any]:
    """Get response from cache if not expired."""
    if key in _response_cache:
        cached_time, cached_data = _response_cache[key]
        if time.time() - cached_time < _cache_ttl:
            return cached_data
        del _response_cache[key]
    return None


def _cache_response(key: str, data: Any) -> None:
    """Cache a response."""
    _response_cache[key] = (time.time(), data)


async def call_openrouter_async(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    cache_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Call OpenRouter API asynchronously for LLM inference.
    
    Returns:
        {
            "status": "success" | "error",
            "response": str,
            "model": str,
            "confidence": float,
            "usage": {...}
        }
    """
    if not settings.OPENROUTER_API_KEY or settings.OPENROUTER_API_KEY == "sk-or-v1-placeholder":
        logger.warning("OpenRouter API key not configured")
        return {
            "status": "error",
            "response": "AI service unavailable. Using default response.",
            "model": "offline",
            "confidence": 0.0,
        }

    # Check cache
    if cache_key:
        cached = _get_cached_response(cache_key)
        if cached:
            logger.info("Returning cached OpenRouter response for key: %s", cache_key)
            return cached

    try:
        import aiohttp
        import asyncio

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://chikitsak.com",
            "X-Title": "Chikitsak Health AI",
            "Content-Type": "application/json",
        }

        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt or "You are a helpful health assistant."},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=settings.LLM_TIMEOUT),
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    result = {
                        "status": "success",
                        "response": data["choices"][0]["message"]["content"],
                        "model": data.get("model", settings.OPENROUTER_MODEL),
                        "confidence": 0.8,  # Default confidence for LLM responses
                        "usage": data.get("usage", {}),
                    }
                    
                    # Cache successful response
                    if cache_key:
                        _cache_response(cache_key, result)
                    
                    logger.info("OpenRouter API call successful | Model: %s", result["model"])
                    return result
                else:
                    error_text = await response.text()
                    logger.error("OpenRouter API error (status=%d): %s", response.status, error_text)
                    return {
                        "status": "error",
                        "response": f"API Error {response.status}: {error_text[:200]}",
                        "model": "openrouter",
                        "confidence": 0.0,
                    }

    except asyncio.TimeoutError:
        logger.error("OpenRouter API timeout after %d seconds", settings.LLM_TIMEOUT)
        return {
            "status": "error",
            "response": "AI service timeout. Please retry.",
            "model": "openrouter",
            "confidence": 0.0,
        }
    except Exception as e:
        logger.error("OpenRouter API error: %s", str(e))
        return {
            "status": "error",
            "response": f"AI service error: {str(e)[:100]}",
            "model": "openrouter",
            "confidence": 0.0,
        }


def call_openrouter_sync(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    cache_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Call OpenRouter API synchronously (blocking).
    
    Returns same format as async version.
    """
    if not settings.OPENROUTER_API_KEY or settings.OPENROUTER_API_KEY == "sk-or-v1-placeholder":
        logger.warning("OpenRouter API key not configured")
        return {
            "status": "error",
            "response": "AI service unavailable. Using default response.",
            "model": "offline",
            "confidence": 0.0,
        }

    # Check cache
    if cache_key:
        cached = _get_cached_response(cache_key)
        if cached:
            logger.info("Returning cached OpenRouter response for key: %s", cache_key)
            return cached

    try:
        import requests

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://chikitsak.com",
            "X-Title": "Chikitsak Health AI",
            "Content-Type": "application/json",
        }

        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt or "You are a helpful health assistant."},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=settings.LLM_TIMEOUT,
        )

        if response.status_code == 200:
            data = response.json()
            result = {
                "status": "success",
                "response": data["choices"][0]["message"]["content"],
                "model": data.get("model", settings.OPENROUTER_MODEL),
                "confidence": 0.8,  # Default confidence for LLM responses
                "usage": data.get("usage", {}),
            }
            
            # Cache successful response
            if cache_key:
                _cache_response(cache_key, result)
            
            logger.info("OpenRouter API call successful | Model: %s", result["model"])
            return result
        else:
            error_text = response.text[:200]
            logger.error("OpenRouter API error (status=%d): %s", response.status_code, error_text)
            return {
                "status": "error",
                "response": f"API Error {response.status_code}: {error_text}",
                "model": "openrouter",
                "confidence": 0.0,
            }

    except requests.Timeout:
        logger.error("OpenRouter API timeout after %d seconds", settings.LLM_TIMEOUT)
        return {
            "status": "error",
            "response": "AI service timeout. Please retry.",
            "model": "openrouter",
            "confidence": 0.0,
        }
    except Exception as e:
        logger.error("OpenRouter API error: %s", str(e))
        return {
            "status": "error",
            "response": f"AI service error: {str(e)[:100]}",
            "model": "openrouter",
            "confidence": 0.0,
        }


def should_use_fallback(ml_confidence: Optional[float]) -> bool:
    """Determine if we should use OpenRouter fallback LLM."""
    if ml_confidence is None:
        return True  # ML model unavailable
    return ml_confidence < settings.LLM_CONFIDENCE_THRESHOLD


def get_health_system_prompt(bot_type: str = "general") -> str:
    """Get system prompt for different health bot types."""
    bot_prompts = {
        "child": """You are Chikitsak Child Health Bot, an AI health assistant for children (ages 0-12).
You provide age-appropriate health guidance while emphasizing parent/guardian consultation.
Always recommend seeing a pediatrician for serious symptoms.
Keep responses simple and non-alarming.""",

        "adult_male": """You are Chikitsak Adult Male Health Bot, an AI health assistant for adult males (18+).
You provide evidence-based health guidance covering common male health issues.
Address topics like prostate health, cardiovascular health, and lifestyle management.
Recommend professional medical evaluation for concerning symptoms.""",

        "adult_female": """You are Chikitsak Adult Female Health Bot, an AI health assistant for adult females (18+).
You provide evidence-based health guidance addressing female health issues.
Cover topics like reproductive health, menstrual health, and hormone-related concerns.
Recommend professional medical evaluation for concerning symptoms.""",

        "elderly": """You are Chikitsak Elderly Health Bot, an AI health assistant for seniors (60+).
You provide health guidance accounting for age-related conditions and medication interactions.
Focus on fall prevention, polypharmacy safety, and chronic disease management.
Strongly recommend professional evaluation for all symptoms in elderly patients.""",

        "mental_health": """You are Chikitsak Mental Health Bot, an AI mental health support assistant.
You provide supportive, empathetic responses for mental health concerns.
Use CBT and mindfulness principles where appropriate.
Always recommend speaking with a mental health professional for serious concerns.
CRISIS RESPONSE: If user mentions suicide/self-harm, immediately provide crisis hotline numbers and encourage emergency services.""",

        "general": """You are Chikitsak Health Bot, an AI health assistant providing medical information and guidance.
You help users understand symptoms, provide health recommendations, and suggest when to see doctors.
Always emphasize that medical professionals should make final diagnoses.
Be empathetic, clear, and prioritize user safety.""",
    }
    return bot_prompts.get(bot_type, bot_prompts["general"])


def get_triage_system_prompt() -> str:
    """System prompt for symptom triage via LLM."""
    return """You are an expert medical AI assistant performing symptom triage.

Analyze the symptoms provided and return a JSON response with:
{
  "triage_level": "Self-care" | "Routine" | "Urgent" | "Emergency",
  "disease_prediction": "Most likely condition",
  "confidence": 0.0-1.0,
  "description": "Brief explanation",
  "recommendations": ["action1", "action2"],
  "red_flags": ["warning1"],
  "next_steps": ["step1", "step2"]
}

EMERGENCY TRIGGERS (triage_level = "Emergency"):
- Chest pain + shortness of breath
- Severe headache + fever + stiff neck
- Loss of consciousness
- Severe bleeding
- Difficulty breathing
- Signs of stroke (facial drooping, arm weakness, speech difficulty)
- Severe allergic reaction
- Severe burns

Be conservative - when unsure, recommend seeing a healthcare professional."""
