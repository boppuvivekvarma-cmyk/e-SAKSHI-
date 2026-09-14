"""
Audit Docket Router — paginated, filterable full audit results.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from ..database import get_db
from ..models import AuditRecord, Work
from ..schemas import AuditRecordOut

router = APIRouter(prefix="/api/v1/audit", tags=["audit"])


@router.get("/docket", response_model=List[AuditRecordOut])
def get_audit_docket(
    mp_id: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    constituency: Optional[str] = Query(None),
    verdict: Optional[str] = Query(None),
    min_risk_score: Optional[float] = None,
    outliers_only: Optional[bool] = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Returns paginated audit records, joinable to work details.
    Filterable by mp_id, state, district, constituency, verdict, min_risk_score, outliers_only.
    """
    query = (
        db.query(AuditRecord)
        .join(Work, AuditRecord.work_id == Work.work_id)
        .options(joinedload(AuditRecord.work))
    )

    if mp_id:
        query = query.filter(Work.mp_id == mp_id)
    if state and state.lower() != "all" and state.lower() != "all india":
        query = query.filter(Work.state == state)
    if district and district.lower() != "all":
        query = query.filter(Work.district == district)
    if constituency:
        query = query.filter(Work.constituency == constituency)
    if verdict:
        query = query.filter(AuditRecord.verdict == verdict)
    if min_risk_score is not None:
        query = query.filter(AuditRecord.risk_score >= min_risk_score)
    if outliers_only:
        query = query.filter(
            (AuditRecord.is_statistical_outlier == True) | (AuditRecord.is_extreme_outlier == True)
        )

    query = query.order_by(AuditRecord.risk_score.desc())
    records = query.offset(skip).limit(limit).all()

    return [_enrich(r) for r in records]


@router.get("/{work_id}", response_model=AuditRecordOut)
@router.get("/docket/{work_id}", response_model=AuditRecordOut)
def get_single_audit(work_id: str, db: Session = Depends(get_db)):
    import urllib.parse
    from sqlalchemy import func
    from fastapi import HTTPException

    clean_id = urllib.parse.unquote(work_id).strip()
    record = (
        db.query(AuditRecord)
        .filter(AuditRecord.work_id == clean_id)
        .options(joinedload(AuditRecord.work))
        .first()
    )
    if not record:
        record = (
            db.query(AuditRecord)
            .filter(func.lower(AuditRecord.work_id) == clean_id.lower())
            .options(joinedload(AuditRecord.work))
            .first()
        )
    if not record:
        raise HTTPException(404, f"Audit record not found for work ID: {clean_id}")
    return _enrich(record)


def _enrich(r: AuditRecord) -> dict:
    d = {c.name: getattr(r, c.name) for c in r.__table__.columns}
    if r.work:
        w = r.work
        d.update({
            "state": w.state, "district": w.district, "constituency": w.constituency,
            "mp_id": w.mp_id, "mp_name": w.mp_name, "work_title": w.work_title,
            "category": w.category, "vendor_id": w.vendor_id, "vendor_name": w.vendor_name,
            "estimated_cost_inr": w.estimated_cost_inr,
            "expenditure_incurred_inr": w.expenditure_incurred_inr,
            "completion_pct": w.completion_pct, "work_status": w.work_status,
            "sanction_date": w.sanction_date, "anomaly_label": w.anomaly_label,
        })
    return d
