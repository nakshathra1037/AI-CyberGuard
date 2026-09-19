from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class FeedbackCreate(BaseModel):
    incident_id: str
    feedback_type: str  # confirmed_threat, false_positive, benign_anomaly, needs_investigation
    analyst_comment: Optional[str] = None
    analyst_name: Optional[str] = "SecOps-Analyst-1"


class AnalystFeedback(BaseModel):
    feedback_id: str
    incident_id: str
    feedback_type: str
    analyst_comment: Optional[str] = None
    analyst_name: str
    timestamp: str
