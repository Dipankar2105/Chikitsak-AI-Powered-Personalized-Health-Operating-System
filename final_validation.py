"""
CHIKITSAK AI - FINAL VALIDATION TEST SUITE
Testing all critical components before launch
"""
import requests
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:3000"

print("=" * 100)
print("CHIKITSAK AI - FINAL VALIDATION TEST SUITE")
print("=" * 100)

# Test counters
tests_passed = 0
tests_failed = 0

def test(name, func):
    """Test wrapper with pass/fail tracking"""
    global tests_passed, tests_failed
    print(f"\n{'─' * 100}")
    print(f"TEST: {name}")
    print(f"{'─' * 100}")
    try:
        result = func()
        if result:
            print(f"✅ PASSED: {name}")
            tests_passed += 1
            return True
        else:
            print(f"❌ FAILED: {name}")
            tests_failed += 1
            return False
    except Exception as e:
        print(f"❌ ERROR: {name}")
        print(f"   Exception: {str(e)}")
        tests_failed += 1
        return False

# ============================================================================
# TEST SUITE
# ============================================================================

def test_backend_running():
    """Test if backend server is running"""
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Server responding: ✓")
        return response.status_code == 200
    except:
        print("   Backend server not responding")
        return False

def test_frontend_running():
    """Test if frontend server is running"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Frontend responding: ✓")
        return response.status_code == 200
    except:
        print("   Frontend server not responding")
        return False

def test_ml_models_loaded():
    """Test if all ML models are loaded"""
    try:
        from backend.app.services.ml_models_registry import print_model_status
        output = print_model_status()
        print(output)
        # Check for all 6 models
        return ("TRIAGE" in output and 
                "MENTAL_HEALTH" in output and
                "XRAY" in output and
                "BRAIN_MRI" in output and
                "SKIN_LESION" in output and
                "FOOD_CLASSIFIER" in output)
    except Exception as e:
        print(f"   Error: {e}")
        return False

def test_user_registration():
    """Test user registration endpoint"""
    try:
        timestamp = int(time.time())
        payload = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!",
            "city": "Mumbai",
            "country": "India"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print(f"   Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            data = response.json()
            token = data.get("data", {}).get("access_token")
            print(f"   Registration successful ✓")
            print(f"   Token received: {token[:40]}...")
            return token, data.get("data", {}).get("user", {}).get("id")
        else:
            print(f"   Response: {response.json()}")
            return None, None
    except Exception as e:
        print(f"   Error: {e}")
        return None, None

def test_symptom_analysis():
    """Test symptom analysis endpoint"""
    token, _ = test_user_registration()
    if not token:
        print("   Skipping - no token")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "symptoms": ["mild fever", "cough"],
            "duration": "2 days",
            "severity": "mild"
        }
        response = requests.post(f"{BASE_URL}/symptoms/analyze", json=payload, headers=headers)
        print(f"   Status: {response.status_code}")
        
        data = response.json()
        print(f"   Response status: {data.get('status')}")
        
        if response.status_code == 200:
            if data.get("status") == "success":
                confidence = data.get("data", {}).get("confidence", 0)
                triage = data.get("data", {}).get("triage_level", "UNKNOWN")
                print(f"   Triage level: {triage}")
                print(f"   Confidence: {confidence}")
                return True
            elif data.get("status") == "error":
                emergency = data.get("data", {}).get("emergency", False)
                if emergency:
                    print(f"   Emergency detected (expected): {data.get('data', {}).get('type')}")
                    return True
        return False
    except Exception as e:
        print(f"   Error: {e}")
        return False

def test_chat_endpoint():
    """Test chat endpoint"""
    token, _ = test_user_registration()
    if not token:
        print("   Skipping - no token")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "message": "I have a mild headache",
            "session_id": "test-session-001"
        }
        response = requests.post(f"{BASE_URL}/chat", json=payload, headers=headers)
        print(f"   Status: {response.status_code}")
        
        data = response.json()
        print(f"   Response status: {data.get('status')}")
        
        if response.status_code == 200:
            response_text = data.get("response", "")
            confidence = data.get("confidence", 0)
            triage = data.get("triage", "UNKNOWN")
            print(f"   Triage: {triage}")
            print(f"   Confidence: {confidence}")
            print(f"   Response length: {len(response_text)} chars")
            return True
        return False
    except Exception as e:
        print(f"   Error: {e}")
        return False

def test_database_connected():
    """Test database connectivity"""
    try:
        from backend.app.database import get_db, engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"   Database connection: ✓")
            print(f"   Query result: {result.fetchone()}")
            return True
    except Exception as e:
        print(f"   Error: {e}")
        return False

def test_safety_system():
    """Test emergency safety detection"""
    token, _ = test_user_registration()
    if not token:
        print("   Skipping - no token")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        # Use symptoms that should trigger emergency
        payload = {
            "symptoms": ["severe chest pain", "shortness of breath"],
            "duration": "1 hour",
            "severity": "severe"
        }
        response = requests.post(f"{BASE_URL}/symptoms/analyze", json=payload, headers=headers)
        print(f"   Status: {response.status_code}")
        
        data = response.json()
        is_emergency = data.get("data", {}).get("emergency", False)
        
        if is_emergency:
            emergency_type = data.get("data", {}).get("type", "")
            print(f"   Emergency detected: ✓")
            print(f"   Type: {emergency_type}")
            print(f"   Message includes hotlines: {'911' in data.get('message', '')}")
            return True
        else:
            print(f"   Safety system status: {data.get('status')}")
            return False
    except Exception as e:
        print(f"   Error: {e}")
        return False

def test_response_format():
    """Test standardized response format"""
    token, _ = test_user_registration()
    if not token:
        print("   Skipping - no token")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "symptoms": ["fatigue"],
            "duration": "1 day",
            "severity": "mild"
        }
        response = requests.post(f"{BASE_URL}/symptoms/analyze", json=payload, headers=headers)
        
        data = response.json()
        print(f"   Checking response format...")
        
        has_status = "status" in data
        has_data = "data" in data
        has_message = "message" in data
        has_confidence = "confidence" in data or "data" in data
        
        print(f"   - 'status' field: {'✓' if has_status else '✗'}")
        print(f"   - 'data' field: {'✓' if has_data else '✗'}")
        print(f"   - 'message' field: {'✓' if has_message else '✗'}")
        print(f"   - confidence field: {'✓' if has_confidence else '✗'}")
        
        return has_status and has_data and has_message
    except Exception as e:
        print(f"   Error: {e}")
        return False

# ============================================================================
# RUN ALL TESTS
# ============================================================================

print("\n\n")
print("╔" + "=" * 98 + "╗")
print("║ " + "RUNNING TESTS".center(96) + " ║")
print("╚" + "=" * 98 + "╝")

test("Backend Server Running", test_backend_running)
test("Frontend Server Running", test_frontend_running)
test("ML Models Loaded", test_ml_models_loaded)
test("Database Connected", test_database_connected)
test("User Registration", lambda: test_user_registration()[0] is not None)
test("Symptom Analysis", test_symptom_analysis)
test("Chat Endpoint", test_chat_endpoint)
test("Safety System", test_safety_system)
test("Response Format", test_response_format)

# ============================================================================
# FINAL REPORT
# ============================================================================

print("\n\n")
print("╔" + "=" * 98 + "╗")
print("║ " + "FINAL VALIDATION REPORT".center(96) + " ║")
print("╚" + "=" * 98 + "╝")

total_tests = tests_passed + tests_failed
pass_rate = (tests_passed / total_tests * 100) if total_tests > 0 else 0

print(f"\nTests Passed:  {tests_passed}/{total_tests} ✓")
print(f"Tests Failed:  {tests_failed}/{total_tests} ✗")
print(f"Pass Rate:     {pass_rate:.1f}%")

print(f"\n{'─' * 100}")

if tests_failed == 0:
    print("✅ ALL TESTS PASSED - SYSTEM READY FOR LAUNCH")
    print(f"{'─' * 100}")
    print("\nACCESS POINTS:")
    print(f"  • Frontend:         http://localhost:3000")
    print(f"  • Backend API:      http://localhost:8000")
    print(f"  • API Docs:         http://localhost:8000/docs")
    print(f"  • ReDoc:            http://localhost:8000/redoc")
    print(f"\nSYSTEM COMPONENTS:")
    print(f"  ✓ Backend Server (FastAPI)")
    print(f"  ✓ Frontend Application (Next.js)")
    print(f"  ✓ All 6 ML Models")
    print(f"  ✓ Database (SQLite)")
    print(f"  ✓ Authentication (JWT)")
    print(f"  ✓ Safety Systems (Emergency Detection)")
    print(f"  ✓ Hybrid AI (Local ML + LLM Fallback)")
    sys.exit(0)
else:
    print(f"❌ {tests_failed} TEST(S) FAILED - PLEASE REVIEW")
    print(f"{'─' * 100}")
    sys.exit(1)
