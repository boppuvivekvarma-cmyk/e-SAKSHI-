"""
FastAPI Application Entry Point — e-SAKSHI 2.0 Sentinel Backend
"""
import os
import csv
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, SessionLocal, Base
from .models import Work, MilestonePhoto, AuditRecord, Alert
from .routers import ingest, audit, alerts, dashboard, notices

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
WORKS_CSV = os.path.join(DATA_DIR, "mplads_seed.csv")
MILESTONES_CSV = os.path.join(DATA_DIR, "milestones_seed.csv")


def seed_database(db):
    """Load seed CSVs into the database if tables are empty."""
    if db.query(Work).count() > 0:
        print("[Seed] Database already populated, skipping seed.")
        return

    # Load works
    if os.path.exists(WORKS_CSV):
        with open(WORKS_CSV, encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                try:
                    w = Work(
                        work_id=row["work_id"],
                        state=row.get("state", ""),
                        district=row.get("district", ""),
                        constituency=row.get("constituency", ""),
                        house=row.get("house", "LS"),
                        mp_id=row.get("mp_id", ""),
                        mp_name=row.get("mp_name", ""),
                        work_title=row.get("work_title", ""),
                        category=row.get("category", ""),
                        implementing_agency=row.get("implementing_agency", ""),
                        vendor_id=row.get("vendor_id", ""),
                        vendor_name=row.get("vendor_name", ""),
                        recommendation_date=row.get("recommendation_date", ""),
                        sanction_date=row.get("sanction_date", ""),
                        estimated_cost_inr=float(row.get("estimated_cost_inr", 0) or 0),
                        sor_benchmark_cost_inr=float(row.get("sor_benchmark_cost_inr", 0) or 0),
                        expenditure_incurred_inr=float(row.get("expenditure_incurred_inr", 0) or 0),
                        completion_pct=float(row.get("completion_pct", 0) or 0),
                        days_stalled=int(float(row.get("days_stalled", 0) or 0)),
                        work_status=row.get("work_status", ""),
                        latitude=float(row.get("latitude", 0) or 0),
                        longitude=float(row.get("longitude", 0) or 0),
                        photo_phash=row.get("photo_phash", ""),
                        photo_exif_lat=float(row.get("photo_exif_lat", 0) or 0),
                        photo_exif_lon=float(row.get("photo_exif_lon", 0) or 0),
                        anomaly_label=row.get("anomaly_label", "NORMAL"),
                    )
                    db.add(w)
                except Exception as e:
                    continue
        db.commit()
        print(f"[Seed] Works loaded from {WORKS_CSV}")
    else:
        print(f"[Seed] WARNING: {WORKS_CSV} not found. Run: python backend/data/seed_dataset.py")

    # Load milestones
    if os.path.exists(MILESTONES_CSV):
        with open(MILESTONES_CSV, encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                try:
                    m = MilestonePhoto(
                        milestone_id=row["milestone_id"],
                        work_id=row["work_id"],
                        stage=row.get("stage", ""),
                        captured_at=row.get("captured_at", ""),
                        photo_phash=row.get("photo_phash", ""),
                        photo_exif_lat=float(row.get("photo_exif_lat", 0) or 0),
                        photo_exif_lon=float(row.get("photo_exif_lon", 0) or 0),
                        declared_category=row.get("declared_category", ""),
                    )
                    db.add(m)
                except Exception:
                    continue
        db.commit()
        print(f"[Seed] Milestones loaded from {MILESTONES_CSV}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """On startup: create tables, seed data, run initial pipeline."""
    print("[Startup] Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_database(db)
        # Run pipeline if no audit records exist yet
        from .models import AuditRecord as AR
        if db.query(AR).count() == 0 and db.query(Work).count() > 0:
            print("[Startup] Running initial audit pipeline...")
            from .pipeline import run_full_pipeline
            run_full_pipeline(db)
    finally:
        db.close()

    print("[Startup] e-SAKSHI 2.0 Sentinel backend ready.")
    yield
    print("[Shutdown] Goodbye.")


app = FastAPI(
    title="e-SAKSHI 2.0 Sentinel",
    description="AI-Powered MPLADS Anomaly, Fraud & Inefficiency Detection System — SIH 2026 PS 26102",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend (local + Vercel deployment)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
cors_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "https://frontend-chi-two-40.vercel.app",
]
if FRONTEND_URL:
    cors_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.railway\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ingest.router)
app.include_router(audit.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)
app.include_router(notices.router)


@app.get("/")
def root():
    return {
        "system": "e-SAKSHI 2.0 Sentinel",
        "version": "2.0.0",
        "description": "SIH 2026 PS 26102 — AI-Powered MPLADS Fraud Detection",
        "docs": "/docs",
        "status": "operational",
    }


@app.get("/health")
@app.get("/api/v1/health")
def health():
    return {"status": "healthy"}
