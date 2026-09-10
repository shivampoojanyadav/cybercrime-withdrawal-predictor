"""
alerts.py — Real-time predictive alert management endpoints
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import get_db, Alert, Complaint

router = APIRouter()


class DispatchPayload(BaseModel):
    department: Optional[str] = "Field QRT Intercept Desk"
    note: Optional[str] = None
    timestamp: Optional[str] = None


class AcknowledgePayload(BaseModel):
    timestamp: Optional[str] = None


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    """Return all active alerts ordered by creation date desc."""
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    results = []
    for a in alerts:
        results.append({
            "id":                 a.id,
            "complaint_id":       a.complaint_id,
            "priority":           a.priority,
            "scam_type":          a.scam_type,
            "fraud_amount":       a.fraud_amount,
            "predicted_atm_name": a.predicted_atm_name,
            "predicted_cluster":  a.predicted_cluster,
            "predicted_lat":      a.predicted_lat,
            "predicted_lon":      a.predicted_lon,
            "source_bank":        a.source_bank,
            "mule_bank":          a.mule_bank,
            "target_delay_mins":  a.target_delay_mins,
            "seconds_remaining":  a.seconds_remaining,
            "created_at":         a.created_at.strftime("%H:%M:%S") if a.created_at else "19:40:00",
            "assigned_officer":   a.assigned_officer,
            "status":             a.status,
            "is_new":             bool(a.is_new),
        })
    return results


@router.post("/alerts/{alert_id}/dispatch")
def dispatch_alert(alert_id: str, payload: Optional[DispatchPayload] = None, db: Session = Depends(get_db)):
    """Dispatch an alert to a field unit or nodal desk."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    alert.status = "DISPATCHED"
    alert.is_new = 0

    dept = payload.department if (payload and payload.department) else "Field QRT Intercept Desk"
    note = payload.note if payload else None
    t = (payload.timestamp if payload and payload.timestamp else None) or datetime.utcnow().strftime("%H:%M:%S")

    # Also log to associated complaint if found
    comp = db.query(Complaint).filter(Complaint.complaint_id == alert.complaint_id).first()
    if comp:
        comp.status = "ACTIVE"
        import json
        notes = json.loads(comp.notes_json) if comp.notes_json else []
        notes.append(f"[{t}] Dispatched to {dept}. {note or ''}")
        comp.notes_json = json.dumps(notes)

    db.commit()
    return {"status": "ok", "alert_id": alert_id, "alert_status": "DISPATCHED"}


@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, payload: Optional[AcknowledgePayload] = None, db: Session = Depends(get_db)):
    """Acknowledge an alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    alert.status = "ACKNOWLEDGED"
    alert.is_new = 0
    db.commit()
    return {"status": "ok", "alert_id": alert_id, "alert_status": "ACKNOWLEDGED"}