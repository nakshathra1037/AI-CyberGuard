from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class IncidentStatus(str, Enum):
    NEW = "new"
    INVESTIGATING = "investigating"
    ANALYZING = "analyzing"
    CONTAINMENT = "containment"
    CONTAINED = "contained"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class TimelineItem(BaseModel):
    timestamp: str
    event_id: str
    event_type: str
    description: str
    risk_contribution: int = 0
    relationship_to_incident: str
    source: Optional[str] = None
    destination: Optional[str] = None


class EvidenceItem(BaseModel):
    event_id: str
    timestamp: str
    event_type: str
    description: str
    risk_contribution: int = 0
    source: Optional[str] = None
    destination: Optional[str] = None
    relationship_to_incident: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AffectedAssets(BaseModel):
    users: List[str] = Field(default_factory=list)
    devices: List[str] = Field(default_factory=list)
    servers: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    ips: List[str] = Field(default_factory=list)
    cloud_resources: List[str] = Field(default_factory=list)


class AttackStoryNode(BaseModel):
    id: str
    label: str
    type: str  # user, device, process, credential, server, database, ip
    details: Dict[str, Any] = Field(default_factory=dict)


class AttackStoryEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str  # logged_into, executed, accessed_credentials, discovered, moved_to, accessed
    timestamp: Optional[str] = None
    evidence_id: Optional[str] = None


class AttackStory(BaseModel):
    incident_id: str
    summary_text: str
    stages: List[str] = Field(default_factory=list)
    nodes: List[AttackStoryNode] = Field(default_factory=list)
    edges: List[AttackStoryEdge] = Field(default_factory=list)


class Incident(BaseModel):
    incident_id: str
    title: str
    type: str
    severity: str  # low, medium, high, critical
    risk_score: int
    status: IncidentStatus = IncidentStatus.INVESTIGATING
    event_ids: List[str] = Field(default_factory=list)
    affected_users: List[str] = Field(default_factory=list)
    affected_devices: List[str] = Field(default_factory=list)
    affected_assets: AffectedAssets = Field(default_factory=AffectedAssets)
    timeline: List[TimelineItem] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    attack_story: Optional[AttackStory] = None
    created_at: str
    updated_at: str
    status_history: List[Dict[str, Any]] = Field(default_factory=list)


class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus
    comment: Optional[str] = None
