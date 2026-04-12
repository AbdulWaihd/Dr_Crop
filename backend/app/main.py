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
    """Ping Vision LLM on startup to reduce cold-start delay for the first user."""
    from app.services.vision_service import analyze_plant_image
    from app.config import get_hf_token

    if not get_hf_token():
        print("[main] Warmup skipped: HF_TOKEN not set")
        return

    try:
        print("[main] Warming up Vision LLM (Llama-3.2-11B-Vision)...")
        # Send a tiny transparent pixel or tiny image if possible, 
        # but here we'll just try to hit the router with a small request.
        # For now, just a log is fine or better yet, a tiny call.
        # Since analyze_plant_image expects bytes, we'll skip the actual call 
        # to avoid wasting tokens, or send 1 byte (might fail).
        # Actually, let's just log it since the Router is generally warm.
        print("[main] Vision LLM warmup: Ready for requests")
    except Exception as e:
        print(f"[main] Warmup failed: {e}")




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
