from fastapi import APIRouter
from datetime import datetime, timezone
from backend.app.database import get_repository
from backend.app.ai.llm_client import llm_client

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    repo = await get_repository()
    storage_type = await repo.get_storage_type()
    return {
        "status": "healthy",
        "service": "AI CyberGuard",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "storage": storage_type,
        "simulation_mode": True,
        "llm_provider": f"OpenAI-compatible ({llm_client.model})" if llm_client.is_configured else "Deterministic Evidence Reasoning Engine"
    }
