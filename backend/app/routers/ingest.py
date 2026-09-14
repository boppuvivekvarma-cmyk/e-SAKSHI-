"""
Ingest Router — CSV upload for works and milestones,
triggers full audit pipeline after loading.
"""
import csv
import io
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Work, MilestonePhoto
from ..schemas import IngestResponse
from ..pipeline import run_full_pipeline

router = APIRouter(prefix="/api/v1/ingest", tags=["ingest"])

REQUIRED_WORK_FIELDS = {
    "work_id", "state", "district", "constituency", "mp_name",
    "work_title", "category", "vendor_id", "vendor_name",
    "sanction_date", "estimated_cost_inr", "sor_benchmark_cost_inr",
    "expenditure_incurred_inr", "completion_pct", "days_stalled",
    "work_status", "latitude", "longitude",
}


def _validate_india_bbox(lat: float, lon: float) -> bool:
    return 6.5 <= lat <= 37.5 and 68.0 <= lon <= 98.0


def _parse_works_csv(content: str) -> list:
    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)
    if not rows:
        raise HTTPException(400, "Empty CSV file.")
    missing = REQUIRED_WORK_FIELDS - set(rows[0].keys())
    if missing:
        raise HTTPException(400, f"Missing required columns: {missing}")
    return rows


def _parse_milestones_csv(content: str) -> list:
    reader = csv.DictReader(io.StringIO(content))
    return list(reader)


@router.post("/works", response_model=IngestResponse)
async def ingest_works(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a works CSV (e-SAKSHI register format).
    Validates schema, loads to DB, triggers pipeline.
    """
    content = (await file.read()).decode("utf-8-sig")
    rows = _parse_works_csv(content)

    loaded = 0
    skipped = 0
    milestones_created = 0
    for row in rows:
        try:
            lat = float(row.get("latitude", 0) or 0)
            lon = float(row.get("longitude", 0) or 0)
            if lat and lon and not _validate_india_bbox(lat, lon):
                skipped += 1
                continue

            mp_name = row.get("mp_name", "").strip()
            mp_id = row.get("mp_id", "").strip()
            if not mp_id and mp_name:
                clean_name = "".join(c for c in mp_name.upper() if c.isalnum())[:8]
                mp_id = f"MP-{clean_name}"
            elif not mp_id:
                mp_id = "MP-CENTRAL"

            decl_cat = row.get("declared_category_at_completion", "").strip()
            milestone_cnt = int(float(row.get("milestone_count", 0) or 0))

            work = Work(
                work_id=row["work_id"].strip(),
                state=row.get("state", "").strip(),
                district=row.get("district", "").strip(),
                constituency=row.get("constituency", "").strip(),
                house=row.get("house", "LS").strip(),
                mp_id=mp_id,
                mp_name=mp_name,
                work_title=row.get("work_title", "").strip(),
                category=row.get("category", "").strip(),
                implementing_agency=row.get("implementing_agency", "").strip(),
                vendor_id=row.get("vendor_id", "").strip(),
                vendor_name=row.get("vendor_name", "").strip(),
                recommendation_date=row.get("recommendation_date", "").strip(),
                sanction_date=row.get("sanction_date", "").strip(),
                estimated_cost_inr=float(row.get("estimated_cost_inr", 0) or 0),
                sor_benchmark_cost_inr=float(row.get("sor_benchmark_cost_inr", 0) or 0),
                expenditure_incurred_inr=float(row.get("expenditure_incurred_inr", 0) or 0),
                completion_pct=float(row.get("completion_pct", 0) or 0),
                days_stalled=int(float(row.get("days_stalled", 0) or 0)),
                work_status=row.get("work_status", "").strip(),
                latitude=lat,
                longitude=lon,
                photo_phash=row.get("photo_phash", "").strip(),
                photo_exif_lat=float(row.get("photo_exif_lat", 0) or 0),
                photo_exif_lon=float(row.get("photo_exif_lon", 0) or 0),
                declared_category_at_completion=decl_cat if decl_cat else None,
                milestone_count=milestone_cnt,
                anomaly_label=row.get("anomaly_label", "NORMAL").strip(),
            )
            db.merge(work)
            loaded += 1

            phash = row.get("photo_phash", "").strip()
            if phash:
                m_after = MilestonePhoto(
                    milestone_id=f"{work.work_id}-M2",
                    work_id=work.work_id,
                    stage="after",
                    captured_at=row.get("sanction_date", ""),
                    photo_phash=phash,
                    photo_exif_lat=float(row.get("photo_exif_lat", 0) or 0),
                    photo_exif_lon=float(row.get("photo_exif_lon", 0) or 0),
                    declared_category=decl_cat if decl_cat else row.get("category", ""),
                )
                db.merge(m_after)
                milestones_created += 1

                if row.get("anomaly_label") == "RECYCLED_PROGRESSION_PHOTO":
                    m_before = MilestonePhoto(
                        milestone_id=f"{work.work_id}-M1",
                        work_id=work.work_id,
                        stage="before",
                        captured_at=row.get("sanction_date", ""),
                        photo_phash=phash,
                        photo_exif_lat=float(row.get("photo_exif_lat", 0) or 0),
                        photo_exif_lon=float(row.get("photo_exif_lon", 0) or 0),
                        declared_category=row.get("category", ""),
                    )
                    db.merge(m_before)
                    milestones_created += 1
        except Exception:
            skipped += 1
            continue

    db.commit()

    # Run pipeline in background
    background_tasks.add_task(run_full_pipeline, db)

    return IngestResponse(
        message=f"Ingested {loaded} works and {milestones_created} milestones ({skipped} skipped). Pipeline queued.",
        works_ingested=loaded,
        milestones_ingested=milestones_created,
        pipeline_run=True,
    )


@router.post("/milestones", response_model=IngestResponse)
async def ingest_milestones(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload milestones CSV."""
    content = (await file.read()).decode("utf-8-sig")
    rows = _parse_milestones_csv(content)

    loaded = 0
    for row in rows:
        try:
            m = MilestonePhoto(
                milestone_id=row.get("milestone_id", "").strip(),
                work_id=row.get("work_id", "").strip(),
                stage=row.get("stage", "").strip(),
                captured_at=row.get("captured_at", "").strip(),
                photo_phash=row.get("photo_phash", "").strip(),
                photo_exif_lat=float(row.get("photo_exif_lat", 0) or 0),
                photo_exif_lon=float(row.get("photo_exif_lon", 0) or 0),
                declared_category=row.get("declared_category", "").strip(),
            )
            db.merge(m)
            loaded += 1
        except Exception:
            continue
    db.commit()

    return IngestResponse(
        message=f"Ingested {loaded} milestones.",
        works_ingested=0,
        milestones_ingested=loaded,
        pipeline_run=False,
    )


@router.post("/run-pipeline")
async def trigger_pipeline(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Manually trigger the full audit pipeline."""
    background_tasks.add_task(run_full_pipeline, db)
    return {"message": "Pipeline triggered."}
