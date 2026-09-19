from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.app.services.scenario_simulator import scenario_simulator

router = APIRouter(prefix="/scenarios", tags=["Multi-Scenario Simulator"])


class RunScenarioRequest(BaseModel):
    scenario_key: str


@router.get("")
async def list_scenarios():
    return [
        {"key": k, **v}
        for k, v in scenario_simulator.SCENARIOS.items()
    ]


@router.post("/run")
async def run_scenario(payload: RunScenarioRequest):
    if payload.scenario_key not in scenario_simulator.SCENARIOS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid scenario key '{payload.scenario_key}'. Choose from: {list(scenario_simulator.SCENARIOS.keys())}"
        )
    result = await scenario_simulator.run_scenario(payload.scenario_key)
    return result
