"""
AI Service - Business logic layer.

Orchestrates the prediction pipeline:
  1. Parse input features
  2. Preprocess into feature vector
  3. Run ML model inference
  4. Apply business rules to derive final outputs
  5. Return structured prediction result
"""

import json
import logging
import numpy as np
import httpx

from app.schemas.ai_schema import (
    DonationFeatures,
    PredictionResult,
    OrchestratorRequest,
    OrchestratorResponse,
)
from app.utils.preprocessing import extract_features, get_perishability
from app.models.model import donation_model

logger = logging.getLogger(__name__)


# =========================================
# NGO recommendation pool
# =========================================
FALLBACK_NGO_POOL = [
    {"id": 1, "name": "City Food Bank",        "capacity": 200, "specialty": "cooked_food"},
    {"id": 2, "name": "Rural Aid Foundation",   "capacity": 150, "specialty": "grains"},
    {"id": 3, "name": "Fresh Harvest Network",  "capacity": 100, "specialty": "fruits"},
    {"id": 4, "name": "Meals for All",          "capacity": 300, "specialty": "mixed"},
    {"id": 5, "name": "Dairy Care Trust",       "capacity": 80,  "specialty": "dairy"},
    {"id": 6, "name": "Community Kitchen",      "capacity": 250, "specialty": "cooked_food"},
    {"id": 7, "name": "Pack & Share",           "capacity": 180, "specialty": "packaged_food"},
    {"id": 8, "name": "Bakery Bridge",          "capacity": 120, "specialty": "bakery"},
]

def fetch_live_ngos():
    """Fetch live NGOs from the Java NGO Service."""
    try:
        # Assuming the NGO Service runs on port 8084 (or accessible via API Gateway on 8080)
        # We query the unauthenticated endpoint
        response = httpx.get("http://localhost:8080/ngos/available", timeout=3.0)
        if response.status_code == 200:
            data = response.json()
            if data and isinstance(data, list) and len(data) > 0:
                mapped_ngos = []
                for ngo in data:
                    mapped_ngos.append({
                        "id": int(ngo.get("id", 1)),
                        "name": ngo.get("organizationName") or ngo.get("name", "Registered NGO"),
                        "capacity": ngo.get("foodCapacity") or ngo.get("peopleServed", 100),
                        "specialty": "mixed" # Defaults to mixed as Java doesn't track food specialty yet
                    })
                return mapped_ngos
    except Exception as e:
        logger.warning(f"Failed to fetch live NGOs, falling back to simulated pool. Error: {e}")
    return FALLBACK_NGO_POOL



def recommend_ngo(food_type: str, people_to_serve: int) -> dict:
    """
    Recommend the best-fit NGO based on food type and capacity.
    
    Priority:
      1. NGOs specializing in this food type with sufficient capacity
      2. General-purpose NGOs with sufficient capacity
      3. Largest available NGO
    """
    ngo_pool = fetch_live_ngos()

    # Find matching specialty NGOs
    specialty_matches = [
        ngo for ngo in ngo_pool
        if ngo["specialty"] == food_type and ngo["capacity"] >= people_to_serve
    ]
    if specialty_matches:
        return max(specialty_matches, key=lambda n: n["capacity"])

    # Find any NGO with sufficient capacity
    capacity_matches = [
        ngo for ngo in ngo_pool
        if ngo["capacity"] >= people_to_serve
    ]
    if capacity_matches:
        return min(capacity_matches, key=lambda n: n["capacity"])

    # Fallback: largest NGO
    return max(ngo_pool, key=lambda n: n["capacity"])


def determine_priority(urgency_score: float) -> str:
    """Map urgency score to priority level."""
    if urgency_score >= 0.8:
        return "CRITICAL"
    elif urgency_score >= 0.6:
        return "HIGH"
    elif urgency_score >= 0.35:
        return "MEDIUM"
    else:
        return "LOW"


def determine_action(priority: str, remaining_life_ratio: float) -> str:
    """Determine recommended action based on priority and food condition."""
    if priority == "CRITICAL":
        return "Immediate redistribution required — food is highly perishable or expiring soon"
    elif priority == "HIGH":
        if remaining_life_ratio < 0.3:
            return "Urgent pickup and delivery — limited shelf life remaining"
        return "Priority redistribution — schedule pickup within 2 hours"
    elif priority == "MEDIUM":
        return "Standard redistribution — schedule pickup within 6 hours"
    else:
        return "Low priority — can be scheduled for next available pickup window"


def assess_risk(remaining_life_ratio: float, perishability: float) -> str:
    """Assess food safety risk based on remaining life and perishability."""
    risk_score = (1 - remaining_life_ratio) * perishability
    if risk_score >= 0.7:
        return "HIGH — Food approaching expiry, handle with urgency"
    elif risk_score >= 0.4:
        return "MODERATE — Monitor freshness during transit"
    else:
        return "LOW — Food is well within safe consumption window"


