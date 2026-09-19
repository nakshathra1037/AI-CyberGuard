from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime, timezone
import uuid

from backend.app.schemas.ai import (
    InvestigateRequest, ExplainRequest, SummarizeRequest, AIResponse, InvestigationRecord
)
from backend.app.database import get_repository
from backend.app.ai.investigator import ai_investigator

router = APIRouter(prefix="/ai", tags=["AI Investigation"])


@router.post("/investigate", response_model=AIResponse)
async def ai_investigate_incident(payload: InvestigateRequest):
    repo = await get_repository()
    inc = await repo.get_incident(payload.incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {payload.incident_id} not found")

    response = await ai_investigator.investigate(inc, payload.question)

    # Save to investigation history
    await repo.save_investigation_record({
        "record_id": f"INV-{uuid.uuid4().hex[:6].upper()}",
        "incident_id": payload.incident_id,
        "question": payload.question,
        "answer": response.answer,
        "timestamp": response.timestamp,
        "evidence_referenced": response.evidence_referenced
    })

    return response


@router.post("/explain", response_model=AIResponse)
async def ai_explain_incident(payload: ExplainRequest):
    repo = await get_repository()
    inc = await repo.get_incident(payload.incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {payload.incident_id} not found")

    return await ai_investigator.explain(inc, focus=payload.focus or "full_incident")


@router.post("/summarize", response_model=AIResponse)
async def ai_summarize_incident(payload: SummarizeRequest):
    repo = await get_repository()
    inc = await repo.get_incident(payload.incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {payload.incident_id} not found")

    return await ai_investigator.summarize(inc, format_type=payload.format or "executive")


@router.get("/history/{incident_id}", response_model=List[InvestigationRecord])
async def get_investigation_history(incident_id: str):
    repo = await get_repository()
    records = await repo.get_investigation_history(incident_id)
    return records
