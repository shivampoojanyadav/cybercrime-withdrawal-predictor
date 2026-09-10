"""
atms.py — GET /atms — Return ATM locations for map rendering
"""
import os
import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

router = APIRouter()

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "..", "..", "data_pipeline")
if not os.path.exists(DATA_DIR):
    DATA_DIR = os.path.join(HERE, "..", "data_pipeline")

ATM_CSV = os.path.join(DATA_DIR, "atm_locations.csv")


def _load_atms() -> pd.DataFrame:
    if not os.path.exists(ATM_CSV):
        raise HTTPException(
            status_code=503,
            detail="ATM data not found in data_pipeline/atm_locations.csv.",
        )
    return pd.read_csv(ATM_CSV)


@router.get("/atms")
def get_atms(city: Optional[str] = Query(None, description="Filter by city name")):
    """Return all ATM locations, optionally filtered by city."""
    df = _load_atms()

    if city:
        df = df[df["city"].str.lower() == city.lower()]
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No ATMs found for city: {city}")

    return df.to_dict(orient="records")


@router.get("/atms/cities")
def get_cities():
    """Return list of unique cities with ATM counts."""
    df = _load_atms()
    city_counts = df.groupby("city").size().reset_index(name="atm_count")
    return city_counts.sort_values("city").to_dict(orient="records")
