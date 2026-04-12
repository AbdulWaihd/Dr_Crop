"""FastAPI entry point for Dr. Crop backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Dr. Crop API",
    description="Crop disease detection and recommendation engine",
    version="2.0.0",
)

# CORS — allow all origins (frontend is on Vercel)
# Added BEFORE route imports/inclusion to ensure CORS headers are processed first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import agro_context, copilot, predict, recommend

app.include_router(predict.router, tags=["prediction"])
app.include_router(recommend.router, tags=["recommendation"])
app.include_router(agro_context.router, tags=["field-data"])
app.include_router(copilot.router, tags=["copilot"])



@app.on_event("startup")
async def warmup():
    """Ping HF model on startup to reduce cold-start delay for the first user."""
    import os
    import requests
    from app.config import get_hf_token
    from ml.inference import HF_MODEL_URL

    token = get_hf_token()
    if not token:
        print("[main] Warmup skipped: HF_TOKEN not set")
        return

    try:
        print(f"[main] Warming up HF model at {HF_MODEL_URL}...")
        # Just a small ping with dummy data or empty if supported. 
        # API inference usually needs 'inputs'
        requests.post(
            HF_MODEL_URL,
            headers={"Authorization": f"Bearer {token}"},
            json={"inputs": "warmup"},
            timeout=10
        )
        print("[main] Warmup signal sent to HuggingFace")
    except Exception as e:
        print(f"[main] Warmup failed (continuing anyway): {e}")



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
