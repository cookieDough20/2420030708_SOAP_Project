# Smart Food Donation AI Service

FastAPI-based Machine Learning service for the Smart Food Donation and Redistribution Platform.

## Overview

This service provides AI-powered predictions for food donation management:
- **Priority Assessment** — Determines how urgently a donation should be redistributed
- **Urgency Scoring** — Calculates a 0-1 urgency score using ML
- **NGO Recommendation** — Suggests the best-fit NGO for each donation
- **Risk Assessment** — Evaluates food safety risks based on freshness and perishability
- **Action Recommendations** — Provides actionable redistribution guidance

## Architecture

```
Spring Boot AI Orchestrator (:8087)
         │
         │  POST /predict
         ▼
   FastAPI AI Service (:8000)
         │
         ├── Routes (ai_routes.py)
         ├── Service Layer (ai_service.py)
         ├── Preprocessing (preprocessing.py)
         └── ML Model (model.py → trained_model.pkl)
```

## Project Structure

```
fastapi-ai-service/
├── app/
│   ├── main.py              # Application entry point
│   ├── config.py             # Environment configuration
│   ├── routes/
│   │   └── ai_routes.py      # API endpoints
│   ├── services/
│   │   └── ai_service.py     # Business logic & prediction pipeline
│   ├── models/
│   │   └── model.py          # ML model management
│   ├── schemas/
│   │   └── ai_schema.py      # Pydantic request/response schemas
│   └── utils/
│       └── preprocessing.py   # Feature engineering
├── model/
│   └── trained_model.pkl      # Trained model (auto-generated)
├── train.py                   # Standalone training script
├── requirements.txt
├── .env
└── README.md
```

## Setup

### Prerequisites
- Python 3.10+
- pip

### Installation

```bash
cd fastapi-ai-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Train the Model

```bash
python train.py
```

### Run the Service

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The service will be available at: http://localhost:8000

## API Endpoints

### GET /
Service information

### GET /health
Health check — returns model status

### POST /predict
Run AI prediction

**Direct format (for testing):**
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

**Orchestrator format (from Spring Boot):**
```json
{
  "input": "{\"food_quantity\":50,\"food_type\":\"cooked_food\",\"freshness_hours\":6,\"expiry_hours\":18,\"distance_km\":8,\"ngo_demand\":100,\"people_to_serve\":80}",
  "taskType": "donation_priority",
  "donationId": 1
}
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| AI_SERVICE_HOST | 0.0.0.0 | Server host |
| AI_SERVICE_PORT | 8000 | Server port |
| MODEL_PATH | model/trained_model.pkl | Path to model file |
| MODEL_VERSION | 1.0.0 | Service version |
| LOG_LEVEL | INFO | Logging level |
| ALLOWED_ORIGINS | http://localhost:8087,http://localhost:8080 | CORS origins |

## Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Direct prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"food_quantity":50,"food_type":"cooked_food","freshness_hours":6,"expiry_hours":18,"distance_km":8,"ngo_demand":100,"people_to_serve":80}'

# Orchestrator format
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"input":"{\"food_quantity\":50,\"food_type\":\"cooked_food\",\"freshness_hours\":6,\"expiry_hours\":18,\"distance_km\":8,\"ngo_demand\":100,\"people_to_serve\":80}","taskType":"donation_priority","donationId":1}'
```
