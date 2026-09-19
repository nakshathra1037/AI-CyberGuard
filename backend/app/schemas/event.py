from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class EventType(str, Enum):
    LOGIN = "login"
    AUTHENTICATION = "authentication"
    PROCESS_EXECUTION = "process_execution"
    NETWORK_ACTIVITY = "network_activity"
    FILE_ACCESS = "file_access"
    ACCOUNT_CHANGE = "account_change"
    CREDENTIAL_ACCESS = "credential_access"
    LATERAL_MOVEMENT = "lateral_movement"
    CLOUD_ACTIVITY = "cloud_activity"
    SECURITY_ALERT = "security_alert"


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class NormalizedEvent(BaseModel):
    event_id: str
    timestamp: str
    event_type: str
    user: Optional[str] = None
    device: Optional[str] = None
    source_ip: Optional[str] = None
    destination: Optional[str] = None
    action: str
    status: str = "success"
    severity: str = "low"
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Extra detection annotations
    risk_score: Optional[int] = 0
    triggered_rules: List[str] = Field(default_factory=list)


class EventCreate(BaseModel):
    event_id: Optional[str] = None
    timestamp: Optional[str] = None
    event_type: str
    user: Optional[str] = None
    device: Optional[str] = None
    source_ip: Optional[str] = None
    destination: Optional[str] = None
    action: str
    status: str = "success"
    severity: Optional[str] = "low"
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
