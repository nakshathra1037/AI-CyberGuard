from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.app.schemas.report import IncidentReport
from backend.app.database import get_repository
from backend.app.ai.report_generator import report_generator
from backend.app.ai.investigator import ai_investigator
from backend.app.response.simulator import response_simulator

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/{incident_id}", response_model=IncidentReport)
async def get_incident_report(incident_id: str):
    repo = await get_repository()
    inc = await repo.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    # Fetch actions and feedback
    actions_raw = await repo.get_response_actions(incident_id)
    feedbacks_raw = await repo.get_all_feedback()
    matching_fb = next((f for f in feedbacks_raw if f.get("incident_id") == incident_id), None)

    # Generate recommendations
    recs = response_simulator.generate_recommendations(inc)

    # Summary
    ai_resp = await ai_investigator.summarize(inc)

    report = report_generator.generate_report(
        incident=inc,
        recommendations=recs,
        simulated_actions=actions_raw,
        ai_summary=ai_resp.answer,
        feedback=matching_fb
    )
    return report
