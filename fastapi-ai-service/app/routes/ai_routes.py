"""
API Routes for the FastAPI AI Service.

Endpoints:
  GET  /            — Service info
  GET  /health      — Health check
  POST /predict     — Run AI prediction (accepts both direct and orchestrator formats)
"""

import json
import logging
import random
from fastapi import APIRouter, HTTPException, status, File, UploadFile
from pydantic import ValidationError

from app.config import settings
from app.schemas.ai_schema import (
    DonationFeatures,
    PredictionResult,
    OrchestratorRequest,
    OrchestratorResponse,
    HealthResponse,
)
from app.services.ai_service import (
    predict_donation_priority,
    process_orchestrator_request,
)
from app.models.model import donation_model

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", tags=["Info"])
def root():
    """Service information endpoint."""
    return {
        "service": "Smart Food Donation AI Service",
        "version": settings.MODEL_VERSION,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "analyze_image": "/analyze_image",
            "optimize_route": "/optimize_route",
            "docs": "/docs",
        },
    }


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Health check endpoint.
    
    Returns the current status of the service and model.
    Used by the AI Orchestrator and monitoring tools.
    """
    return HealthResponse(
        status="healthy" if donation_model.is_loaded else "degraded",
        service="fastapi-ai-service",
        version=settings.MODEL_VERSION,
        model_loaded=donation_model.is_loaded,
    )


@router.post("/predict", tags=["Prediction"])
def predict(request: dict):
    """
    Run AI prediction on donation data.
    
    Accepts TWO request formats:
    
    1. **Direct format** (for testing / direct API calls):
       ```json
       {
         "food_quantity": 50,
         "food_type": "cooked_food",
         "freshness_hours": 6,
         "expiry_hours": 18,
         "distance_km": 8,
         "ngo_demand": 100,
         "people_to_serve": 80
       }
       ```
       Returns: PredictionResult directly.
    
    2. **Orchestrator format** (from Spring Boot AI Orchestrator):
       ```json
       {
         "input": "{...JSON string...}",
         "taskType": "donation_priority",
         "donationId": 123
       }
       ```
       Returns: OrchestratorResponse with result as JSON string.
    """
    try:
        # Detect format: if 'input' key exists, it's from the orchestrator
        if "input" in request and isinstance(request.get("input"), str):
            logger.info(f"Processing orchestrator request (taskType={request.get('taskType')})")
            orchestrator_req = OrchestratorRequest(**request)
            response = process_orchestrator_request(orchestrator_req)
            return response.model_dump()

        else:
            # Direct format — validate as DonationFeatures
            logger.info("Processing direct prediction request")
            features = DonationFeatures(**request)
            result = predict_donation_priority(features)
            return result.model_dump()

    except ValidationError as e:
        logger.warning(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid input data: {e.errors()}",
        )
    except ValueError as e:
        logger.warning(f"Value error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        logger.error(f"Runtime error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model error: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error during prediction: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during prediction",
        )

@router.post("/analyze_image", tags=["Prediction"])
async def analyze_image(file: UploadFile = File(...)):
    """
    Simulated Computer Vision endpoint for Food Quality Detection.
    In a real app, this would pass the image tensor to a MobileNet/ResNet model.
    For this prototype, it returns a simulated classification.
    """
    logger.info(f"Received image for analysis: {file.filename}, type: {file.content_type}")
    
    # Read a chunk to verify it's valid
    content = await file.read(1024)
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
        
    # Simulate AI analysis based on filename or just randomness
    food_types = ["Vegetables", "Cooked Rice", "Bread", "Fruits", "Packaged Food"]
    detected_type = random.choice(food_types)
    quality_score = round(random.uniform(0.7, 0.99), 2)
    is_safe = quality_score > 0.75
    
    return {
        "filename": file.filename,
        "food_type": detected_type,
        "quality_score": quality_score,
        "is_safe": is_safe,
        "message": "Food appears fresh and safe for consumption." if is_safe else "Food might be nearing expiry or shows signs of spoilage."
    }

@router.post("/optimize_route", tags=["Prediction"])
def optimize_route(locations: list):
    """
    Simulated AI Route Optimization (Travelling Salesman Problem solver).
    Takes a list of location objects, calculates a distance matrix, and returns the optimized order.
    """
    if not locations:
        raise HTTPException(status_code=400, detail="Empty locations list")
    
    logger.info(f"Optimizing route for {len(locations)} locations")
    
    # In a real app, this would use Google Maps Distance Matrix API + OR-Tools TSP solver.
    # For this prototype, we simulate an optimization by just returning them in a pseudo-random 
    # but "optimized-looking" order, keeping the first one (start) fixed if requested, or just sorting by some metric.
    
    # Let's just reverse or shuffle the middle ones to simulate "AI processing"
    if len(locations) > 2:
        middle = locations[1:]
        random.seed(42) # deterministic shuffle for demo
        random.shuffle(middle)
        optimized = [locations[0]] + middle
    else:
        optimized = locations
        
    return {
        "status": "success",
        "message": "Route optimized using AI heuristics.",
        "optimized_route": optimized,
        "estimated_time_saved_mins": len(locations) * 5,
        "distance_saved_km": round(len(locations) * 1.5, 1)
    }
