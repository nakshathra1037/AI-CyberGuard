from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime, timezone
import uuid

from backend.app.schemas.feedback import FeedbackCreate, AnalystFeedback
from backend.app.database import get_repository
from backend.app.schemas.incident import IncidentStatus

router = APIRouter(prefix="/feedback", tags=["Feedback & Learning"])


@router.post("", response_model=AnalystFeedback)
async def submit_feedback(payload: FeedbackCreate):
    repo = await get_repository()
    now_str = datetime.now(timezone.utc).isoformat()
    feedback_id = f"FB-{uuid.uuid4().hex[:6].upper()}"

    fb_data = {
        "feedback_id": feedback_id,
        "incident_id": payload.incident_id,
        "feedback_type": payload.feedback_type,
        "analyst_comment": payload.analyst_comment,
        "analyst_name": payload.analyst_name or "SecOps-Analyst-1",
        "timestamp": now_str
    }

    # Save feedback
    saved = await repo.save_feedback(fb_data)

    # Adjust incident status if marked as false positive
    if payload.feedback_type == "false_positive":
        await repo.update_incident_status(
            payload.incident_id,
            IncidentStatus.FALSE_POSITIVE.value,
            comment=f"Analyst marked as false positive: {payload.analyst_comment}"
        )
    elif payload.feedback_type == "confirmed_threat":
        await repo.update_incident_status(
            payload.incident_id,
            IncidentStatus.CONTAINED.value,
            comment=f"Analyst confirmed active threat: {payload.analyst_comment}"
        )

    return saved


@router.get("", response_model=List[AnalystFeedback])
async def list_feedback():
    repo = await get_repository()
    return await repo.get_all_feedback()
