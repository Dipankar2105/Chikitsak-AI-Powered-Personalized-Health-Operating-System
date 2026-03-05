"""CSRF Protection Middleware and Utilities"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

class CSRFTokenManager:
    """Manages CSRF token generation, validation, and expiration."""
    
    def __init__(self, token_lifetime_hours: int = 24):
        self.token_lifetime = timedelta(hours=token_lifetime_hours)
        self.tokens: dict[str, tuple[str, datetime]] = {}  # {token: (session_id, expiry)}
    
    def generate_token(self, session_id: str) -> str:
        """Generate a new CSRF token for the given session."""
        token = secrets.token_urlsafe(32)
        expiry = datetime.now(timezone.utc) + self.token_lifetime
        self.tokens[token] = (session_id, expiry)
        return token
    
    def validate_token(self, token: str, session_id: str) -> bool:
        """Validate a CSRF token against a session ID."""
        if token not in self.tokens:
            return False
        
        stored_session, expiry = self.tokens[token]
        
        # Check expiration
        if datetime.now(timezone.utc) > expiry:
            del self.tokens[token]
            return False
        
        # Verify session match
        if stored_session != session_id:
            return False
        
        # Token is valid - optionally (rotate on each use)
        # del self.tokens[token]  # Uncomment for extra security
        
        return True
    
    def cleanup_expired(self) -> int:
        """Remove expired tokens. Returns count removed."""
        now = datetime.now(timezone.utc)
        expired = [tk for tk, (_, exp) in self.tokens.items() if now > exp]
        for token in expired:
            del self.tokens[token]
        return len(expired)


# Global CSRF token manager
csrf_manager = CSRFTokenManager(token_lifetime_hours=24)
