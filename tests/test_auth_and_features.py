import pytest
import asyncio
from backend.app.auth.security import TokenManager, PasswordHasher, RateLimiter
from backend.app.auth.rbac import UserRole, ROLE_PERMISSIONS
from backend.app.services.cti_service import cti_service
from backend.app.services.websocket_manager import ConnectionManager
from backend.app.ml.anomaly_detector import anomaly_detector
from backend.app.ml.baseline_manager import baseline_manager


def test_password_hashing_and_verification():
    raw_pass = "SuperSecretSecurePass123!"
    hashed = PasswordHasher.hash_password(raw_pass)
    assert hashed.startswith("pbkdf2_sha256$")
    assert PasswordHasher.verify_password(raw_pass, hashed) is True
    assert PasswordHasher.verify_password("wrong_password", hashed) is False


def test_jwt_token_generation_and_validation():
    payload = {"sub": "USR-001", "email": "admin@cyberguard.ai", "role": "ADMIN"}
    token = TokenManager.create_access_token(payload)
    assert token is not None
    assert isinstance(token, str)

    decoded = TokenManager.decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "USR-001"
    assert decoded["email"] == "admin@cyberguard.ai"
    assert decoded["role"] == "ADMIN"
    assert decoded["token_type"] == "access"


def test_token_revocation():
    payload = {"sub": "USR-REV-001"}
    token = TokenManager.create_access_token(payload)
    assert TokenManager.decode_token(token) is not None
    TokenManager.revoke_token(token)
    assert TokenManager.decode_token(token) is None


def test_rate_limiter():
    key = "127.0.0.1:test_user"
    # 4 failed attempts should be allowed
    for _ in range(4):
        allowed, _ = RateLimiter.record_attempt(key, success=False)
        assert allowed is True
    # 5th attempt locks out
    allowed, remaining = RateLimiter.record_attempt(key, success=False)
    assert allowed is False
    assert remaining > 0


def test_ml_anomaly_detection_insufficient_data():
    # New user with no baseline should return INSUFFICIENT_DATA and NOT an anomaly
    event = {
        "user": "brand_new_intern",
        "device": "LAPTOP-NEW-99",
        "source_ip": "10.0.5.20",
        "event_type": "login",
        "description": "Standard login for new user",
        "metadata": {}
    }
    ml_res = anomaly_detector.detect_anomaly(event)
    assert ml_res["baseline_status"] == "INSUFFICIENT_DATA"
    assert ml_res["is_anomaly"] is False


def test_ml_anomaly_detection_true_anomaly():
    # Alex executing encoded powershell and mimikatz from external untrusted IP
    event = {
        "user": "alex",
        "device": "PC-017",
        "source_ip": "185.23.44.12",
        "event_type": "credential_access",
        "description": "powershell.exe -enc execution requesting lsass.exe memory handle",
        "metadata": {"rate_multiplier": 3.5}
    }
    ml_res = anomaly_detector.detect_anomaly(event)
    assert ml_res["baseline_status"] == "BASELINE_ACTIVE"
    assert ml_res["anomaly_score"] >= 0.40
    assert ml_res["is_anomaly"] is True


def test_cti_ip_lookup():
    mal_ip = "185.23.44.12"
    intel = cti_service.lookup_ip(mal_ip)
    assert intel["status"] == "malicious"
    assert intel["reputation_score"] >= 90
    assert "APT29" in intel["threat_actor"]


def test_websocket_manager_broadcast():
    async def run_ws_test():
        manager = ConnectionManager()
        assert len(manager.active_connections) == 0
        await manager.broadcast("TEST_EVENT", {"hello": "world"})
    asyncio.run(run_ws_test())
