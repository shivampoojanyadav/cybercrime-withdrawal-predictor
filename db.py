"""
db.py — SQLAlchemy + SQLite database setup for SIH26184
"""
import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, DateTime, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker

# ── Path setup ──────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "cybercrime.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# ── Engine & session ─────────────────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Models ───────────────────────────────────────────────────────────────────
class Complaint(Base):
    __tablename__ = "complaints"

    id               = Column(Integer, primary_key=True, index=True)
    complaint_id     = Column(String, unique=True, index=True, nullable=False)
    victim_name      = Column(String, nullable=False)
    victim_city      = Column(String, nullable=False)
    amount           = Column(Float, nullable=False)
    bank             = Column(String, nullable=False)
    fraud_type       = Column(String, nullable=False)
    transaction_count = Column(Integer, default=1)
    complaint_time   = Column(DateTime, nullable=False)
    created_at       = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    __tablename__ = "predictions"

    id               = Column(Integer, primary_key=True, index=True)
    complaint_id     = Column(String, ForeignKey("complaints.complaint_id"), index=True)
    cluster_id       = Column(Integer, nullable=False)
    lat              = Column(Float, nullable=False)
    lng              = Column(Float, nullable=False)
    risk_score       = Column(Float, nullable=False)
    city             = Column(String, nullable=False)
    atm_count        = Column(Integer, default=0)
    predicted_window = Column(String, nullable=False)
    confidence       = Column(Float, nullable=False)
    created_at       = Column(DateTime, default=datetime.utcnow)


# ── DB creation on import ────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)


# ── Dependency ───────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
