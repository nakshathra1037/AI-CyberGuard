from fastapi import APIRouter
from typing import Dict, Any
from backend.app.services.demo_service import demo_service

router = APIRouter(prefix="/demo", tags=["Buildathon Demo"])


@router.post("/run")
async def run_full_security_demo():
    """
    Executes the complete end-to-end security pipeline:
    DETECT -> CORRELATE -> EXPLAIN -> INVESTIGATE -> RESPOND -> REPORT -> LEARN
    """
    result = await demo_service.run_demo()
    return result


@router.post("/reset")
async def reset_demo_environment():
    """Clears all stored events, incidents, and actions."""
    return await demo_service.reset_demo()
