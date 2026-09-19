from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import json

from backend.app.schemas.event import (
    NormalizedEvent, EventCreate, BulkEventIngestRequest,
    BulkIngestResponse, SimulateInjectionRequest
)
from backend.app.database import get_repository
from backend.app.detection.risk_engine import risk_engine
from backend.app.services.cti_service import cti_service
from backend.app.services.websocket_manager import ws_manager

try:
    from backend.app.services.ingestion_service import ingestion_service
except ImportError:
    ingestion_service = None

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

    # CTI Threat Intelligence Enrichment
    ev_dict = cti_service.enrich_event(ev_dict)

    det = risk_engine.analyze_event(ev_dict)
    ev_dict["risk_score"] = det.risk_score
    ev_dict["triggered_rules"] = [r.name for r in det.triggered_rules]
    ev_dict["severity"] = det.severity

    saved = await repo.save_event(ev_dict)

    # Broadcast via WebSocket
    await ws_manager.broadcast("NEW_EVENT", saved)
    if det.is_suspicious or det.risk_score >= 60:
        await ws_manager.broadcast("THREAT_ALERT", {
            "event_id": ev_id,
            "risk_score": det.risk_score,
            "severity": det.severity,
            "reasons": det.reasons,
            "description": ev_dict.get("description", "")
        })

    return saved


@router.post("/bulk", response_model=BulkIngestResponse)
async def bulk_ingest_events(payload: BulkEventIngestRequest):
    """Ingests multiple structured events in one batch and optionally updates correlation."""
    if not ingestion_service:
        raise HTTPException(status_code=501, detail="Bulk ingestion service unavailable")
    raw_list = [e.model_dump() for e in payload.events]
    result = await ingestion_service.process_and_ingest_events(
        raw_list,
        correlate_immediately=payload.correlate_immediately
    )
    return result


@router.post("/upload", response_model=BulkIngestResponse)
async def upload_log_file(
    file: UploadFile = File(...),
    correlate: bool = Form(True)
):
    """
    Accepts uploaded .json or .csv log files, validates records,
    evaluates risk, and automatically correlates into incidents.
    """
    if not ingestion_service:
        raise HTTPException(status_code=501, detail="Upload ingestion service unavailable")
    filename = file.filename.lower() if file.filename else "log.txt"
    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8", errors="replace")

        if filename.endswith(".csv"):
            raw_events = ingestion_service.parse_csv_content(content_str)
        else:
            # Default to JSON parsing
            raw_events = ingestion_service.parse_json_content(content_str)

        if not raw_events:
            raise HTTPException(status_code=400, detail="Log file contained 0 parsable events.")

        result = await ingestion_service.process_and_ingest_events(
            raw_events,
            correlate_immediately=correlate
        )
        return result
    except json.JSONDecodeError as jde:
        raise HTTPException(status_code=400, detail=f"Malformed JSON in uploaded file: {str(jde)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process log file: {str(e)}")


@router.post("/simulate-injection", response_model=BulkIngestResponse)
async def inject_simulated_scenario(payload: SimulateInjectionRequest):
    """Injects a pre-configured synthetic multi-stage attack scenario for live testing."""
    if not ingestion_service:
        raise HTTPException(status_code=501, detail="Scenario generator unavailable")
    synthetic_events = ingestion_service.generate_simulated_scenario_events(
        scenario=payload.scenario,
        user=payload.target_user or "sarah",
        device=payload.target_device or "PC-042"
    )
    result = await ingestion_service.process_and_ingest_events(
        synthetic_events,
        correlate_immediately=payload.correlate_immediately
    )
    return result


@router.get("/{event_id}", response_model=NormalizedEvent)
async def get_event(event_id: str):
    repo = await get_repository()
    ev = await repo.get_event(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
    return ev
