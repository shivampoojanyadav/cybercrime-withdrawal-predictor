"""
summary.py — GET /api/summary/kpis and /api/summary/analytics
"""
from datetime import datetime, timedelta
import random

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db import get_db, Complaint, Prediction

router = APIRouter()

# Alerts whose backing prediction is still PENDING_DISPATCH are "pending action".
PENDING_STATUSES = ("PENDING_DISPATCH", "DISPATCHED", "ACKNOWLEDGED")

@router.get("/kpis")
def get_summary(search: str = None, db: Session = Depends(get_db)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Base query for filtering
    def _filter(q):
        if search:
            return q.filter(Complaint.victim_city.ilike(f"%{search}%"))
        return q

    complaints_today = (
        _filter(db.query(func.count(Complaint.id)))
        .filter(Complaint.complaint_time >= today_start)
        .scalar()
        or 0
    )

    pending_predictions = (
        _filter(db.query(func.count(Prediction.id)).join(Complaint, Prediction.complaint_id == Complaint.complaint_id))
        .filter(Prediction.status == "PENDING_DISPATCH")
        .scalar()
        or 0
    )

    avg_delay = (
        _filter(db.query(func.avg(Prediction.delay_mins)).join(Complaint, Prediction.complaint_id == Complaint.complaint_id)).scalar() or 0.0
    )

    total_complaints = _filter(db.query(func.count(Complaint.id))).scalar() or 0
    cleared_complaints = (
        _filter(db.query(func.count(Complaint.id)))
        .filter(Complaint.status == "CLEARED")
        .scalar()
        or 0
    )

    intercepted_amount = (
        _filter(db.query(func.coalesce(func.sum(Complaint.amount), 0.0)))
        .filter(Complaint.status == "CLEARED")
        .scalar()
        or 0.0
    )

    return {
        "complaints_filed_today": int(complaints_today),
        "active_high_risk_predictions": int(pending_predictions),
        "alerts_pending_action": int(pending_predictions),
        "avg_prediction_lead_time_mins": round(float(avg_delay), 1),
        "recovery_rate_pct": round(
            (cleared_complaints / total_complaints * 100) if total_complaints else 0.0, 1
        ),
        "intercepted_amount_today": round(float(intercepted_amount), 2),
    }

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """
    Dummy analytics endpoint to satisfy the frontend AnalyticsData interface
    """
    trend = []
    base_date = datetime.utcnow() - timedelta(days=7)
    for i in range(7):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        trend.append({"date": date_str, "count": random.randint(10, 50)})
        
    scam_breakdown = [
        {"type": "KYC Phishing", "count": random.randint(20, 100)},
        {"type": "Investment Scam", "count": random.randint(20, 100)},
        {"type": "Sextortion", "count": random.randint(20, 100)},
        {"type": "Task Fraud", "count": random.randint(20, 100)},
        {"type": "Loan App Fraud", "count": random.randint(20, 100)},
    ]
    
    return {
        "trend": trend,
        "scam_breakdown": scam_breakdown
    }