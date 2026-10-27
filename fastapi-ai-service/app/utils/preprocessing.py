"""
Preprocessing utilities for transforming raw donation data
into numerical features suitable for the ML model.
"""

import numpy as np
from app.schemas.ai_schema import DonationFeatures


# Food type to numeric encoding
FOOD_TYPE_ENCODING = {
    "cooked_food": 0,
    "raw_vegetables": 1,
    "fruits": 2,
    "packaged_food": 3,
    "dairy": 4,
    "bakery": 5,
    "grains": 6,
    "beverages": 7,
    "mixed": 8,
}

# Shelf life multipliers by food type (relative perishability)
FOOD_PERISHABILITY = {
    "cooked_food": 1.0,     # Most perishable
    "dairy": 0.9,
    "bakery": 0.8,
    "fruits": 0.7,
    "raw_vegetables": 0.6,
    "beverages": 0.4,
    "mixed": 0.5,
    "grains": 0.2,
    "packaged_food": 0.1,   # Least perishable
}


def encode_food_type(food_type: str) -> int:
    """Convert food type string to numeric encoding."""
    return FOOD_TYPE_ENCODING.get(food_type.lower(), 8)


def get_perishability(food_type: str) -> float:
    """Get the perishability score for a food type (0-1)."""
    return FOOD_PERISHABILITY.get(food_type.lower(), 0.5)


def compute_remaining_life_ratio(freshness_hours: float, expiry_hours: float) -> float:
    """
    Compute what fraction of shelf life remains.
    Returns a value between 0 (expired) and 1 (just prepared).
    """
    if expiry_hours <= 0:
        return 0.0
    remaining = max(0, expiry_hours - freshness_hours)
    return min(1.0, remaining / expiry_hours)


def compute_demand_supply_ratio(ngo_demand: int, food_quantity: float) -> float:
    """
    Compute the ratio of demand to supply.
    Higher ratio = more urgent (demand exceeds supply).
    """
    if food_quantity <= 0:
        return 10.0  # Maximum urgency
    return min(10.0, ngo_demand / food_quantity)


def compute_serve_ratio(people_to_serve: int, food_quantity: float) -> float:
    """
    Compute people-per-kg ratio.
    Helps estimate if the donation quantity matches the target.
    """
    if food_quantity <= 0:
        return 0.0
    return min(10.0, people_to_serve / food_quantity)


def extract_features(features: DonationFeatures) -> np.ndarray:
    """
    Transform DonationFeatures into a numerical feature vector
    for the ML model.
    
    Feature vector (9 features):
      [0] food_quantity         - raw quantity in kg
      [1] food_type_encoded     - integer encoding of food type
      [2] freshness_hours       - hours since preparation
      [3] expiry_hours          - hours until expiry
      [4] distance_km           - distance to NGO
      [5] perishability         - food type perishability score
      [6] remaining_life_ratio  - fraction of shelf life remaining
      [7] demand_supply_ratio   - NGO demand / food quantity
      [8] serve_ratio           - people to serve / food quantity
    """
    food_type_encoded = encode_food_type(features.food_type)
    perishability = get_perishability(features.food_type)
    remaining_life = compute_remaining_life_ratio(
        features.freshness_hours, features.expiry_hours
    )
    demand_supply = compute_demand_supply_ratio(
        features.ngo_demand, features.food_quantity
    )
    serve_ratio = compute_serve_ratio(
        features.people_to_serve, features.food_quantity
    )

    feature_vector = np.array([[
        features.food_quantity,
        food_type_encoded,
        features.freshness_hours,
        features.expiry_hours,
        features.distance_km,
        perishability,
        remaining_life,
        demand_supply,
        serve_ratio,
    ]])

    return feature_vector


# Feature names (for documentation and model inspection)
FEATURE_NAMES = [
    "food_quantity",
    "food_type_encoded",
    "freshness_hours",
    "expiry_hours",
    "distance_km",
    "perishability",
    "remaining_life_ratio",
    "demand_supply_ratio",
    "serve_ratio",
]
