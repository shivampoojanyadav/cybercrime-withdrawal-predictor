import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean
)
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "cybercrime.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Complaint(Base):
    __tablename__ = "complaints"

    id               = Column(Integer, primary_key=True, index=True)
    complaint_id     = Column(String, unique=True, index=True, nullable=False)
    victim_name      = Column(String, nullable=False)
    victim_city      = Column(String, nullable=False)
    victim_state     = Column(String, nullable=True)
    amount           = Column(Float, nullable=False)
    bank             = Column(String, nullable=False)
    mule_bank        = Column(String, nullable=True)
    fraud_type       = Column(String, nullable=False)
    scam_type        = Column(String, nullable=True)
    transaction_count = Column(Integer, default=1)
    payment_mode     = Column(String, nullable=True)
    utr_ref          = Column(String, nullable=True)
    mule_account     = Column(String, nullable=True)
    mule_holder_name = Column(String, nullable=True)
    status           = Column(String, nullable=True)
    priority         = Column(String, nullable=True)
    complaint_time   = Column(DateTime, default=datetime.utcnow)
    actual_atm_lat   = Column(Float, nullable=True)
    actual_atm_lon   = Column(Float, nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    __tablename__ = "predictions"

    id                   = Column(Integer, primary_key=True, index=True)
    complaint_id         = Column(String, ForeignKey("complaints.complaint_id"), index=True)
    cluster_id           = Column(Integer, nullable=False)
    lat                  = Column(Float, nullable=False)
    lng                  = Column(Float, nullable=False)
    risk_score           = Column(Float, nullable=False)
    city                 = Column(String, nullable=False)
    atm_count            = Column(Integer, default=0)
    predicted_window     = Column(String, nullable=False)
    confidence           = Column(Float, nullable=False)
    predicted_delay_mins = Column(Integer, nullable=True)
    top_hotspots_json    = Column(String, nullable=True)
    features_json        = Column(String, nullable=True)
    created_at           = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    _pk                  = Column(Integer, primary_key=True, index=True)
    id                   = Column(String, index=True, nullable=False)
    complaint_id         = Column(String, ForeignKey("complaints.complaint_id"), index=True)
    priority             = Column(String, nullable=True)
    scam_type            = Column(String, nullable=True)
    fraud_amount         = Column(Float, nullable=True)
    predicted_atm_name   = Column(String, nullable=True)
    seconds_remaining    = Column(Integer, nullable=True)
    assigned_officer     = Column(String, nullable=True)
    status               = Column(String, nullable=True)
    is_new               = Column(Integer, default=1)
    created_at           = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
