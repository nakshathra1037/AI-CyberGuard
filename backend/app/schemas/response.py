from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ResponseRecommendation(BaseModel):
    action_type: str  # revoke_session, isolate_endpoint, block_ip, reset_credentials, notify_security_team
    target: str
    priority: str  # immediate, high, medium, low
    description: str
    rationale: str
    requires_approval: bool = True


class SimulatedAction(BaseModel):
    action_id: str
    incident_id: str
    action_type: str
    target: str
    status: str = "completed"  # pending, executing, completed, failed
    simulation: bool = True
    timestamp: str
    details: Dict[str, Any] = Field(default_factory=dict)
    executed_by: str = "AI-CyberGuard-Simulator"
    command_simulated: str = ""


class SimulateActionRequest(BaseModel):
    incident_id: str
    action_type: str
    target: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class SimulateAllRequest(BaseModel):
    incident_id: str
    mode: str = "automatic"  # automatic or approved
