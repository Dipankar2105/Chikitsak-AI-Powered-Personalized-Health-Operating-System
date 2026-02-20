"""Full end-to-end test: register → login → chat (health) → chat (mental) → history"""
import urllib.request
import urllib.error
import json
import time
import sys

BASE = "http://127.0.0.1:8000"

def post(path, data, token=None):
    req = urllib.request.Request(f"{BASE}{path}", data=json.dumps(data).encode())
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req)
        return resp.getcode(), json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body}

def get(path, token=None):
    req = urllib.request.Request(f"{BASE}{path}")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req)
        return resp.getcode(), json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body}

fails = 0

# 1. Register
email = f"test_{int(time.time())}@example.com"
code, data = post("/auth/register", {"name": "Test User", "email": email, "password": "securepassword123"})
if code == 201:
    print(f"✅ Register: {code}")
else:
    print(f"❌ Register: {code} → {json.dumps(data, indent=2)}")
    fails += 1

# 2. Login
code, data = post("/auth/login", {"email": email, "password": "securepassword123"})
if code == 200 and "data" in data and "access_token" in data["data"]:
    token = data["data"]["access_token"]
    print(f"✅ Login: {code} (got token)")
else:
    print(f"❌ Login: {code} → {json.dumps(data, indent=2)}")
    sys.exit(1)

# 3. Chat health
code, data = post("/chat", {"message": "I have a headache and mild fever", "mode": "health", "language": "en"}, token)
if code == 200 and "data" in data and "response" in data["data"]:
    print(f"✅ Chat/Health: {code} (confidence={data['data'].get('confidence', '?')})")
    print(f"   → {data['data']['response'][:100]}...")
else:
    print(f"❌ Chat/Health: {code} → {json.dumps(data, indent=2)}")
    fails += 1

# 4. Chat mental
code, data = post("/chat", {"message": "I feel very stressed and anxious today", "mode": "mental", "language": "en"}, token)
if code == 200 and "data" in data and "response" in data["data"]:
    print(f"✅ Chat/Mental: {code} (confidence={data['data'].get('confidence', '?')})")
    print(f"   → {data['data']['response'][:100]}...")
else:
    print(f"❌ Chat/Mental: {code} → {json.dumps(data, indent=2)}")
    fails += 1

# 5. Chat history
code, data = get("/chat/history", token)
if code == 200 and "data" in data:
    count = len(data["data"])
    print(f"✅ Chat History: {code} ({count} messages)")
else:
    print(f"❌ Chat History: {code} → {json.dumps(data, indent=2)}")
    fails += 1

# 6. Root
code, data = get("/")
if code == 200:
    print(f"✅ Root: {code} (status={data.get('data', {}).get('status', '?')})")
else:
    print(f"❌ Root: {code}")
    fails += 1

print()
if fails == 0:
    print("🎉 ALL TESTS PASSED!")
else:
    print(f"⚠️  {fails} test(s) failed")
    sys.exit(1)
