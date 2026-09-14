"""
Alerts Router — role-scoped alert feed.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import Alert
from ..schemas import AlertOut

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.get("/", response_model=List[AlertOut])
def get_alerts(
    db: Session = Depends(get_db),
    role: Optional[str] = Query(None),           # mp | district | state | ministry
    target_id: Optional[str] = Query(None),       # mp_id, district name, state name, NATIONAL
    severity: Optional[str] = Query(None),        # HIGH | MEDIUM | LOW
    acknowledged: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
):
    query = db.query(Alert)
    if isinstance(role, str) and role:
        query = query.filter(Alert.target_role == role)
    if isinstance(target_id, str) and target_id:
        query = query.filter(Alert.target_id == target_id)
    if isinstance(severity, str) and severity:
        query = query.filter(Alert.severity == severity)
    if isinstance(acknowledged, bool):
        query = query.filter(Alert.acknowledged == acknowledged)

    query = query.order_by(Alert.created_at.desc())
    return query.offset(skip).limit(limit).all()


@router.patch("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        from fastapi import HTTPException
        raise HTTPException(404, "Alert not found")
    alert.acknowledged = True
    db.commit()
    return {"message": "Alert acknowledged"}


@router.get("/count")
def get_alert_counts(
    db: Session = Depends(get_db),
    role: Optional[str] = Query(None),
    target_id: Optional[str] = Query(None),
):
    query = db.query(Alert)
    if isinstance(role, str) and role:
        query = query.filter(Alert.target_role == role)
    if isinstance(target_id, str) and target_id:
        query = query.filter(Alert.target_id == target_id)

    total = query.count()
    high = query.filter(Alert.severity == "HIGH").count()
    medium = query.filter(Alert.severity == "MEDIUM").count()
    unacknowledged = query.filter(Alert.acknowledged == False).count()
    return {"total": total, "high": high, "medium": medium, "unacknowledged": unacknowledged}
