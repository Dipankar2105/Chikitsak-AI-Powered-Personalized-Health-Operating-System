import requests
import io
from PIL import Image
import random
import string

BASE = "http://127.0.0.1:8000"

summary = {"passed": [], "failed": []}


def rand_email():
    return f"test+{''.join(random.choices(string.ascii_lowercase, k=6))}@example.com"


# 1) Register
email = rand_email()
password = "TestPass123!"
resp = requests.post(f"{BASE}/auth/register", json={"name": "Test User", "email": email, "password": password})
if resp.status_code in (200, 201):
    print("REGISTER OK")
    data = resp.json()
    if data.get("success") and data["data"].get("access_token"):
        summary["passed"].append("register")
    else:
        summary["failed"].append("register: bad payload")
else:
    print("REGISTER FAIL", resp.status_code, resp.text)
    summary["failed"].append("register")


# 2) Login
resp = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
if resp.status_code == 200:
    print("LOGIN OK")
    data = resp.json()
    token = data["data"]["access_token"]
    refresh = data["data"]["refresh_token"]
    user = data["data"].get("user")
    summary["passed"].append("login")
else:
    print("LOGIN FAIL", resp.status_code, resp.text)
    summary["failed"].append("login")
    token = None


# 3) Protected route /users/me
if token:
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE}/users/me", headers=headers)
    if resp.status_code == 200:
        print("PROTECTED OK")
        summary["passed"].append("protected")
    else:
        print("PROTECTED FAIL", resp.status_code, resp.text)
        summary["failed"].append("protected")

# 4) ML endpoint /predict/xray (send tiny image)
img = Image.new("RGB", (32, 32), color=(200, 200, 200))
buf = io.BytesIO()
img.save(buf, format="PNG")
buf.seek(0)
files = {"file": ("test.png", buf, "image/png")}
resp = requests.post(f"{BASE}/predict/xray", files=files)
if resp.status_code == 200:
    print("PREDICT XRAY OK")
    summary["passed"].append("predict_xray")
else:
    print("PREDICT XRAY FAIL", resp.status_code, resp.text)
    summary["failed"].append("predict_xray")

# 5) Analytics symptom frequency
if user:
    uid = user.get("id")
    resp = requests.get(f"{BASE}/analytics/{uid}/symptoms")
    if resp.status_code == 200:
        body = resp.json()
        data = body.get("data")
        if data and isinstance(data, dict) and "labels" in data and "values" in data:
            print("ANALYTICS OK")
            summary["passed"].append("analytics")
        else:
            print("ANALYTICS FORMAT FAIL", body)
            summary["failed"].append("analytics_format")
    else:
        print("ANALYTICS FAIL", resp.status_code, resp.text)
        summary["failed"].append("analytics")


print("\nSUMMARY")
print("Passed:", summary["passed"]) 
print("Failed:", summary["failed"])