"""
hotspots.py — GET /hotspots — Active ATM hotspot corridors and cluster centroids
"""
import os
import pandas as pd
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db import get_db, Alert, Prediction

router = APIRouter()

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "..", "..", "data_pipeline")
if not os.path.exists(DATA_DIR):
    DATA_DIR = os.path.join(HERE, "..", "data_pipeline")

CENT_CSV = os.path.join(DATA_DIR, "cluster_centroids.csv")

# Baseline rich cluster definitions for high-fidelity frontend rendering
HOTSPOTS_METADATA = [
    {
        "id": "HOT-NCR-01",
        "name": "Uttam Nagar - Dwarka Sec 14 Mule Strip",
        "district": "West Delhi",
        "state": "Delhi NCT",
        "lat": 28.6200,
        "lon": 77.0600,
        "risk_tier": "CRITICAL",
        "avg_delay_mins": 42,
        "total_incidents_30d": 314,
        "primary_mule_banks": ["SBI", "Kotak", "Bandhan"],
        "top_scams": [
            {"scam": "KYC Phishing", "pct": 45},
            {"scam": "Task Fraud", "pct": 32},
            {"scam": "Loan App Fraud", "pct": 23},
        ],
        "radius_meters": 1400,
    },
    {
        "id": "HOT-NCR-02",
        "name": "Anand Vihar - Kaushambi Bus Terminal Hub",
        "district": "East Delhi / Ghaziabad",
        "state": "Delhi / UP Border",
        "lat": 28.6200,
        "lon": 77.3600,
        "risk_tier": "HIGH",
        "avg_delay_mins": 68,
        "total_incidents_30d": 228,
        "primary_mule_banks": ["HDFC", "ICICI", "Axis"],
        "top_scams": [
            {"scam": "Investment Scam", "pct": 51},
            {"scam": "Task Fraud", "pct": 29},
            {"scam": "KYC Phishing", "pct": 20},
        ],
        "radius_meters": 1800,
    },
    {
        "id": "HOT-NCR-03",
        "name": "Mewat - Nuh Border Cash Out Corridor",
        "district": "Nuh",
        "state": "Haryana",
        "lat": 28.1000,
        "lon": 77.0000,
        "risk_tier": "CRITICAL",
        "avg_delay_mins": 28,
        "total_incidents_30d": 489,
        "primary_mule_banks": ["Bandhan", "SBI", "IDFC"],
        "top_scams": [
            {"scam": "Sextortion", "pct": 58},
            {"scam": "Loan App Fraud", "pct": 24},
            {"scam": "KYC Phishing", "pct": 18},
        ],
        "radius_meters": 2500,
    },
    {
        "id": "HOT-NCR-04",
        "name": "Gurgaon Cyber City - DLF Phase 2 Outskirts",
        "district": "Gurugram",
        "state": "Haryana",
        "lat": 28.4595,
        "lon": 77.0266,
        "risk_tier": "MEDIUM",
        "avg_delay_mins": 110,
        "total_incidents_30d": 142,
        "primary_mule_banks": ["HDFC", "Axis", "ICICI"],
        "top_scams": [
            {"scam": "Investment Scam", "pct": 64},
            {"scam": "Task Fraud", "pct": 26},
            {"scam": "KYC Phishing", "pct": 10},
        ],
        "radius_meters": 1200,
    },
    {
        "id": "HOT-NCR-05",
        "name": "Laxmi Nagar Vikas Marg ATM Cluster",
        "district": "East Delhi",
        "state": "Delhi NCT",
        "lat": 28.6304,
        "lon": 77.2773,
        "risk_tier": "HIGH",
        "avg_delay_mins": 55,
        "total_incidents_30d": 195,
        "primary_mule_banks": ["Kotak", "SBI", "Axis"],
        "top_scams": [
            {"scam": "Task Fraud", "pct": 40},
            {"scam": "KYC Phishing", "pct": 35},
            {"scam": "Loan App Fraud", "pct": 25},
        ],
        "radius_meters": 1100,
    },
    {
        "id": "HOT-NCR-06",
        "name": "Rohini Sec 7 Metro Commercial Belt",
        "district": "North West Delhi",
        "state": "Delhi NCT",
        "lat": 28.7050,
        "lon": 77.1150,
        "risk_tier": "LOW",
        "avg_delay_mins": 85,
        "total_incidents_30d": 98,
        "primary_mule_banks": ["IDFC", "HDFC", "Kotak"],
        "top_scams": [
            {"scam": "Loan App Fraud", "pct": 45},
            {"scam": "Investment Scam", "pct": 30},
            {"scam": "KYC Phishing", "pct": 25},
        ],
        "radius_meters": 950,
    },
]


@router.get("/hotspots")
def get_hotspots(
    city: Optional[str] = Query(None, description="Filter by city name"),
    db: Session = Depends(get_db),
):
    """Return active ATM hotspot zones compatible with MapboxView."""
    # Count active alerts dynamically
    active_alerts = db.query(Alert).filter(Alert.status != "RESOLVED").all()

    hotspots = []
    for h in HOTSPOTS_METADATA:
        matched_alerts = [
            a for a in active_alerts
            if h["district"].lower() in a.predicted_cluster.lower()
            or h["name"].split("-")[0].strip().lower() in a.predicted_cluster.lower()
        ]
        hotspots.append({
            **h,
            "active_alerts_count": max(len(matched_alerts), 1),
        })

    # If CSV centroids exist, also append centroids that aren't already included
    if os.path.exists(CENT_CSV):
        try:
            centroids = pd.read_csv(CENT_CSV)
            for _, c in centroids.iterrows():
                cid = int(c["cluster_id"])
                cit = str(c["city"])
                if cit in ["Delhi", "Nuh", "Jaipur"]:
                    continue  # already covered by rich clusters
                hotspots.append({
                    "id": f"HOT-CL-{cid}",
                    "name": f"{cit} Commercial Hub ATM Cluster",
                    "district": cit,
                    "state": cit,
                    "lat": float(c["centroid_lat"]),
                    "lon": float(c["centroid_lng"]),
                    "risk_tier": "HIGH" if cid < 5 else "MEDIUM",
                    "active_alerts_count": 0,
                    "avg_delay_mins": 60,
                    "total_incidents_30d": int(c["atm_count"]) * 4,
                    "primary_mule_banks": ["SBI", "HDFC", "ICICI"],
                    "top_scams": [
                        {"scam": "Task Fraud", "pct": 45},
                        {"scam": "Investment Scam", "pct": 35},
                        {"scam": "KYC Phishing", "pct": 20},
                    ],
                    "radius_meters": 1500,
                })
        except Exception:
            pass

    if city:
        hotspots = [h for h in hotspots if city.lower() in h["name"].lower() or city.lower() in h["district"].lower()]

    return hotspots