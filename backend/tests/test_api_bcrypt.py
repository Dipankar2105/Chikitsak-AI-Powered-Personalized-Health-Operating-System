import traceback
from passlib.context import CryptContext

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    h = pwd_context.hash("securepassword123")
    print(h)
    print(pwd_context.verify("securepassword123", h))
except Exception as e:
    traceback.print_exc()
