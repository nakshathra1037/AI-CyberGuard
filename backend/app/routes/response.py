from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.schemas.response import (
    ResponseRecommendation, SimulatedAction, SimulateActionRequest, SimulateAllRequest
)
from backend.app.database import get_repository
from backend.app.response.simulator import response_simulator
from backend.app.schemas.incident import IncidentStatus

router = APIRouter(tags=["Response Simulation"])


@router.get("/incidents/{incident_id}/recommendations", response_model=List[ResponseRecommendation])
async def get_incident_recommendations(incident_id: str):
    repo = await get_repository()
    inc = await repo.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return response_simulator.generate_recommendations(inc)


@router.post("/response/simulate", response_model=SimulatedAction)
async def simulate_single_action(payload: SimulateActionRequest):
    repo = await get_repository()
    inc = await repo.get_incident(payload.incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {payload.incident_id} not found")

    action = response_simulator.simulate_action(
        incident_id=payload.incident_id,
        action_type=payload.action_type,
        target=payload.target,
        parameters=payload.parameters
    )
    await repo.save_response_action(action.model_dump())
    return action


@router.post("/response/simulate-all", response_model=List[SimulatedAction])
async def simulate_all_actions(payload: SimulateAllRequest):
    repo = await get_repository()
    inc = await repo.get_incident(payload.incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {payload.incident_id} not found")

    actions = response_simulator.simulate_all_recommendations(inc)
    for act in actions:
        await repo.save_response_action(act.model_dump())

    # Update incident status to contained
    await repo.update_incident_status(
        payload.incident_id,
        IncidentStatus.CONTAINED.value,
        comment=f"All {len(actions)} containment actions executed in simulation mode."
    )
    return actions


@router.get("/incidents/{incident_id}/response-history", response_model=List[SimulatedAction])
async def get_incident_response_history(incident_id: str):
    repo = await get_repository()
    actions = await repo.get_response_actions(incident_id)
    return actions
