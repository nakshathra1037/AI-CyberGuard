import hashlib
import hmac
import os
import base64
import json
import time
from typing import Dict, Any, Optional, Tuple

JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "ai-cyberguard-production-secret-superkey-2026")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))


class PasswordHasher:
    """
    Secure password hashing using PBKDF2-HMAC-SHA256 with dynamic per-user salts.
    Provides standard cryptographic security without requiring external C-dependencies.
    """
    ITERATIONS = 100_000

    @classmethod
    def hash_password(cls, password: str) -> str:
        salt = os.urandom(16)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, cls.ITERATIONS)
        salt_b64 = base64.b64encode(salt).decode("ascii")
        key_b64 = base64.b64encode(key).decode("ascii")
        return f"pbkdf2_sha256${cls.ITERATIONS}${salt_b64}${key_b64}"

    @classmethod
    def verify_password(cls, password: str, hashed: str) -> bool:
        try:
            algorithm, iterations_str, salt_b64, key_b64 = hashed.split("$")
            iterations = int(iterations_str)
            salt = base64.b64decode(salt_b64.encode("ascii"))
            expected_key = base64.b64decode(key_b64.encode("ascii"))
            key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
            return hmac.compare_digest(key, expected_key)
        except Exception:
            return False


class TokenManager:
    """
    HMAC-SHA256 JWT Generator and Validator with refresh token rotation and revocation tracking.
    """
    _revoked_tokens: set = set()

    @classmethod
    def revoke_token(cls, token: str):
        cls._revoked_tokens.add(token)

    @classmethod
    def is_token_revoked(cls, token: str) -> bool:
        return token in cls._revoked_tokens

    @classmethod
    def create_access_token(cls, data: Dict[str, Any], expires_delta_seconds: Optional[int] = None) -> str:
        payload = data.copy()
        exp = int(time.time()) + (expires_delta_seconds if expires_delta_seconds else ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        payload["exp"] = exp
        payload["token_type"] = "access"
        payload["jti"] = base64.urlsafe_b64encode(os.urandom(8)).decode().rstrip("=")
        return cls._encode_jwt(payload)

    @classmethod
    def create_refresh_token(cls, data: Dict[str, Any]) -> str:
        payload = data.copy()
        exp = int(time.time()) + (REFRESH_TOKEN_EXPIRE_DAYS * 86400)
        payload["exp"] = exp
        payload["token_type"] = "refresh"
        payload["jti"] = base64.urlsafe_b64encode(os.urandom(8)).decode().rstrip("=")
        return cls._encode_jwt(payload)

    @classmethod
    def decode_token(cls, token: str) -> Optional[Dict[str, Any]]:
        if cls.is_token_revoked(token):
            return None
        return cls._decode_jwt(token)

    @classmethod
    def _encode_jwt(cls, payload: Dict[str, Any]) -> str:
        header = {"alg": "HS256", "typ": "JWT"}
        header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        signature = hmac.new(
            JWT_SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
        return f"{header_b64}.{payload_b64}.{sig_b64}"

    @classmethod
    def _decode_jwt(cls, token: str) -> Optional[Dict[str, Any]]:
        try:
            parts = token.split(".")
            if len(parts) != 3:
                return None
            header_b64, payload_b64, sig_b64 = parts
            expected_sig = hmac.new(
                JWT_SECRET_KEY.encode(),
                f"{header_b64}.{payload_b64}".encode(),
                hashlib.sha256
            ).digest()
            actual_sig = base64.urlsafe_b64decode(sig_b64 + "=" * (-len(sig_b64) % 4))
            if not hmac.compare_digest(expected_sig, actual_sig):
                return None
            payload_json = base64.urlsafe_b64decode(payload_b64 + "=" * (-len(payload_b64) % 4)).decode()
            payload = json.loads(payload_json)
            if payload.get("exp", 0) < time.time():
                return None
            return payload
        except Exception:
            return None


class RateLimiter:
    """Tracks failed login attempts and applies temporary account lockout."""
    _attempts: Dict[str, Dict[str, Any]] = {}
    MAX_ATTEMPTS = 5
    LOCKOUT_SECONDS = 300

    @classmethod
    def record_attempt(cls, key: str, success: bool) -> Tuple[bool, int]:
        now = time.time()
        record = cls._attempts.get(key, {"count": 0, "lockout_until": 0})
        if record["lockout_until"] > now:
            return False, int(record["lockout_until"] - now)
        if success:
            cls._attempts.pop(key, None)
            return True, 0
        else:
            record["count"] += 1
            if record["count"] >= cls.MAX_ATTEMPTS:
                record["lockout_until"] = now + cls.LOCKOUT_SECONDS
                cls._attempts[key] = record
                return False, cls.LOCKOUT_SECONDS
            cls._attempts[key] = record
            return True, 0
