from fastapi import APIRouter

from app.models.schemas import RecommendRequest, RecommendResponse
from app.services.exa_service import search_agriculture_context
from app.services.llm_service import generate_recommendation
from app.services.weather_service import fetch_weather
from app.utils.geo_utils import isUserInPath

router = APIRouter()


@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendation(req: RecommendRequest):
    """Fetch context from Exa and generate treatment recommendations via LLM."""
    context = await search_agriculture_context(req.disease, req.crop)
    
    env_data = {}
    if req.location:
        weather = await fetch_weather(req.location.lat, req.location.lon)
        env_data["weather"] = weather
        
        # Mock outbreak source roughly 10km away for demonstration
        MOCK_OUTBREAK_LAT = req.location.lat + 0.1
        MOCK_OUTBREAK_LON = req.location.lon + 0.1
        
        if weather and "wind_deg" in weather:
            at_risk = isUserInPath(
                MOCK_OUTBREAK_LAT, 
                MOCK_OUTBREAK_LON, 
                req.location.lat, 
                req.location.lon, 
                weather["wind_deg"]
            )
            env_data["in_disease_wind_path"] = at_risk
            
    if req.soil_ph is not None:
        env_data["soil_ph"] = req.soil_ph
    if req.recent_rainfall:
        env_data["recent_rainfall"] = req.recent_rainfall
        
    recommendation = await generate_recommendation(context, req.disease, req.crop, env_data)

    return RecommendResponse(**recommendation)
