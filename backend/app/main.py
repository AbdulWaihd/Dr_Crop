from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import predict, recommend

settings = get_settings()

app = FastAPI(
    title="Dr. Crop API",
    description="Crop disease detection and recommendation engine",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, tags=["prediction"])
app.include_router(recommend.router, tags=["recommendation"])


@app.get("/health")
async def health():
    return {"status": "ok"}
