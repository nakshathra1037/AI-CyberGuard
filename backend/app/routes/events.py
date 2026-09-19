from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from backend.app.schemas.event import NormalizedEvent, EventCreate
from backend.app.database import get_repository
from backend.app.detection.risk_engine import risk_engine

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[NormalizedEvent])
async def list_events(limit: int = Query(100, ge=1, le=500)):
    repo = await get_repository()
    events = await repo.get_all_events(limit=limit)
    return events


@router.post("", response_model=NormalizedEvent, status_code=201)
async def ingest_event(payload: EventCreate):
    repo = await get_repository()
    now_str = datetime.now(timezone.utc).isoformat()
    ev_id = payload.event_id or f"EVT-{uuid.uuid4().hex[:6].upper()}"

    # Analyze with detection engine
    ev_dict = payload.model_dump()
    ev_dict["event_id"] = ev_id
    ev_dict["timestamp"] = payload.timestamp or now_str

    det = risk_engine.analyze_event(ev_dict)
    ev_dict["risk_score"] = det.risk_score
    ev_dict["triggered_rules"] = [r.name for r in det.triggered_rules]
    ev_dict["severity"] = det.severity

    saved = await repo.save_event(ev_dict)
    return saved


@router.get("/{event_id}", response_model=NormalizedEvent)
async def get_event(event_id: str):
    repo = await get_repository()
    ev = await repo.get_event(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
    return ev