def generate_explanation(
    features: DonationFeatures,
    urgency_score: float,
    priority: str,
    ngo: dict,
    remaining_life_ratio: float,
) -> str:
    """Generate a human-readable explanation of the AI recommendation."""
    parts = []

    parts.append(
        f"Analysis of {features.food_quantity}kg of {features.food_type.replace('_', ' ')}:"
    )

    # Freshness assessment
    life_pct = int(remaining_life_ratio * 100)
    if life_pct < 25:
        parts.append(f"⚠️ Only {life_pct}% shelf life remaining — requires immediate action.")
    elif life_pct < 50:
        parts.append(f"Approximately {life_pct}% shelf life remaining — timely redistribution advised.")
    else:
        parts.append(f"{life_pct}% shelf life remaining — food is in good condition.")

    # Demand assessment
    if features.ngo_demand > features.food_quantity * 2:
        parts.append(f"High demand ({features.ngo_demand} meals needed) relative to supply.")
    elif features.ngo_demand > features.food_quantity:
        parts.append(f"Moderate demand-supply gap ({features.ngo_demand} meals needed).")

    # NGO recommendation
    parts.append(
        f"Recommended NGO: {ngo['name']} (ID: {ngo['id']}) — "
        f"capacity for {ngo['capacity']} people, specializes in {ngo['specialty'].replace('_', ' ')}."
    )

    # Distance note
    if features.distance_km < 5:
        parts.append(f"NGO is nearby ({features.distance_km}km) — short delivery time expected.")
    elif features.distance_km > 20:
        parts.append(f"Distance is {features.distance_km}km — plan for adequate transit time.")

    return " ".join(parts)


def estimate_people_served(food_quantity: float, food_type: str) -> int:
    """
    Estimate how many people can be served.
    Uses approximate meals-per-kg based on food type.
    """
    meals_per_kg = {
        "cooked_food": 3.0,
        "raw_vegetables": 2.5,
        "fruits": 4.0,
        "packaged_food": 5.0,
        "dairy": 3.5,
        "bakery": 4.5,
        "grains": 6.0,
        "beverages": 2.0,
        "mixed": 3.0,
    }
    factor = meals_per_kg.get(food_type, 3.0)
    return int(food_quantity * factor)


# =========================================
# Main prediction function
# =========================================

def predict_donation_priority(features: DonationFeatures) -> PredictionResult:
    """
    Full prediction pipeline for a food donation.
    
    Steps:
      1. Extract and preprocess features
      2. Run ML model to get urgency score
      3. Apply business rules for priority, action, NGO selection
      4. Generate explanation
      5. Return structured result
    """
    # Step 1: Extract feature vector
    feature_vector = extract_features(features)

    # Step 2: ML model prediction
    urgency_score = donation_model.predict_urgency(feature_vector)

    # Step 3: Business rules
    priority = determine_priority(urgency_score)

    remaining_life_ratio = float(
        (features.expiry_hours - features.freshness_hours) / features.expiry_hours
        if features.expiry_hours > 0 else 0
    )
    remaining_life_ratio = max(0, min(1, remaining_life_ratio))

    perishability = get_perishability(features.food_type)
    recommended_action = determine_action(priority, remaining_life_ratio)
    risk_level = assess_risk(remaining_life_ratio, perishability)
    ngo = recommend_ngo(features.food_type, features.people_to_serve)
    est_served = estimate_people_served(features.food_quantity, features.food_type)

    # Step 4: Explanation
    explanation = generate_explanation(
        features, urgency_score, priority, ngo, remaining_life_ratio
    )

    # Step 5: Build result
    return PredictionResult(
        priority=priority,
        urgency_score=round(urgency_score, 4),
        recommended_action=recommended_action,
        recommended_ngo=ngo["name"],
        recommended_ngo_id=int(ngo["id"]),
        estimated_people_served=est_served,
        risk_level=risk_level,
        explanation=explanation,
    )


# =========================================
# Orchestrator integration
# =========================================

def process_orchestrator_request(request: OrchestratorRequest) -> OrchestratorResponse:
    """
    Process a request from the Spring Boot AI Orchestrator.
    
    The orchestrator sends the 'input' field as a JSON string.
    We parse it into DonationFeatures, run prediction, and
    return the result as a JSON string in the 'result' field.
    """
    try:
        # Parse the JSON input string into DonationFeatures
        input_data = json.loads(request.input)
        features = DonationFeatures(**input_data)
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"Failed to parse input: {e}")
        raise ValueError(f"Invalid input format: {e}")

    # Run prediction
    result = predict_donation_priority(features)

    # Serialize result back to JSON string
    return OrchestratorResponse(
        result=result.model_dump_json(),
        taskType=request.taskType,
        donationId=request.donationId,
    )
