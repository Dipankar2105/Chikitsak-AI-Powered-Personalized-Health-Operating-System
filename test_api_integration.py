"""Test critical API endpoints for frontend-backend integration"""
import requests
import json
import traceback

BASE_URL = "http://127.0.0.1:8000"

# Test 1: Register new user
print("=" * 80)
print("TEST 1: User Registration")
print("=" * 80)
reg_data = {
    "name": "Test User",
    "email": f"test{int(__import__('time').time())}@example.com",
    "password": "TestPass123!",
    "city": "Mumbai",
    "country": "India"
}
try:
    response = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    print(f"Status: {response.status_code}")
    resp_json = response.json()
    print(f"Response: {json.dumps(resp_json, indent=2)[:800]}...")
    
    token = None
    if response.status_code in [200, 201]:
        token = resp_json.get("data", {}).get("access_token")
        print(f"\n✅ Registration successful, token: {token[:50]}...")
        
        # Test 2: Analyze symptoms
        print("\n" + "=" * 80)
        print("TEST 2: Symptom Analysis with Hybrid Triage")
        print("=" * 80)
        symptom_data = {
            "symptoms": ["high fever", "cough", "fatigue"],
            "duration": "3 days",
            "severity": "moderate"
        }
        headers = {"Authorization": f"Bearer {token}"}
        try:
            response = requests.post(f"{BASE_URL}/symptoms/analyze", json=symptom_data, headers=headers)
            print(f"Status: {response.status_code}")
            resp_json = response.json()
            print(f"Response: {json.dumps(resp_json, indent=2)[:1000]}...")
            
            # Test 3: Chat endpoint
            print("\n" + "=" * 80)
            print("TEST 3: Chat with AI Health Assistant")
            print("=" * 80)
            chat_data = {
                "message": "I have a severe headache, should I be worried?",
                "session_id": "test-session-001"
            }
            try:
                response = requests.post(f"{BASE_URL}/chat", json=chat_data, headers=headers)
                print(f"Status: {response.status_code}")
                resp_json = response.json()
                print(f"Response: {json.dumps(resp_json, indent=2)[:1000]}...")
            except Exception as e:
                print(f"Chat test error: {str(e)}")
                traceback.print_exc()
        except Exception as e:
            print(f"Symptom test error: {str(e)}")
            traceback.print_exc()

except Exception as e:
    print(f"Registration error: {str(e)}")
    traceback.print_exc()

print("\n" + "=" * 80)
print("✅ API Integration Tests Completed")
print("=" * 80)

