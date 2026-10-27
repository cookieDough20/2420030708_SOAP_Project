"""
ML Model management module.

Handles:
  - Loading a trained model from disk
  - Training a baseline model from synthetic data
  - Saving a trained model to disk

IMPORTANT:
  This uses a synthetic dataset and a simple GradientBoosting model
  for development/testing. The architecture is designed so that a
  real trained model can be dropped in as a replacement later.
"""

import os
import logging
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

from app.utils.preprocessing import (
    FEATURE_NAMES,
    encode_food_type,
    get_perishability,
    compute_remaining_life_ratio,
    compute_demand_supply_ratio,
    compute_serve_ratio,
)

logger = logging.getLogger(__name__)


class FoodDonationModel:
    """
    Wrapper around the ML model for food donation priority prediction.
    
    The model predicts an urgency_score (0-1) based on donation features.
    Other outputs (priority level, recommended action, etc.) are derived
    from the urgency score using business rules.
    """

    def __init__(self):
        self.model = None
        self.is_loaded = False

    def load(self, model_path: str) -> bool:
        """
        Load a trained model from disk.
        
        Returns True if successful, False otherwise.
        """
        try:
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.is_loaded = True
                logger.info(f"Model loaded successfully from {model_path}")
                return True
            else:
                logger.warning(f"Model file not found at {model_path}")
                return False
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False

    def predict_urgency(self, features: np.ndarray) -> float:
        """
        Predict urgency score for the given feature vector.
        
        Args:
            features: numpy array of shape (1, 9) — see preprocessing.FEATURE_NAMES
            
        Returns:
            Urgency score between 0.0 and 1.0
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model is not loaded. Train or load a model first.")

        raw_score = self.model.predict(features)[0]
        # Clamp to [0, 1]
        return float(np.clip(raw_score, 0.0, 1.0))

    @staticmethod
    def generate_synthetic_dataset(n_samples: int = 2000, seed: int = 42) -> pd.DataFrame:
        """
        Generate a synthetic dataset for training the baseline model.
        
        The dataset simulates realistic food donation scenarios with
        correlated features and a computed urgency target.
        
        IMPORTANT: This is for development/testing only.
        Replace with real data for production use.
        """
        rng = np.random.RandomState(seed)

        food_types = [
            "cooked_food", "raw_vegetables", "fruits",
            "packaged_food", "dairy", "bakery",
            "grains", "beverages", "mixed"
        ]

        records = []
        for _ in range(n_samples):
            food_type = rng.choice(food_types)
            perishability = get_perishability(food_type)

            # Generate correlated features
            food_quantity = rng.uniform(5, 500)
            freshness_hours = rng.uniform(0, 48)

            # Expiry depends on perishability
            base_expiry = rng.uniform(6, 72)
            expiry_hours = base_expiry * (1 - perishability * 0.5)

            distance_km = rng.uniform(0.5, 50)
            ngo_demand = int(rng.uniform(10, 500))
            people_to_serve = int(rng.uniform(10, 300))

            # Compute derived features
            remaining_life = compute_remaining_life_ratio(freshness_hours, expiry_hours)
            demand_supply = compute_demand_supply_ratio(ngo_demand, food_quantity)
            serve_ratio = compute_serve_ratio(people_to_serve, food_quantity)

            # Compute target urgency score using domain logic
            # Higher urgency when: perishable, close to expiry, high demand, short distance
            urgency = (
                0.30 * (1 - remaining_life) +           # Close to expiry = urgent
                0.25 * perishability +                    # Perishable food = urgent
                0.15 * min(1.0, demand_supply / 5.0) +   # High demand = urgent
                0.10 * min(1.0, serve_ratio / 5.0) +     # Many people to serve = urgent
                0.10 * (1 - min(1.0, distance_km / 50)) + # Closer distance = more feasible
                0.10 * min(1.0, food_quantity / 200)      # Larger quantity = more impactful
            )

            # Add noise
            urgency += rng.normal(0, 0.05)
            urgency = np.clip(urgency, 0.0, 1.0)

            records.append({
                "food_quantity": food_quantity,
                "food_type_encoded": encode_food_type(food_type),
                "freshness_hours": freshness_hours,
                "expiry_hours": expiry_hours,
                "distance_km": distance_km,
                "perishability": perishability,
                "remaining_life_ratio": remaining_life,
                "demand_supply_ratio": demand_supply,
                "serve_ratio": serve_ratio,
                "urgency_score": urgency,
            })

        return pd.DataFrame(records)

    def train_baseline(self, model_path: str) -> dict:
        """
        Train a baseline GradientBoosting model on synthetic data.
        
        This creates a working model for development/testing.
        Replace with real training data and tuned hyperparameters
        for production use.
        
        Returns training metrics.
        """
        logger.info("Generating synthetic training dataset...")
        df = self.generate_synthetic_dataset(n_samples=2000)

        X = df[FEATURE_NAMES].values
        y = df["urgency_score"].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        logger.info("Training GradientBoosting model...")
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            min_samples_split=5,
            min_samples_leaf=3,
            random_state=42,
        )
        self.model.fit(X_train, y_train)
        self.is_loaded = True

        # Evaluate
        y_pred = self.model.predict(X_test)
        y_pred = np.clip(y_pred, 0, 1)

        metrics = {
            "mae": float(mean_absolute_error(y_test, y_pred)),
            "r2_score": float(r2_score(y_test, y_pred)),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "n_features": X.shape[1],
        }

        # Save model
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump(self.model, model_path)
        logger.info(f"Model saved to {model_path}")
        logger.info(f"Training metrics: MAE={metrics['mae']:.4f}, R²={metrics['r2_score']:.4f}")

        return metrics


# Singleton model instance
donation_model = FoodDonationModel()
