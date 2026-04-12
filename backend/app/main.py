"""FastAPI entry point for Dr. Crop backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import agro_context, copilot, predict, recommend

app = FastAPI(
    title="Dr. Crop API",
    description="Crop disease detection and recommendation engine",
    version="2.0.0",
)

# CORS — allow all origins (frontend is on Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, tags=["prediction"])
app.include_router(recommend.router, tags=["recommendation"])
app.include_router(agro_context.router, tags=["field-data"])
app.include_router(copilot.router, tags=["copilot"])


@app.get("/")
async def root():
    return {
        "service": "Dr. Crop API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/health/ready")
async def health_ready():
    from app.config import get_hf_token
    token = get_hf_token()
    return {
        "status": "ok",
        "hf_token_configured": bool(token),
        "hf_token_preview": f"{token[:10]}..." if len(token) > 10 else "(not set)",
    }
