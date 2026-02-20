import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
MEDQUAD_PATH = os.path.join(BASE_DIR, "datasets", "triage", "medquad.csv")

_vectorizer = None
_tfidf_matrix = None
_answers = None


def _load_engine():
    global _vectorizer, _tfidf_matrix, _answers
    if _vectorizer is not None:
        return True

    if not os.path.exists(MEDQUAD_PATH):
        from backend.app.logging_config import get_logger
        get_logger("ml_models.medquad_engine").warning(f"Engine data absent: {MEDQUAD_PATH}")
        return False

    try:
        import pandas as pd
        from sklearn.feature_extraction.text import TfidfVectorizer

        medquad_df = pd.read_csv(MEDQUAD_PATH)
        questions = medquad_df["question"].astype(str)
        _answers = medquad_df["answer"].astype(str)

        _vectorizer = TfidfVectorizer(stop_words="english")
        _tfidf_matrix = _vectorizer.fit_transform(questions)
        return True
    except Exception as e:
        from backend.app.logging_config import get_logger
        get_logger("ml_models.medquad_engine").error("Data load failed: %s", e)
        return False


def get_medical_answer(user_query):
    if not _load_engine():
        return {"answer": "Medical knowledge base unavailable.", "confidence": 0.0}

    from sklearn.metrics.pairwise import cosine_similarity
    user_vector = _vectorizer.transform([user_query])
    similarity = cosine_similarity(user_vector, _tfidf_matrix)

    best_match_index = similarity.argmax()
    confidence = similarity[0][best_match_index]

    return {
        "answer": _answers.iloc[best_match_index],
        "confidence": float(confidence)
    }
