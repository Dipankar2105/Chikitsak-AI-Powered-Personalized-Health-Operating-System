import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def post(path, data, token=None):
    req = urllib.request.Request(f"{BASE_URL}{path}", data=json.dumps(data).encode("utf-8"))
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "detail": e.read().decode()}

def get(path, token=None):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "detail": e.read().decode()}

print("1. Registering new user...")
user_data = {
    "name": f"Test User {int(time.time())}",
    "email": f"test_{int(time.time())}@example.com",
    "password": "securepassword123"
}
reg_res = post("/auth/register", user_data)
if "error" in reg_res and reg_res["error"] == 409:
    print("User already exists, proceeding to login...")
else:
    print("Register Response:", reg_res.get("message", "Success"))

print("\n2. Logging in...")
login_res = post("/auth/login", {"email": user_data["email"], "password": "securepassword123"})
if "error" in login_res:
    print("Login Failed:", login_res)
    exit(1)

token = login_res["data"]["access_token"]
print("Login successful, got token.")

print("\n3. Testing Chat Endpoint (Health Mode)...")
chat_health = post("/chat", {"message": "I have a headache and mild fever", "mode": "health", "language": "en"}, token)
print("Health Response:\n  ->", chat_health["data"]["response"].replace("\n", " "))
print("  Confidence:", chat_health["data"]["confidence"])

print("\n4. Testing Chat Endpoint (Mental Mode)...")
chat_mental = post("/chat", {"message": "I feel very stressed and anxious today", "mode": "mental", "language": "en"}, token)
print("Mental Response:\n  ->", chat_mental["data"]["response"].replace("\n", " "))
print("  Confidence:", chat_mental["data"]["confidence"])

print("\n5. Testing Chat History...")
history_res = get("/chat/history", token)
history_size = len(history_res["data"])
print(f"Chat History Size: {history_size} visible messages.")

print("\nAll endpoints functioning correctly!")
