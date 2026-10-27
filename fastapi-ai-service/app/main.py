"""
FastAPI AI Service - Main Application Entry Point

Smart Food Donation and Redistribution Platform
AI Prediction Service

This service provides ML-based predictions for food donation
priority, urgency assessment, and NGO recommendations.

Startup sequence:
  1. Load configuration
  2. Load or train the ML model
  3. Configure CORS
  4. Register API routes
  5. Start Uvicorn server
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.ai_routes import router
from app.models.model import donation_model

# =========================================
# Logging Configuration
# =========================================

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# =========================================
# Application Lifespan (startup/shutdown)
# =========================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application startup and shutdown events.
    
    On startup:
      - Try to load existing model from disk
      - If no model exists, train a baseline model on synthetic data
    """
    logger.info("=" * 60)
    logger.info("Starting FastAPI AI Service")
    logger.info(f"Version: {settings.MODEL_VERSION}")
    logger.info(f"Model path: {settings.MODEL_PATH}")
    logger.info("=" * 60)

    # Try loading existing model
    model_loaded = donation_model.load(settings.MODEL_PATH)

    if not model_loaded:
        logger.info("No pre-trained model found. Training baseline model...")
        metrics = donation_model.train_baseline(settings.MODEL_PATH)
        logger.info(f"Baseline model trained successfully: {metrics}")

    logger.info("AI Service is ready to accept predictions")
    logger.info("=" * 60)

    yield  # Application runs here

    # Shutdown
    logger.info("Shutting down FastAPI AI Service")


# =========================================
# FastAPI Application
# =========================================

app = FastAPI(
    title="Smart Food Donation AI Service",
    description=(
        "Machine Learning service for food donation priority prediction, "
        "urgency assessment, and NGO recommendation. "
        "Part of the Smart Food Donation and Redistribution Platform."
    ),
    version=settings.MODEL_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# =========================================
# CORS Middleware
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================
# Register Routes
# =========================================

app.include_router(router)


# =========================================
# Run with Uvicorn (when executed directly)
# =========================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.AI_SERVICE_HOST,
        port=settings.AI_SERVICE_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
    )
