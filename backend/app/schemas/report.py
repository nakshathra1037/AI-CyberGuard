from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from backend.app.schemas.incident import TimelineItem, EvidenceItem, AffectedAssets, AttackStory
from backend.app.schemas.response import ResponseRecommendation, SimulatedAction


class RiskAssessment(BaseModel):
    risk_score: int
    severity: str
    primary_factors: List[str] = Field(default_factory=list)
    confidence_level: str = "high"
    potential_impact: str = "Confidential customer data access and potential lateral spread"


class IncidentReport(BaseModel):
    report_id: str
    incident_id: str
    title: str
    generated_at: str
    status: str
    executive_summary: str
    incident_metadata: Dict[str, Any] = Field(default_factory=dict)
    risk_assessment: RiskAssessment
    attack_timeline: List[TimelineItem] = Field(default_factory=list)
    affected_assets: AffectedAssets
    evidence: List[EvidenceItem] = Field(default_factory=list)
    attack_story: Optional[AttackStory] = None
    ai_analysis: str
    recommendations: List[ResponseRecommendation] = Field(default_factory=list)
    response_actions: List[SimulatedAction] = Field(default_factory=list)
    analyst_feedback: Optional[Dict[str, Any]] = None
    disclaimer: str = "SAFE SIMULATION MODE: All defensive containment actions listed are simulated. No live systems were altered."
