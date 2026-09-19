from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class InvestigateRequest(BaseModel):
    incident_id: str
    question: str
    context_override: Optional[Dict[str, Any]] = None


class ExplainRequest(BaseModel):
    incident_id: str
    focus: Optional[str] = "full_incident"  # "full_incident", "risk_factors", "attack_story", "timeline"


class SummarizeRequest(BaseModel):
    incident_id: str
    format: Optional[str] = "executive"  # "executive", "technical", "bullet_points"


class AIResponse(BaseModel):
    incident_id: str
    question: Optional[str] = None
    answer: str
    confidence: str = "high"
    evidence_referenced: List[str] = Field(default_factory=list)
    suggested_follow_ups: List[str] = Field(default_factory=list)
    model_used: str = "deterministic-fallback"
    timestamp: str


class InvestigationRecord(BaseModel):
    record_id: str
    incident_id: str
    question: str
    answer: str
    timestamp: str
    evidence_referenced: List[str] = Field(default_factory=list)
