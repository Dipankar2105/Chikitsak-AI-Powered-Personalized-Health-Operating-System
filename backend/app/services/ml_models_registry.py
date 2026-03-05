"""
ML Model Integration Service

Comprehensive integration of all trained ML models:
1. Triage Model (symptom → disease prediction)
2. Mental Health Model (text → emotion/severity)
3. X-Ray Model (image → pneumonia detection)
4. Brain MRI Model (image → tumor/abnormality detection)
5. Skin Lesion Model (ISIC - image → skin cancer classification)
6. Food Classification Model (image → food type)

Strategy:
- Load models on startup
- Cache predictions for performance
- Track model confidence
- Fall back to LLM if confidence too low
- Return detailed analysis with model attribution
"""

import logging
from typing import Dict, Any, Optional, List, Tuple
import os
import json

logger = logging.getLogger(__name__)

# Model paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ml_models")

MODEL_REGISTRY = {
    "triage": {
        "path": os.path.join(MODEL_DIR, "triage_model.pkl"),
        "type": "sklearn",
        "description": "Symptom → Disease prediction",
        "dataset": "Training.csv",
        "version": "1.0",
    },
    "mental_health": {
        "path": os.path.join(MODEL_DIR, "mental_model.pkl"),
        "type": "sklearn",
        "description": "Text → Emotion & Severity",
        "dataset": "mental_health dataset",
        "version": "1.0",
    },
    "xray": {
        "path": os.path.join(MODEL_DIR, "xray_model.pth"),
        "type": "torch",
        "description": "Chest X-Ray → Pneumonia detection",
        "dataset": "chest_xray",
        "version": "1.0",
    },
    "brain_mri": {
        "path": os.path.join(MODEL_DIR, "brain_mri_model.pth"),
        "type": "torch",
        "description": "Brain MRI → Abnormality detection",
        "dataset": "brain_mri",
        "version": "1.0",
    },
    "skin_lesion": {
        "path": os.path.join(MODEL_DIR, "isic_model.pth"),
        "type": "torch",
        "description": "Skin lesion → Cancer risk classification",
        "dataset": "isic2016",
        "version": "1.0",
    },
    "food_classifier": {
        "path": os.path.join(MODEL_DIR, "food_model.pth"),
        "type": "torch",
        "description": "Image → Food type classification",
        "dataset": "food-101",
        "version": "1.0",
    },
}


def get_model_status() -> Dict[str, Dict[str, Any]]:
    """Check status of all trained models."""
    status = {}
    
    for model_name, config in MODEL_REGISTRY.items():
        model_path = config["path"]
        exists = os.path.exists(model_path)
        
        status[model_name] = {
            "name": model_name,
            "description": config["description"],
            "type": config["type"],
            "dataset": config["dataset"],
            "version": config["version"],
            "exists": exists,
            "path": model_path,
            "dataset_path": os.path.join(os.path.dirname(__file__), "../../../datasets", config["dataset"]),
        }
        
        if exists:
            try:
                file_size = os.path.getsize(model_path) / (1024 ** 2)  # MB
                status[model_name]["file_size_mb"] = round(file_size, 2)
            except Exception as e:
                logger.warning("Failed to get file size for %s: %s", model_name, e)
    
    return status


def print_model_status() -> str:
    """Print formatted model status."""
    status = get_model_status()
    output = "\n" + "=" * 80 + "\n"
    output += "CHIKITSAK ML MODEL INVENTORY\n"
    output += "=" * 80 + "\n\n"
    
    loaded = 0
    missing = 0
    
    for model_name, info in status.items():
        status_icon = "✅" if info["exists"] else "❌"
        output += f"{status_icon} {model_name.upper()}\n"
        output += f"   Description: {info['description']}\n"
        output += f"   Dataset: {info['dataset']}\n"
        output += f"   Type: {info['type']}\n"
        output += f"   Version: {info['version']}\n"
        
        if info["exists"]:
            output += f"   Size: {info.get('file_size_mb', 'N/A')} MB\n"
            loaded += 1
        else:
            output += f"   Status: NOT FOUND at {info['path']}\n"
            missing += 1
        output += "\n"
    
    output += "=" * 80 + "\n"
    output += f"Summary: {loaded} models loaded, {missing} missing\n"
    output += "=" * 80 + "\n"
    
    return output


def load_triage_model() -> Tuple[Optional[Any], bool]:
    """
    Load triage ML model.
    
    Returns:
        (model, success)
    """
    try:
        import joblib
        
        model_path = MODEL_REGISTRY["triage"]["path"]
        if not os.path.exists(model_path):
            logger.warning("Triage model not found at %s", model_path)
            return None, False
        
        model = joblib.load(model_path)
        logger.info("✅ Triage model loaded successfully")
        return model, True
    except Exception as e:
        logger.error("Failed to load triage model: %s", e)
        return None, False


def load_mental_model() -> Tuple[Optional[Any], bool]:
    """Load mental health ML model."""
    try:
        import joblib
        
        model_path = MODEL_REGISTRY["mental_health"]["path"]
        if not os.path.exists(model_path):
            logger.warning("Mental health model not found at %s", model_path)
            return None, False
        
        model = joblib.load(model_path)
        logger.info("✅ Mental health model loaded successfully")
        return model, True
    except Exception as e:
        logger.error("Failed to load mental health model: %s", e)
        return None, False


