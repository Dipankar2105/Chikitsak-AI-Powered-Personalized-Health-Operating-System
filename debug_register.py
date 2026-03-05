import requests
import json

url = "http://127.0.0.1:8000/auth/register"
payload = {
    "name": "Test User",
    "email": "testnew_12345@example.com",
    "password": "Password123!",
    "city": "Mumbai",
    "country": "India"
}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
