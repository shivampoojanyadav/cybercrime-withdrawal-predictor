"""
main.py — FastAPI application entry point
SIH26184 — Cybercrime Cash Withdrawal Predictor
Ministry of Home Affairs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import Base, engine
from routes import complaint, hotspots, atms, complaints_route

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Cybercrime Cash Withdrawal Predictor",
    description=(
        "SIH26184 — Ministry of Home Affairs\n\n"
        "A law enforcement platform that predicts where/when stolen money will be "
        "withdrawn, giving police actionable geospatial intelligence before it happens."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (allow frontend on any port during development) ──────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB init ───────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(complaint.router,         prefix="/api", tags=["Complaints"])
app.include_router(hotspots.router,          prefix="/api", tags=["Hotspots"])
app.include_router(atms.router,              prefix="/api", tags=["ATMs"])
app.include_router(complaints_route.router,  prefix="/api", tags=["History"])


# ── Health / Root ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Cybercrime Cash Withdrawal Predictor",
        "sih_ps": "SIH26184",
        "org": "Ministry of Home Affairs",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "POST /api/complaint":   "Submit complaint → get hotspot predictions",
            "GET  /api/hotspots":    "Active ATM hotspot zones",
            "GET  /api/atms":        "ATM locations for map rendering",
            "GET  /api/complaints":  "Complaint history",
        },
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
