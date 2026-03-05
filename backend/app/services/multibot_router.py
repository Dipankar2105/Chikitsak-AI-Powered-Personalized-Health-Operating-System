"""
Multi-Bot Routing Service — Route health requests to specialized bots

Bots:
1. Child Bot (ages 0-12)
2. Adult Male Bot (18+, male)
3. Adult Female Bot (18+, female)
4. Elderly Bot (60+)
5. Mental Health Bot
6. General Bot (fallback)

Routing logic based on:
- Age
- Gender
- Mode (self vs someone else)
- Query content
"""

import logging
from typing import Optional, Dict, Any
from enum import Enum
from backend.app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class BotType(str, Enum):
    """Available health bot types."""
    CHILD = "child"
    ADULT_MALE = "adult_male"
    ADULT_FEMALE = "adult_female"
    ELDERLY = "elderly"
    MENTAL_HEALTH = "mental_health"
    GENERAL = "general"


MENTAL_HEALTH_KEYWORDS = [
    "depression", "anxiety", "stress", "panic", "sad", "lonely", "sleep",
    "worried", "nervous", "fear", "mood", "emotion", "mental", "psychology",
    "therapy", "counselor", "psychologist", "suicidal", "hurt", "self-harm",
    "bipolar", "adhd", "adhd", "ptsd", "trauma"
]

CHILD_SYMPTOMS = [
    "diaper", "feeding", "teething", "colic", "developmental", "immunization",
    "toy", "play", "school", "growth", "milk", "formula"
]


def get_bot_type(
    age: Optional[int] = None,
    gender: Optional[str] = None,
    mode: str = "self",
    query: Optional[str] = None,
) -> BotType:
    """
    Determine which bot should handle the request.
    
    Args:
        age: User age (or patient age if mode="someone_else")
        gender: User gender ("male", "female", or None/other)
        mode: "self" | "someone_else"
        query: User's message/query
        
    Returns:
        BotType enum value
    """
    
    query_lower = (query or "").lower()
    
    # 1. Detect mental health mode
    if any(keyword in query_lower for keyword in MENTAL_HEALTH_KEYWORDS):
        logger.info("Routing to Mental Health bot (keywords detected)")
        return BotType.MENTAL_HEALTH
    
    # 2. Age-based routing
    if age is not None:
        if age < 13:
            logger.info("Routing to Child bot (age=%d)", age)
            return BotType.CHILD
        elif age >= 60:
            logger.info("Routing to Elderly bot (age=%d)", age)
            return BotType.ELDERLY
        elif 13 <= age < 60:
            if gender and gender.lower() in ["m", "male"]:
                logger.info("Routing to Adult Male bot (age=%d)", age)
                return BotType.ADULT_MALE
            elif gender and gender.lower() in ["f", "female", "w", "woman"]:
                logger.info("Routing to Adult Female bot (age=%d)", age)
                return BotType.ADULT_FEMALE
            else:
                logger.info("Routing to General bot (age=%d, no gender specified)", age)
                return BotType.GENERAL
    
    # 3. Gender-based routing (if age not provided)
    if gender:
        if gender.lower() in ["m", "male"]:
            logger.info("Routing to Adult Male bot (gender specified)")
            return BotType.ADULT_MALE
        elif gender.lower() in ["f", "female", "w", "woman"]:
            logger.info("Routing to Adult Female bot (gender specified)")
            return BotType.ADULT_FEMALE
    
    # 4. Default
    logger.info("Routing to General bot (default)")
    return BotType.GENERAL


def get_bot_system_prompt(bot_type: BotType) -> str:
    """Get the system prompt for a specific bot."""
    from backend.app.services.openrouter_service import get_health_system_prompt
    
    prompt_map = {
        BotType.CHILD: get_health_system_prompt("child"),
        BotType.ADULT_MALE: get_health_system_prompt("adult_male"),
        BotType.ADULT_FEMALE: get_health_system_prompt("adult_female"),
        BotType.ELDERLY: get_health_system_prompt("elderly"),
        BotType.MENTAL_HEALTH: get_health_system_prompt("mental_health"),
        BotType.GENERAL: get_health_system_prompt("general"),
    }
    
    return prompt_map.get(bot_type, get_health_system_prompt("general"))


