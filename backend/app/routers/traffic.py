from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ..database import db
from ..models import TrafficQuery, TrafficPredictionResponse
from ..services.traffic_predictor import traffic_predictor

router = APIRouter(prefix="/traffic", tags=["traffic"])

@router.post("/predict", response_model=TrafficPredictionResponse)
async def predict_traffic(query: TrafficQuery):
    """
    Predicts traffic congestion levels and calculates risk score plus alternative routes.
    """
    prediction = traffic_predictor.predict_congestion(
        area=query.area,
        time_str=query.time,
        weather=query.weather
    )
    
    # Store this query evaluation as recent traffic report to display on map/dashboard
    await db.insert_one("traffic", {
        "area": prediction["area"],
        "congestion": prediction["congestion"],
        "risk_score": prediction["risk_score"],
        "alternate_route": prediction["alternate_route"],
        "weather": query.weather,
        "time": query.time
    })
    
    return prediction

@router.get("/", response_model=List[Dict[str, Any]])
async def get_traffic_reports():
    """
    Gets all current traffic congestion records.
    """
    return await db.find_many("traffic", limit=30)
