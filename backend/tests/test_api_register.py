import urllib.request, json
req = urllib.request.Request('http://127.0.0.1:8000/auth/register', data=json.dumps({'name': 'Test User', 'email': 'test5@example.com', 'password': 'securepassword123'}).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    urllib.request.urlopen(req)
except Exception as e:
    print(e.read().decode() if hasattr(e, 'read') else e)
