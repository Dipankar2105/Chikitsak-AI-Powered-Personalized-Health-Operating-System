import urllib.request, json

def req(url, payload=None, token=None):
    request = urllib.request.Request(url, data=json.dumps(payload).encode() if payload else None)
    if payload: request.add_header('Content-Type', 'application/json')
    if token: request.add_header('Authorization', f'Bearer {token}')
    try:
        r = urllib.request.urlopen(request)
        print("HTTP", r.getcode())
        print(r.read().decode())
        return json.loads(r.read().decode()) if r.getcode() == 200 else {}
    except Exception as e:
        print("ERROR:", e)
        if hasattr(e, 'read'): print("BODY:", e.read().decode())
        return {}

print("--- Register ---")
req('http://127.0.0.1:8000/auth/register', {'name': 'RawTest', 'email': 'rawtest4@example.com', 'password': 'securepassword123'})

print("--- Login ---")
resp = req('http://127.0.0.1:8000/auth/login', {'email': 'rawtest4@example.com', 'password': 'securepassword123'})
# Parse manual from string output in script above since we printed it and read() consumes it
import urllib.request
login_req = urllib.request.Request('http://127.0.0.1:8000/auth/login', data=json.dumps({'email': 'rawtest4@example.com', 'password': 'securepassword123'}).encode(), headers={'Content-Type': 'application/json'})
login_raw = json.loads(urllib.request.urlopen(login_req).read().decode())
token = login_raw['data']['access_token']

print("--- Chat ---")
req('http://127.0.0.1:8000/chat', {'message': 'I have a headache', 'mode': 'health', 'language': 'en'}, token)
