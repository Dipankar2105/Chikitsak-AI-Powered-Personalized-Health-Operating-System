"""Rate limiting utilities for API endpoints."""

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional
import threading


class RateLimiter:
    """Simple in-memory rate limiter using sliding window."""
    
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list[float]] = defaultdict(list)
        self._lock = threading.Lock()
    
    def _cleanup_old_requests(self, client_id: str, now: float) -> None:
        """Remove requests older than 1 minute."""
        cutoff = now - 60
        self.requests[client_id] = [ts for ts in self.requests[client_id] if ts > cutoff]
    
    def is_allowed(self, client_id: str) -> Tuple[bool, Optional[int]]:
        """
        Check if request is allowed for client.
        
        Returns:
            (allowed, retry_after_seconds): Boolean and seconds to wait if rate limited
        """
        with self._lock:
            now = datetime.now().timestamp()
            self._cleanup_old_requests(client_id, now)
            
            if len(self.requests[client_id]) < self.requests_per_minute:
                self.requests[client_id].append(now)
                return True, None
            else:
                # Calculate when oldest request expires
                oldest_request = self.requests[client_id][0]
                retry_after = int(60 - (now - oldest_request)) + 1
                return False, retry_after


class PerClientRateLimiter:
    """Rate limiters for different endpoints/scopes."""
    
    def __init__(self):
        self.limiters: Dict[str, RateLimiter] = {}
        self._lock = threading.Lock()
    
    def add_limiter(self, name: str, requests_per_minute: int) -> None:
        """Add a named rate limiter."""
        with self._lock:
            self.limiters[name] = RateLimiter(requests_per_minute)
    
    def is_allowed(self, limiter_name: str, client_id: str) -> Tuple[bool, Optional[int]]:
        """Check if request is allowed."""
        if limiter_name not in self.limiters:
            return True, None  # No limiter configured
        return self.limiters[limiter_name].is_allowed(client_id)


# Global rate limiters
rate_limiters = PerClientRateLimiter()
rate_limiters.add_limiter('global', 60)  # 60 requests/minute globally
rate_limiters.add_limiter('auth', 10)    # 10 requests/minute for auth endpoints