def get_bot_info(bot_type: BotType) -> Dict[str, Any]:
    """Get metadata about a bot."""
    bot_info_map = {
        BotType.CHILD: {
            "name": "Child Health Bot",
            "description": "Age-appropriate health guidance for children",
            "age_range": "0-12 years",
            "features": ["Parent consultation emphasis", "Pediatric concerns", "Growth tracking"],
            "supported_languages": ["en", "hi", "mr"],
        },
        BotType.ADULT_MALE: {
            "name": "Adult Male Health Bot",
            "description": "Health guidance for adult males",
            "age_range": "18-59 years",
            "features": ["Prostate health", "Cardiovascular health", "Fitness", "Sexual health"],
            "supported_languages": ["en", "hi", "mr"],
        },
        BotType.ADULT_FEMALE: {
            "name": "Adult Female Health Bot",
            "description": "Health guidance for adult females",
            "age_range": "18-59 years",
            "features": ["Reproductive health", "Menstrual health", "Pregnancy", "Hormonal health"],
            "supported_languages": ["en", "hi", "mr"],
        },
        BotType.ELDERLY: {
            "name": "Elderly Health Bot",
            "description": "Specialized health guidance for seniors",
            "age_range": "60+ years",
            "features": ["Fall prevention", "Medication safety", "Chronic disease", "Mobility"],
            "supported_languages": ["en", "hi", "mr"],
        },
        BotType.MENTAL_HEALTH: {
            "name": "Mental Health Bot",
            "description": "Mental health support and emotional wellness",
            "age_range": "All ages",
            "features": ["CBT techniques", "Breathing exercises", "Mood tracking", "Stress management"],
            "supported_languages": ["en", "hi", "mr"],
        },
        BotType.GENERAL: {
            "name": "General Health Bot",
            "description": "General health information and guidance",
            "age_range": "All ages",
            "features": ["Symptom checking", "Health information", "Wellness tips"],
            "supported_languages": ["en", "hi", "mr"],
        },
    }
    
    return bot_info_map.get(bot_type, bot_info_map[BotType.GENERAL])


def should_ask_clarification(bot_type: BotType, query: str) -> bool:
    """Determine if the bot should ask for clarification."""
    query_lower = query.lower()
    
    # Always ask for clarification on vague queries
    vague_terms = ["pain", "problem", "issue", "sick", "bad", "feel weird"]
    if len(query) < 10 and any(term in query_lower for term in vague_terms):
        return True
    
    # Child bot should ask about symptoms
    if bot_type == BotType.CHILD and len(query) < 20:
        return True
    
    # Mental health bot should ask about intensity
    if bot_type == BotType.MENTAL_HEALTH and "severity" not in query_lower and "level" not in query_lower:
        return True
    
    return False


def get_clarification_prompt(bot_type: BotType) -> str:
    """Get clarification prompts based on bot type."""
    prompts_map = {
        BotType.CHILD: "Can you describe where the pain/discomfort is and what it feels like? Is your child acting normally otherwise?",
        BotType.ADULT_MALE: "How long have you had this symptom? Any other symptoms or medical conditions?",
        BotType.ADULT_FEMALE: "When did this start? Any relation to your menstrual cycle or hormones?",
        BotType.ELDERLY: "How long has this been happening? Are you on any medications that might be relevant?",
        BotType.MENTAL_HEALTH: "On a scale of 1-10, how would you rate the intensity of your feelings? How long has this been happening?",
        BotType.GENERAL: "Can you provide more details about what you're experiencing?",
    }
    
    return prompts_map.get(bot_type, prompts_map[BotType.GENERAL])
