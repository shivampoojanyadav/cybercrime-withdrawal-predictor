"""
metadata.py — GET /api/model/metadata — honest live introspection of the
loaded ml_pipeline artifacts (feature importances, cluster map, version).
"""
import os

import joblib
import pandas as pd
from fastapi import APIRouter

from ..paths import (
    MODEL_FILES, DATA_FILES, MODEL_VERSION, validate_artifacts, missing_artifacts
)

router = APIRouter()

# Labels ordered identically to FEATURE_COLS in ml_pipeline/train.py
FEATURE_LABELS = [
    "Fraud Amount Band",
    "Victim City",
    "Source Bank",
    "Fraud Type",
    "Mule Bank",
    "Transaction Count",
    "Hour of Day",
    "Complaint Delay (hours)",
    "Day of Week",
]

# Held-out stratified test-set metrics reported for THIS model in README.md
# (accuracy 56.00%, macro F1 0.5351). They are constants re-read from the
# project's training report, not recomputed at request time.
REPORTED_METRICS = {
    "test_accuracy": 0.56,
    "macro_precision": 0.5352,
    "macro_recall": 0.5394,
    "macro_f1": 0.5351,
}


@router.get("/model/metadata")
def model_metadata():
    missing = missing_artifacts()
    loaded = not missing

    feature_importances: list[dict] = []
    n_clusters = 0
    clusters: list[dict] = []

    if loaded:
        try:
            model = joblib.load(MODEL_FILES["predictor"])
            feature_importances = [
                {"feature": FEATURE_LABELS[i], "importance": round(float(imp), 4)}
                for i, imp in enumerate(model.feature_importances_)
            ]

            centroids = pd.read_csv(DATA_FILES["cluster_centroids"])
            n_clusters = int(len(centroids))
            clusters = [
                {
                    "cluster_id": int(r["cluster_id"]),
                    "lat": float(r["centroid_lat"]),
                    "lng": float(r["centroid_lng"]),
                    "city": str(r["city"]),
                    "atm_count": int(r["atm_count"]),
                }
                for _, r in centroids.iterrows()
            ]
        except Exception as e:  # pragma: no cover - defensive
            loaded = False
            missing = missing or {"model": [str(e)]}

    return {
        "model_version": MODEL_VERSION,
        "model_type": "XGBClassifier",
        "loaded": loaded,
        "classifier_metrics": REPORTED_METRICS if loaded else {},
        "feature_importances": feature_importances,
        "n_clusters": n_clusters,
        "clusters": clusters,
        "missing_artifacts": missing,
    }