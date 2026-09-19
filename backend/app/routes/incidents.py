from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timezone

from backend.app.schemas.incident import (
    Incident, IncidentStatusUpdate, TimelineItem, EvidenceItem, AttackStory
)
from backend.app.database import get_repository
from backend.app.correlation.correlator import correlator

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("", response_model=List[Incident])
async def list_incidents():
    repo = await get_repository()
    return await repo.get_all_incidents()


@router.post("", response_model=List[Incident])
async def trigger_correlation():
    """Correlates all ingested events in the database into incidents."""
    repo = await get_repository()
    events = await repo.get_all_events(limit=500)
    if not events:
        return []
    new_incidents = correlator.correlate_events(events)
    for inc in new_incidents:
        await repo.save_incident(inc.model_dump())
    return new_incidents


@router.get("/{incident_id}", response_model=Incident)
async def get_incident(incident_id: str):
    repo = await get_repository()
    inc = await repo.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return inc


@router.patch("/{incident_id}/status", response_model=Incident)
async def update_incident_status(incident_id: str, payload: IncidentStatusUpdate):
    repo = await get_repository()
    updated = await repo.update_incident_status(incident_id, payload.status.value, payload.comment)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return updated


@router.get("/{incident_id}/timeline", response_model=List[TimelineItem])
async def get_incident_timeline(incident_id: str):
    repo = await get_repository()
    inc = await repo.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return inc.get("timeline", [])


@router.get("/{incident_id}/evidence", response_model=List[EvidenceItem])
async def get_incident_evidence(incident_id: str):
    repo = await get_repository()
    inc = await repo.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return inc.get("evidence", [])


@router.get("/{incident_id}/attack-story", response_model=AttackStory)
async def get_incident_attack_story(incident_id: str):
    repo = await get_repository()
    inc = await repo.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    story = inc.get("attack_story")
    if not story:
        raise HTTPException(status_code=404, detail="No attack story reconstructed for this incident")
    return story
