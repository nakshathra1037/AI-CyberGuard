from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    AUDITOR = "auditor"


class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: UserRole
    avatar_url: Optional[str] = None
    permissions: List[str]


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
    expires_in_seconds: int = 86400