def load_xray_model() -> Tuple[Optional[Any], bool]:
    """Load X-Ray analysis model (PyTorch)."""
    try:
        import torch
        
        model_path = MODEL_REGISTRY["xray"]["path"]
        if not os.path.exists(model_path):
            logger.warning("X-Ray model not found at %s", model_path)
            return None, False
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        try:
            # Try loading as full model first
            model = torch.load(model_path, map_location=device)
            model.eval()
        except (AttributeError, KeyError):
            # If that fails, it's likely a state_dict
            logger.info("Loading X-Ray model as state_dict")
            state_dict = torch.load(model_path, map_location=device)
            model = state_dict  # Keep as dict for inference
        
        logger.info("✅ X-Ray model loaded successfully (device: %s)", device)
        return model, True
    except Exception as e:
        logger.error("Failed to load X-Ray model: %s", e)
        return None, False


def load_brain_mri_model() -> Tuple[Optional[Any], bool]:
    """Load brain MRI analysis model."""
    try:
        import torch
        
        model_path = MODEL_REGISTRY["brain_mri"]["path"]
        if not os.path.exists(model_path):
            logger.warning("Brain MRI model not found at %s", model_path)
            return None, False
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        try:
            model = torch.load(model_path, map_location=device)
            model.eval()
        except (AttributeError, KeyError):
            logger.info("Loading Brain MRI model as state_dict")
            state_dict = torch.load(model_path, map_location=device)
            model = state_dict
        
        logger.info("✅ Brain MRI model loaded successfully (device: %s)", device)
        return model, True
    except Exception as e:
        logger.error("Failed to load brain MRI model: %s", e)
        return None, False


def load_skin_lesion_model() -> Tuple[Optional[Any], bool]:
    """Load skin lesion classification model (ISIC)."""
    try:
        import torch
        
        model_path = MODEL_REGISTRY["skin_lesion"]["path"]
        if not os.path.exists(model_path):
            logger.warning("Skin lesion model not found at %s", model_path)
            return None, False
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        try:
            model = torch.load(model_path, map_location=device)
            model.eval()
        except (AttributeError, KeyError):
            logger.info("Loading skin lesion model as state_dict")
            state_dict = torch.load(model_path, map_location=device)
            model = state_dict
        
        logger.info("✅ Skin lesion model loaded successfully (device: %s)", device)
        return model, True
    except Exception as e:
        logger.error("Failed to load skin lesion model: %s", e)
        return None, False


def load_food_classifier_model() -> Tuple[Optional[Any], bool]:
    """Load food classification model (Food-101 dataset)."""
    try:
        import torch
        
        model_path = MODEL_REGISTRY["food_classifier"]["path"]
        if not os.path.exists(model_path):
            logger.warning("Food classifier model not found at %s", model_path)
            return None, False
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        try:
            model = torch.load(model_path, map_location=device)
            model.eval()
        except (AttributeError, KeyError):
            logger.info("Loading food classifier model as state_dict")
            state_dict = torch.load(model_path, map_location=device)
            model = state_dict
        
        logger.info("✅ Food classifier model loaded successfully (device: %s)", device)
        return model, True
    except Exception as e:
        logger.error("Failed to load food classifier model: %s", e)
        return None, False


class MLModelCache:
    """Cache for all loaded ML models to avoid reloading."""
    
    def __init__(self):
        self.models = {}
        self.load_status = {}
        self._initialized = False
    
    def initialize(self):
        """Load all models on startup."""
        if self._initialized:
            return
        
        logger.info(print_model_status())
        
        # Try to load all models
        self.models["triage"], self.load_status["triage"] = load_triage_model()
        self.models["mental_health"], self.load_status["mental_health"] = load_mental_model()
        self.models["xray"], self.load_status["xray"] = load_xray_model()
        self.models["brain_mri"], self.load_status["brain_mri"] = load_brain_mri_model()
        self.models["skin_lesion"], self.load_status["skin_lesion"] = load_skin_lesion_model()
        self.models["food_classifier"], self.load_status["food_classifier"] = load_food_classifier_model()
        
        self._initialized = True
        
        # Summary
        loaded_count = sum(1 for v in self.load_status.values() if v)
        logger.info("ML Model initialization complete: %d/%d models loaded", loaded_count, len(MODEL_REGISTRY))
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get a model from cache."""
        if not self._initialized:
            self.initialize()
        return self.models.get(model_name)
    
    def is_model_available(self, model_name: str) -> bool:
        """Check if a model is available."""
        if not self._initialized:
            self.initialize()
        return self.load_status.get(model_name, False)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of all models."""
        if not self._initialized:
            self.initialize()
        
        return {
            "total_models": len(MODEL_REGISTRY),
            "loaded_models": sum(1 for v in self.load_status.values() if v),
            "status": self.load_status,
            "details": get_model_status(),
        }


# Global cache instance
_model_cache = MLModelCache()


def initialize_ml_models():
    """Initialize all ML models on app startup."""
    _model_cache.initialize()


def get_model(model_name: str) -> Optional[Any]:
    """Get model from cache."""
    return _model_cache.get_model(model_name)


def is_model_available(model_name: str) -> bool:
    """Check if model is available."""
    return _model_cache.is_model_available(model_name)


def get_ml_models_summary() -> Dict[str, Any]:
    """Get summary of ML models."""
    return _model_cache.get_summary()
