from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class PatternItem(BaseModel):
    pattern_id: str
    pattern_signature: str
    description: str
    occurrences: int
    severity: str
    mitre_techniques: List[str] = Field(default_factory=list)
    last_observed: str
    examples_incidents: List[str] = Field(default_factory=list)


class SeverityDistribution(BaseModel):
    low: int = 0
    medium: int = 0
    high: int = 0
    critical: int = 0


class HourlyTrend(BaseModel):
    hour: str
    event_count: int
    incident_count: int


class IntelligenceStatistics(BaseModel):
    total_events_processed: int
    total_incidents_created: int
    active_incidents: int
    contained_incidents: int
    critical_incidents: int
    average_risk_score: float
    average_containment_time_seconds: float
    false_positive_rate: float
    severity_distribution: SeverityDistribution
    top_affected_devices: List[Dict[str, Any]] = Field(default_factory=list)
    top_affected_users: List[Dict[str, Any]] = Field(default_factory=list)
    common_incident_types: List[Dict[str, Any]] = Field(default_factory=list)
