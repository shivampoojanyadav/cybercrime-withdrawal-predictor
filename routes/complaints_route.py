"""
complaints_route.py — Complaint dossier history and status updates
"""
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import get_db, Complaint, Prediction

router = APIRouter()


class StatusUpdatePayload(BaseModel):
    status: str
    note: Optional[str] = None
    timestamp: Optional[str] = None


def _format_complaint(c: Complaint) -> dict:
    notes = json.loads(c.notes_json) if c.notes_json else []
    evidence = json.loads(c.evidence_json) if c.evidence_json else []
    return {
        "complaint_id":        c.complaint_id,
        "scam_type":           c.fraud_type,
        "fraud_amount":        c.amount,
        "source_bank":         c.bank,
        "mule_bank":           c.mule_bank or "SBI",
        "complaint_timestamp": c.complaint_time.strftime("%Y-%m-%d %H:%M:%S") if c.complaint_time else datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "hour_of_day":         c.complaint_time.hour if c.complaint_time else 18,
        "actual_atm_lat":      c.actual_atm_lat or 28.6155,
        "actual_atm_lon":      c.actual_atm_lon or 77.2113,
        "target_delay_mins":   c.target_delay_mins or 60,
        "status":              c.status or "ACTIVE",
        "priority":            c.priority or "P1",
        "assigned_officer":    c.assigned_officer or "INSP-VIKRAM-712",
        "victim_city":         c.victim_city,
        "victim_state":        c.victim_state or "NCR",
        "payment_mode":        c.payment_mode or "UPI - Instant Transfer",
        "utr_ref":             c.utr_ref or f"UPI/{c.complaint_id}",
        "mule_account":        c.mule_account or "908129381029",
        "mule_holder_name":    c.mule_holder_name or "TARGET MULE BENEFICIARY",
        "evidence_files":      evidence,
        "notes":               notes,
    }


@router.get("/complaints")
def get_complaints(
    scam_type: Optional[str] = None,
    bank: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Return complaints formatted for the frontend dossier list."""
    query = db.query(Complaint).order_by(Complaint.created_at.desc())

    if scam_type:
        query = query.filter(Complaint.fraud_type == scam_type)
    if bank:
        query = query.filter((Complaint.bank == bank) | (Complaint.mule_bank == bank))

    complaints = query.offset(skip).limit(limit).all()

    results = []
    for c in complaints:
        item = _format_complaint(c)
        if search:
            q = search.lower()
            matches = (
                q in item["complaint_id"].lower()
                or q in item["victim_city"].lower()
                or q in item["mule_holder_name"].lower()
                or q in item["utr_ref"].lower()
                or q in item["mule_bank"].lower()
            )
            if not matches:
                continue
        results.append(item)

    return results


@router.get("/complaints/{complaint_id}")
@router.get("/complaint/{complaint_id}")
def get_complaint_by_id(complaint_id: str, db: Session = Depends(get_db)):
    """Return a single complaint dossier by ID."""
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint {complaint_id} not found")
    return _format_complaint(complaint)


@router.post("/complaint/{complaint_id}/status")
@router.post("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    payload: StatusUpdatePayload,
    db: Session = Depends(get_db),
):
    """Update case status and log notes."""
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint {complaint_id} not found")

    complaint.status = payload.status
    notes = json.loads(complaint.notes_json) if complaint.notes_json else []
    t = payload.timestamp or datetime.utcnow().strftime("%H:%M:%S")
    if payload.note:
        notes.insert(0, f"[{t}] {payload.note}")
    complaint.notes_json = json.dumps(notes)

    db.commit()
    return {"status": "ok", "complaint_id": complaint_id, "case_status": payload.status}