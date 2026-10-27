"""
Standalone training script for the Food Donation AI Model.

Usage:
    python train.py

This script:
  1. Generates a synthetic training dataset
  2. Trains a GradientBoosting regression model
  3. Evaluates the model on a held-out test set
  4. Saves the trained model to model/trained_model.pkl
  5. Prints training metrics and sample predictions

IMPORTANT:
  This uses synthetic data for development/testing.
  Replace generate_synthetic_dataset() with real data loading
  for production use.
"""

import sys
import os

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.model import FoodDonationModel
from app.schemas.ai_schema import DonationFeatures
from app.utils.preprocessing import extract_features

MODEL_PATH = "model/trained_model.pkl"


def main():
    print("=" * 60)
    print("Food Donation AI Model — Training Pipeline")
    print("=" * 60)

    model = FoodDonationModel()

    # Train the model
    metrics = model.train_baseline(MODEL_PATH)

    print("\n--- Training Metrics ---")
    for key, value in metrics.items():
        if isinstance(value, float):
            print(f"  {key}: {value:.4f}")
        else:
            print(f"  {key}: {value}")

    # Run sample predictions
    print("\n--- Sample Predictions ---")

    test_cases = [
        DonationFeatures(
            food_quantity=50, food_type="cooked_food",
            freshness_hours=2, expiry_hours=8,
            distance_km=5, ngo_demand=100, people_to_serve=80
        ),
        DonationFeatures(
            food_quantity=200, food_type="grains",
            freshness_hours=0, expiry_hours=720,
            distance_km=15, ngo_demand=50, people_to_serve=30
        ),
        DonationFeatures(
            food_quantity=10, food_type="dairy",
            freshness_hours=20, expiry_hours=24,
            distance_km=3, ngo_demand=200, people_to_serve=50
        ),
    ]

    for i, features in enumerate(test_cases, 1):
        feature_vector = extract_features(features)
        urgency = model.predict_urgency(feature_vector)
        print(f"\n  Test Case {i}: {features.food_type}")
        print(f"    Quantity: {features.food_quantity}kg")
        print(f"    Freshness: {features.freshness_hours}h / Expiry: {features.expiry_hours}h")
        print(f"    Distance: {features.distance_km}km")
        print(f"    Urgency Score: {urgency:.4f}")

    print("\n" + "=" * 60)
    print(f"Model saved to: {MODEL_PATH}")
    print("Training complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
