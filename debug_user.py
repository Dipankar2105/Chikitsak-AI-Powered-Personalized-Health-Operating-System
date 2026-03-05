from backend.app.models.user import User
try:
    u = User(name="test", email="test@test.com", password_hash="hash", city="Mumbai")
    print(f"User created with city: {u.city}")
except AttributeError as e:
    print(f"AttributeError: {e}")
except Exception as e:
    print(f"Other Error: {e}")
