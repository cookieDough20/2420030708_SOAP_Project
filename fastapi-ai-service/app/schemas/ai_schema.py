"""
Pydantic schemas for AI service request/response validation.

These schemas define the contract between:
  - The React frontend (via AI Orchestrator) and this service
  - Direct API consumers (for testing)

IMPORTANT: The Spring Boot AI Orchestrator sends:
  { "input": "<JSON string>", "taskType": "...", "donationId": 123 }
  
And expects back:
  { "result": "<JSON string>", "taskType": "...", "donationId": 123 }

The 'input' field contains JSON-serialized donation data.
The 'result' field contains JSON-serialized prediction results.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from enum import Enum


# =========================================
# Enums
# =========================================

class FoodType(str, Enum):
    """Supported food categories."""
    COOKED_FOOD = "cooked_food"
    RAW_VEGETABLES = "raw_vegetables"
    FRUITS = "fruits"
    PACKAGED_FOOD = "packaged_food"
    DAIRY = "dairy"
    BAKERY = "bakery"
    GRAINS = "grains"
    BEVERAGES = "beverages"
    MIXED = "mixed"


class PriorityLevel(str, Enum):
    """Donation priority levels."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


# =========================================
# Internal Schemas (ML Model I/O)
# =========================================

class DonationFeatures(BaseModel):
    """
    Input features for the ML model.
    Represents donation characteristics used for prediction.
    """
    food_quantity: float = Field(
        ..., gt=0,
        description="Quantity of food in kg"
    )
    food_type: str = Field(
        ...,
        description="Type of food being donated"
    )
    freshness_hours: float = Field(
        ..., ge=0,
        description="Hours since food was prepared/harvested"
    )
    expiry_hours: float = Field(
        ..., ge=0,
        description="Hours until food expires"
    )
    distance_km: float = Field(
        ..., ge=0,
        description="Distance to nearest eligible NGO in km"
    )
    ngo_demand: int = Field(
        ..., ge=0,
        description="Current food demand at the NGO (number of meals needed)"
    )
    people_to_serve: int = Field(
        ..., ge=0,
        description="Number of people the donation should serve"
    )

    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={
            "example": {
                "food_quantity": 50,
                "food_type": "cooked_food",
                "freshness_hours": 6,
                "expiry_hours": 18,
                "distance_km": 8,
                "ngo_demand": 100,
                "people_to_serve": 80
            }
        }
    )


class PredictionResult(BaseModel):
    """
    Output from the ML model.
    Contains the prediction results for a donation.
    """
    priority: str = Field(
        ...,
        description="Priority level: CRITICAL, HIGH, MEDIUM, LOW"
    )
    urgency_score: float = Field(
        ..., ge=0, le=1,
        description="Urgency score between 0 and 1"
    )
    recommended_action: str = Field(
        ...,
        description="Suggested action for this donation"
    )
    recommended_ngo: str = Field(
        ...,
        description="Recommended NGO identifier"
    )
    recommended_ngo_id: int = Field(
        ...,
        description="ID of the recommended NGO"
    )
    estimated_people_served: int = Field(
        ..., ge=0,
        description="Estimated number of people this donation can serve"
    )
    risk_level: str = Field(
        ...,
        description="Food safety risk assessment"
    )
    explanation: str = Field(
        ...,
        description="Human-readable explanation of the recommendation"
    )


# =========================================
# Spring Boot Integration Schemas
# (Matches AI Orchestrator DTOs exactly)
# =========================================

class OrchestratorRequest(BaseModel):
    """
    Request schema matching the Spring Boot AiRequest DTO.
    
    The 'input' field is a JSON string containing DonationFeatures.
    The 'taskType' identifies the type of AI task.
    The 'donationId' links this prediction to a specific donation.
    """
    input: str = Field(
        ...,
        description="JSON-serialized donation features"
    )
    taskType: Optional[str] = Field(
        default="donation_priority",
        description="Type of AI task to perform"
    )
    donationId: Optional[int] = Field(
        default=None,
        description="ID of the associated donation"
    )


class OrchestratorResponse(BaseModel):
    """
    Response schema matching the Spring Boot AiResponse DTO.
    
    The 'result' field is a JSON string containing PredictionResult.
    """
    result: str = Field(
        ...,
        description="JSON-serialized prediction result"
    )
    taskType: Optional[str] = Field(
        default=None,
        description="Type of AI task performed"
    )
    donationId: Optional[int] = Field(
        default=None,
        description="ID of the associated donation"
    )


# =========================================
# Health / Info Schemas
# =========================================

class HealthResponse(BaseModel):
    """Health check response."""
    model_config = {"protected_namespaces": ()}

    status: str
    service: str
    version: str
    model_loaded: bool
