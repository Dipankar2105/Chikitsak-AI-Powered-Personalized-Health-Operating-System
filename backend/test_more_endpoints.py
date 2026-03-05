import requests, uuid

base = 'http://localhost:8000'

# register user
email = f"test{uuid.uuid4().hex[:6]}@example.com"
r = requests.post(base+'/auth/register', json={'name':'Tester','email':email,'password':'pass'})
print('register', r.status_code, r.text[:200])
if r.status_code!=201:
    exit(1)
token = r.json()['data']['access_token']
headers = {'Authorization': f'Bearer {token}'}

# med safety
resp = requests.post(base+'/medication/safety-check', json={'user_id':1,'medications':['aspirin','ibuprofen']}, headers=headers)
print('/medication/safety-check', resp.status_code, resp.text)

# symptom log
txt = 'headache and slight fever'
resp = requests.post(base+'/symptoms/log', json={'symptoms':[txt]}, headers=headers)
print('/symptoms/log', resp.status_code, resp.text)

# lab or health profile maybe create additional
