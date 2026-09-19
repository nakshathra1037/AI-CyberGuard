from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import time

from backend.app.auth.security import PasswordHasher, TokenManager, RateLimiter
from backend.app.auth.rbac import UserRole, ROLE_PERMISSIONS, require_permission, get_current_token_payload
from backend.app.auth.session_manager import session_manager

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

# Pre-seeded enterprise user database with hashed passwords
ENTERPRISE_USERS: Dict[str, Dict[str, Any]] = {
    "admin@cyberguard.ai": {
        "id": "USR-001",
        "username": "soc_admin",
        "email": "admin@cyberguard.ai",
        "password_hash": PasswordHasher.hash_password("admin123"),
        "full_name": "Marcus Vance",
        "role": UserRole.ADMIN,
        "is_active": True
    },
    "commander@cyberguard.ai": {
        "id": "USR-002",
        "username": "incident_commander",
        "email": "commander@cyberguard.ai",
        "password_hash": PasswordHasher.hash_password("commander123"),
        "full_name": "David Sterling",
        "role": UserRole.INCIDENT_COMMANDER,
        "is_active": True
    },
    "analyst@cyberguard.ai": {
        "id": "USR-003",
        "username": "sarah_analyst",
        "email": "analyst@cyberguard.ai",
        "password_hash": PasswordHasher.hash_password("analyst123"),
        "full_name": "Sarah Connor",
        "role": UserRole.SOC_ANALYST,
        "is_active": True
    },
    "viewer@cyberguard.ai": {
        "id": "USR-004",
        "username": "auditor_elena",
        "email": "viewer@cyberguard.ai",
        "password_hash": PasswordHasher.hash_password("viewer123"),
        "full_name": "Elena Rostova",
        "role": UserRole.VIEWER,
        "is_active": True
    }
}


class LoginRequest(BaseModel):
    username: str
    password: str
    device: Optional[str] = "Chrome-Windows"


class RefreshRequest(BaseModel):
    refresh_token: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in_seconds: int = 3600
    user: Dict[str, Any]
    session_id: str


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    login_id = credentials.username.strip().lower()

    # Rate limiting & lockout check
    allowed, remaining = RateLimiter.record_attempt(f"{client_ip}:{login_id}", success=False)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Account temporarily locked due to excessive failed attempts. Try again in {remaining}s."
        )

    matched_user = None
    for email, u in ENTERPRISE_USERS.items():
        if email.lower() == login_id or u["username"].lower() == login_id:
            if PasswordHasher.verify_password(credentials.password, u["password_hash"]):
                matched_user = u
                break

    if not matched_user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    if not matched_user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled.")

    # Successful login - clear failed rate limit
    RateLimiter.record_attempt(f"{client_ip}:{login_id}", success=True)

    # Session creation and impossible travel check
    device_name = credentials.device or "Unknown-Client"
    transition_check = session_manager.check_suspicious_session_transition(
        user_id=matched_user["id"],
        new_ip=client_ip,
        new_device=device_name
    )
    session = session_manager.create_session(
        user_id=matched_user["id"],
        username=matched_user["username"],
        device=device_name,
        ip=client_ip
    )

    role_val = matched_user["role"].value
    permissions = list(ROLE_PERMISSIONS.get(matched_user["role"], set()))

    access_token = TokenManager.create_access_token({
        "sub": matched_user["id"],
        "email": matched_user["email"],
        "username": matched_user["username"],
        "role": role_val,
        "session_id": session["session_id"]
    })

    refresh_token = TokenManager.create_refresh_token({
        "sub": matched_user["id"],
        "email": matched_user["email"],
        "session_id": session["session_id"]
    })

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in_seconds=3600,
        session_id=session["session_id"],
        user={
            "id": matched_user["id"],
            "username": matched_user["username"],
            "email": matched_user["email"],
            "full_name": matched_user["full_name"],
            "role": role_val,
            "permissions": permissions,
            "impossible_travel_warning": transition_check["is_impossible_travel"]
        }
    )


@router.post("/refresh")
async def refresh_access_token(payload: RefreshRequest):
    data = TokenManager.decode_token(payload.refresh_token)
    if not data or data.get("token_type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    user_id = data.get("sub")
    session_id = data.get("session_id")

    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Session expired or revoked.")

    user_email = data.get("email")
    user_record = ENTERPRISE_USERS.get(user_email)
    if not user_record:
        raise HTTPException(status_code=401, detail="User not found.")

    new_access_token = TokenManager.create_access_token({
        "sub": user_record["id"],
        "email": user_record["email"],
        "username": user_record["username"],
        "role": user_record["role"].value,
        "session_id": session_id
    })

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in_seconds": 3600
    }


@router.post("/logout")
async def logout(payload: dict = Depends(get_current_token_payload), authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        TokenManager.revoke_token(token)
    session_id = payload.get("session_id")
    if session_id:
        session_manager.revoke_session(session_id)
    return {"status": "success", "message": "Successfully logged out and session revoked."}


@router.get("/me")
async def get_my_profile(payload: dict = Depends(get_current_token_payload)):
    email = payload.get("email")
    user_record = ENTERPRISE_USERS.get(email)
    if not user_record:
        return {
            "id": payload.get("sub"),
            "username": payload.get("username"),
            "email": payload.get("email"),
            "full_name": "Development Operator",
            "role": payload.get("role", UserRole.ADMIN.value),
            "permissions": list(ROLE_PERMISSIONS[UserRole.ADMIN])
        }
    return {
        "id": user_record["id"],
        "username": user_record["username"],
        "email": user_record["email"],
        "full_name": user_record["full_name"],
        "role": user_record["role"].value,
        "permissions": list(ROLE_PERMISSIONS.get(user_record["role"], set()))
    }
