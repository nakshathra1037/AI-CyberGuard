import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.database import get_repository
from backend.app.routes import api_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_cyberguard")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AI CyberGuard Backend Engine...")
    repo = await get_repository()
    storage = await repo.get_storage_type()
    logger.info(f"Database active using storage provider: {storage}")
    logger.info("SAFE SIMULATION GUARANTEE: Response engine configured strictly in SIMULATION MODE.")
    yield
    logger.info("Shutting down AI CyberGuard Backend Engine.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous AI Cybersecurity & Incident Investigation Platform",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under prefix /api
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/")
async def root_redirect():
    return {
        "message": "AI CyberGuard Security Platform API is operational.",
        "documentation": "/docs",
        "health": "/api/health",
        "simulation_mode": True
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred in security engine", "error": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
