from fastapi import APIRouter
from typing import Dict, Any
from backend.app.schemas.detection import DetectionResult
from backend.app.detection.risk_engine import risk_engine

router = APIRouter(prefix="/detection", tags=["Detection"])


@router.post("/analyze", response_model=DetectionResult)
async def analyze_event_security(event: Dict[str, Any]):
    """Analyzes a security event deterministically and returns risk score and triggered rules."""
    result = risk_engine.analyze_event(event)
    return result
