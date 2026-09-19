from fastapi import APIRouter
from backend.app.routes.health import router as health_router
from backend.app.routes.events import router as events_router
from backend.app.routes.detection import router as detection_router
from backend.app.routes.incidents import router as incidents_router
from backend.app.routes.ai import router as ai_router
from backend.app.routes.response import router as response_router
from backend.app.routes.reports import router as reports_router
from backend.app.routes.feedback import router as feedback_router
from backend.app.routes.intelligence import router as intelligence_router
from backend.app.routes.demo import router as demo_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(events_router)
api_router.include_router(detection_router)
api_router.include_router(incidents_router)
api_router.include_router(ai_router)
api_router.include_router(response_router)
api_router.include_router(reports_router)
api_router.include_router(feedback_router)
api_router.include_router(intelligence_router)
api_router.include_router(demo_router)

__all__ = ["api_router"]
