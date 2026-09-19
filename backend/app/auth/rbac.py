from enum import Enum
from typing import List, Set, Callable
from fastapi import HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.app.auth.security import TokenManager

security_scheme = HTTPBearer(auto_error=False)


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SOC_ANALYST = "SOC_ANALYST"
    INCIDENT_COMMANDER = "INCIDENT_COMMANDER"
    VIEWER = "VIEWER"


# Strict least-privilege permission matrix
ROLE_PERMISSIONS = {
    UserRole.ADMIN: {
        "users:manage",
        "roles:manage",
        "system:configure",
        "incidents:read",
        "incidents:write",
        "actions:approve",
        "actions:execute",
        "reports:generate",
        "ai:investigate",
        "audit:view",
        "telemetry:ingest"
    },
    UserRole.INCIDENT_COMMANDER: {
        "incidents:read",
        "incidents:write",
        "actions:approve",
        "actions:reject",
        "actions:execute",
        "reports:generate",
        "ai:investigate",
        "audit:view",
        "telemetry:ingest"
    },
    UserRole.SOC_ANALYST: {
        "incidents:read",
        "incidents:write",
        "actions:recommend",
        "reports:generate",
        "ai:investigate",
        "feedback:submit",
        "telemetry:ingest",
        "audit:view"
    },
    UserRole.VIEWER: {
        "incidents:read",
        "reports:read",
        "intelligence:view",
        "audit:view"
    }
}


def get_current_token_payload(credentials: HTTPAuthorizationCredentials = Security(security_scheme)) -> dict:
    """Extracts and validates JWT access token from Authorization header."""
    if not credentials:
        # Development default payload if unauthenticated
        return {
            "sub": "USR-DEV-001",
            "username": "soc_lead",
            "role": UserRole.ADMIN.value,
            "permissions": list(ROLE_PERMISSIONS[UserRole.ADMIN]),
            "email": "admin@cyberguard.ai"
        }
    token = credentials.credentials
    payload = TokenManager.decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")
    if payload.get("token_type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type. Access token required.")
    return payload


def require_permission(required_permission: str) -> Callable:
    """Dependency factory ensuring authenticated actor holds the specified permission."""
    def permission_checker(payload: dict = Depends(get_current_token_payload)) -> dict:
        role_str = payload.get("role", UserRole.VIEWER.value)
        try:
            role = UserRole(role_str)
        except ValueError:
            raise HTTPException(status_code=403, detail=f"Invalid user role: {role_str}")

        allowed_permissions = ROLE_PERMISSIONS.get(role, set())
        if required_permission not in allowed_permissions:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Role '{role.value}' lacks required permission '{required_permission}'"
            )
        return payload
    return permission_checker


def require_role(allowed_roles: List[UserRole]) -> Callable:
    """Dependency factory ensuring authenticated actor possesses one of the allowed roles."""
    def role_checker(payload: dict = Depends(get_current_token_payload)) -> dict:
        role_str = payload.get("role", UserRole.VIEWER.value)
        try:
            role = UserRole(role_str)
        except ValueError:
            raise HTTPException(status_code=403, detail=f"Invalid user role: {role_str}")

        if role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Role '{role.value}' is not authorized for this operation"
            )
        return payload
    return role_checker
