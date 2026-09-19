from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class TriggeredRule(BaseModel):
    rule_id: str
    name: str
    weight: int
    reason: str
    evidence_fields: Dict[str, Any] = Field(default_factory=dict)


class DetectionResult(BaseModel):
    event_id: str
    risk_score: int
    severity: str
    triggered_rules: List[TriggeredRule] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    suspicious_indicators: List[str] = Field(default_factory=list)
    contextual_bonus: int = 0
    is_suspicious: bool = False
