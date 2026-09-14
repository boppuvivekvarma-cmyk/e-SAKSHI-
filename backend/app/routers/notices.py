"""
Notices Router — generates printable notice data for flagged works.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import Work, AuditRecord
from ..schemas import NoticeData
from ..detection.risk_scorer import get_recommended_action

router = APIRouter(prefix="/api/v1/notices", tags=["notices"])

FLAG_LABELS = {
    "flag_duplicate_work":       "Spatial-Semantic Duplicate Work",
    "flag_sor_inflated":         "Cost Above Schedule of Rates (Forensic Rate)",
    "flag_tender_splitting":     "Procurement Irregularity — Tender Splitting",
    "flag_geo_tampering":        "Geofence Verification Failure",
    "flag_parked_funds":         "Capital Dormancy — Parked Funds",
    "flag_expenditure_mismatch": "Expenditure-Progress Mismatch",
    "flag_no_physical_evidence": "No Physical Evidence of Asset Creation",
    "flag_category_deviation":   "Category Consistency Violation",
    "flag_recycled_photo":       "Before/After Photo Progression Failure",
}


@router.get("/{work_id}", response_model=NoticeData)
def get_notice_data(work_id: str, db: Session = Depends(get_db)):
    """
    Returns structured data needed to render the printable statutory notice.
    Frontend renders this into a letterhead-correct A4 PDF/print layout.
    """
    import urllib.parse
    from sqlalchemy import func
    clean_id = urllib.parse.unquote(work_id).strip()

    work = db.query(Work).filter(Work.work_id == clean_id).first()
    if not work:
        work = db.query(Work).filter(func.lower(Work.work_id) == clean_id.lower()).first()
    if not work:
        raise HTTPException(404, f"Work {clean_id} not found")

    audit = db.query(AuditRecord).filter(AuditRecord.work_id == work.work_id).first()
    if not audit:
        audit = db.query(AuditRecord).filter(func.lower(AuditRecord.work_id) == clean_id.lower()).first()
    if not audit:
        raise HTTPException(404, f"Audit record not found for work: {clean_id}")

    active_flags = [
        label for col, label in FLAG_LABELS.items()
        if getattr(audit, col, False)
    ]

    action = get_recommended_action(audit.verdict, {
        col: getattr(audit, col, False) for col in FLAG_LABELS
    })

    return NoticeData(
        work_id=work.work_id,
        mp_name=work.mp_name,
        mp_id=work.mp_id,
        constituency=work.constituency,
        state=work.state,
        district=work.district,
        work_title=work.work_title,
        category=work.category,
        sanction_date=work.sanction_date,
        estimated_cost_inr=work.estimated_cost_inr,
        expenditure_incurred_inr=work.expenditure_incurred_inr,
        completion_pct=work.completion_pct,
        work_status=work.work_status,
        vendor_name=work.vendor_name,
        verdict=audit.verdict,
        risk_score=audit.risk_score,
        statutory_dossier=audit.statutory_dossier,
        flags=active_flags,
        recommended_action=action,
        notice_date=datetime.today().strftime("%d %B %Y"),
    )
