"""Quick validation script for Chikitsak backend imports and startup."""
import sys
sys.path.insert(0, ".")

tests_passed = 0
tests_failed = 0

def check(name, fn):
    global tests_passed, tests_failed
    try:
        fn()
        print(f"  ✅ {name}")
        tests_passed += 1
    except Exception as e:
        print(f"  ❌ {name}: {e}")
        tests_failed += 1

print("=" * 50)
print("Chikitsak Backend Validation")
print("=" * 50)

print("\n1. Core Imports:")
check("config", lambda: __import__("backend.app.config"))
check("database", lambda: __import__("backend.app.database"))
check("logging_config", lambda: __import__("backend.app.logging_config"))
check("middleware", lambda: __import__("backend.app.middleware"))
check("exception_handlers", lambda: __import__("backend.app.exception_handlers"))

print("\n2. Models:")
check("User model", lambda: __import__("backend.app.models.user"))
check("AuthSession model", lambda: __import__("backend.app.models.auth_token"))
check("ChatHistory model", lambda: __import__("backend.app.models.chat_history"))
check("MedicalProfile", lambda: __import__("backend.app.models.medical_profile"))
check("SymptomLog", lambda: __import__("backend.app.models.symptom_log"))
check("All models __init__", lambda: __import__("backend.app.models"))

print("\n3. Services:")
check("auth_service", lambda: __import__("backend.app.services.auth_service"))
check("chat_service", lambda: __import__("backend.app.services.chat_service"))

print("\n4. Routes:")
check("auth route", lambda: __import__("backend.app.routes.auth"))
check("chat route", lambda: __import__("backend.app.routes.chat"))
check("users route", lambda: __import__("backend.app.routes.users"))
check("symptoms route", lambda: __import__("backend.app.routes.symptoms"))
check("nutrition route", lambda: __import__("backend.app.routes.nutrition"))
check("medication route", lambda: __import__("backend.app.routes.medication"))
check("analytics route", lambda: __import__("backend.app.routes.analytics"))
check("prediction route", lambda: __import__("backend.app.routes.prediction"))
check("lab route", lambda: __import__("backend.app.routes.lab"))
check("drug route", lambda: __import__("backend.app.routes.drug"))
check("mental route", lambda: __import__("backend.app.routes.mental"))
check("full_health route", lambda: __import__("backend.app.routes.full_health"))
check("xray_service route", lambda: __import__("backend.app.routes.xray_service"))

print("\n5. Schemas:")
check("auth schemas", lambda: __import__("backend.app.schemas.auth"))
check("user schemas", lambda: __import__("backend.app.schemas.user"))

print("\n6. ML Engines (lazy-loaded):")
check("medquad_engine", lambda: __import__("backend.app.ml_models.medquad_engine"))
check("mental_engine", lambda: __import__("backend.app.ml_models.mental_engine"))
check("triage_infer", lambda: __import__("backend.app.ml_models.triage_infer"))
check("severity_engine", lambda: __import__("backend.app.ml_models.severity_engine"))
check("drug_engine", lambda: __import__("backend.app.ml_models.drug_engine"))
check("lab_engine", lambda: __import__("backend.app.ml_models.lab_engine"))

print("\n7. Full App Init:")
check("FastAPI app creation", lambda: __import__("backend.app.main"))

print("\n" + "=" * 50)
print(f"Results: {tests_passed} passed, {tests_failed} failed")
if tests_failed == 0:
    print("🎉 All checks passed!")
else:
    print(f"⚠️  {tests_failed} checks failed")
print("=" * 50)
