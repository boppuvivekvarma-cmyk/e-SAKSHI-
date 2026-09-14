"""
Dashboard Router — role-specific KPI summaries and data aggregations.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import Work, AuditRecord, Alert
from ..detection.vendor_clustering import get_vendor_features_report
from ..detection.forecasting import forecast_utilisation_trend, get_dormancy_pipeline

from ..master_pan_india import PAN_INDIA_STATES, get_state_info, get_all_states, get_districts_for_state, get_terrain_multiplier

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/states")
def list_states(db: Session = Depends(get_db)):
    """
    Returns dynamically discovered states from DB merged with Pan-India Master Directory.
    Includes state code, Devanagari Hindi title, planning zone, and active audited work count.
    """
    db_states = db.query(Work.state, func.count(Work.work_id)).group_by(Work.state).all()
    db_state_map = {s: cnt for s, cnt in db_states if s}

    master_states = get_all_states()
    results = []

    # First add all master states
    for s in master_states:
        info = get_state_info(s) or {}
        cnt = db_state_map.get(s, 0)
        results.append({
            "state": s,
            "code": info.get("code", "IN"),
            "hindi": info.get("hindi", s),
            "zone": info.get("zone", "Central"),
            "terrain_multiplier": info.get("terrain_multiplier", 1.0),
            "works_count": cnt,
            "has_data": cnt > 0,
        })

    # Also include any custom state in DB not in master
    for s, cnt in db_state_map.items():
        if s not in PAN_INDIA_STATES:
            results.append({
                "state": s,
                "code": "IN",
                "hindi": s,
                "zone": "Other",
                "terrain_multiplier": 1.0,
                "works_count": cnt,
                "has_data": True,
            })

    results.sort(key=lambda x: (not x["has_data"], x["state"]))
    return results


@router.get("/districts")
def list_districts(state: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns dynamically discovered districts for a given state from DB
    merged with official master district directory.
    """
    if not state or state.lower() in ("all", "all india"):
        db_dists = db.query(Work.district).distinct().all()
        return sorted([d[0] for d in db_dists if d[0]])

    db_dists = db.query(Work.district).filter(Work.state == state).distinct().all()
    found = {d[0] for d in db_dists if d[0]}

    master_dists = get_districts_for_state(state)
    all_dists = sorted(list(found.union(set(master_dists))))
    return all_dists


def _works_query(db, mp_id=None, state=None, district=None, constituency=None):
    q = db.query(Work)
    if isinstance(mp_id, str) and mp_id:
        q = q.filter(func.lower(Work.mp_id) == mp_id.strip().lower())
    if isinstance(state, str) and state and state.lower() not in ("all", "all india", "national"):
        q = q.filter(func.lower(Work.state) == state.strip().lower())
    if isinstance(district, str) and district and district.lower() not in ("all",):
        q = q.filter(func.lower(Work.district) == district.strip().lower())
    if isinstance(constituency, str) and constituency:
        q = q.filter(func.lower(Work.constituency) == constituency.strip().lower())
    return q


def _compute_summary(db: Session, mp_id: Optional[str] = None, state: Optional[str] = None, district: Optional[str] = None, constituency: Optional[str] = None):
    s_mp = mp_id.strip() if isinstance(mp_id, str) and mp_id.strip() else None
    s_state = state.strip() if isinstance(state, str) and state.strip() and state.strip().lower() not in ("all", "all india", "national") else None
    s_dist = district.strip() if isinstance(district, str) and district.strip() and district.strip().lower() not in ("all",) else None
    s_const = constituency.strip() if isinstance(constituency, str) and constituency.strip() else None

    works = _works_query(db, s_mp, s_state, s_dist, s_const).all()
    work_ids = [w.work_id for w in works]

    audits = db.query(AuditRecord).filter(AuditRecord.work_id.in_(work_ids)).all() if work_ids else []
    verdict_counts = {}
    for a in audits:
        verdict_counts[a.verdict] = verdict_counts.get(a.verdict, 0) + 1

    total_sanctioned  = sum(w.estimated_cost_inr or 0 for w in works)
    total_disbursed   = sum(w.expenditure_incurred_inr or 0 for w in works)
    total_flagged     = sum(1 for a in audits if a.verdict != "VERIFIED COMPLIANT")

    alerts_q = db.query(Alert)
    if s_mp:        alerts_q = alerts_q.filter(Alert.target_role == "mp", func.lower(Alert.target_id) == s_mp.lower())
    elif s_dist:    alerts_q = alerts_q.filter(Alert.target_role == "district", func.lower(Alert.target_id) == s_dist.lower())
    elif s_state:   alerts_q = alerts_q.filter(Alert.target_role == "state", func.lower(Alert.target_id) == s_state.lower())
    high_alerts = alerts_q.filter(Alert.severity == "HIGH").count()

    return {
        "total_works":        len(works),
        "total_sanctioned_inr": total_sanctioned,
        "total_disbursed_inr":  total_disbursed,
        "total_flagged":       total_flagged,
        "statutory_holds":     verdict_counts.get("STATUTORY HOLD", 0),
        "compliance_inquiry":  verdict_counts.get("COMPLIANCE INQUIRY", 0),
        "capital_dormant":     verdict_counts.get("CAPITAL DORMANT", 0),
        "verified_compliant":  verdict_counts.get("VERIFIED COMPLIANT", 0),
        "high_risk_alerts":    high_alerts,
        "utilisation_pct":     round((total_disbursed / total_sanctioned * 100) if total_sanctioned > 0 else 0, 1),
    }


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    mp_id: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    constituency: Optional[str] = Query(None),
):
    """Generic KPI ribbon — scope determined by query params."""
    return _compute_summary(db, mp_id, state, district, constituency)


@router.get("/mp/{mp_id}")
def get_mp_dashboard(mp_id: str, db: Session = Depends(get_db)):
    """MP-scoped dashboard data."""
    summary = _compute_summary(db=db, mp_id=mp_id)
    works = db.query(Work).filter(Work.mp_id == mp_id).all()
    work_ids = [w.work_id for w in works]
    audits = db.query(AuditRecord).filter(AuditRecord.work_id.in_(work_ids)).all() if work_ids else []

    # Category breakdown
    cat_breakdown = {}
    for w in works:
        cat_breakdown.setdefault(w.category, {"count": 0, "sanctioned": 0, "disbursed": 0})
        cat_breakdown[w.category]["count"] += 1
        cat_breakdown[w.category]["sanctioned"] += w.estimated_cost_inr or 0
        cat_breakdown[w.category]["disbursed"] += w.expenditure_incurred_inr or 0

    # Status breakdown
    status_breakdown = {}
    for w in works:
        status_breakdown[w.work_status] = status_breakdown.get(w.work_status, 0) + 1

    # Top flagged works
    audit_map = {a.work_id: a for a in audits}
    flagged_works = []
    for w in works:
        a = audit_map.get(w.work_id)
        if a and a.verdict != "VERIFIED COMPLIANT":
            flagged_works.append({
                "work_id": w.work_id, "work_title": w.work_title,
                "category": w.category, "estimated_cost_inr": w.estimated_cost_inr,
                "expenditure_incurred_inr": w.expenditure_incurred_inr,
                "completion_pct": w.completion_pct, "work_status": w.work_status,
                "verdict": a.verdict, "risk_score": a.risk_score,
            })
    flagged_works.sort(key=lambda x: x["risk_score"], reverse=True)

    return {
        "summary": summary,
        "category_breakdown": [{"category": k, **v} for k, v in cat_breakdown.items()],
        "status_breakdown": [{"status": k, "count": v} for k, v in status_breakdown.items()],
        "flagged_works": flagged_works[:20],
    }


@router.get("/district/{district}")
def get_district_dashboard(district: str, db: Session = Depends(get_db)):
    """District Authority dashboard."""
    import urllib.parse
    d_clean = urllib.parse.unquote(district).strip().replace("+", " ")
    summary = _compute_summary(db=db, district=d_clean)
    works = db.query(Work).filter(func.lower(Work.district) == d_clean.lower()).all()
    works_list = [_work_dict(w) for w in works]

    # Dormancy watchlist
    dormancy_pipeline = get_dormancy_pipeline(works_list, horizon_days=90)

    # Physical verification queue (flagged works needing inspection)
    work_ids = [w.work_id for w in works]
    audits = db.query(AuditRecord).filter(
        AuditRecord.work_id.in_(work_ids),
        AuditRecord.verdict != "VERIFIED COMPLIANT"
    ).order_by(AuditRecord.risk_score.desc()).limit(30).all()
    audit_map = {a.work_id: a for a in audits}
    work_map  = {w.work_id: w for w in works}
    verification_queue = []
    for a in audits:
        w = work_map.get(a.work_id)
        if w:
            verification_queue.append({
                "work_id": w.work_id, "work_title": w.work_title,
                "constituency": w.constituency, "mp_name": w.mp_name,
                "verdict": a.verdict, "risk_score": a.risk_score,
                "flags": _active_flags(a),
            })

    return {
        "summary": summary,
        "dormancy_watchlist": dormancy_pipeline,
        "verification_queue": verification_queue,
    }


@router.get("/state/{state}")
def get_state_dashboard(state: str, db: Session = Depends(get_db)):
    """State Nodal Authority dashboard (supports individual state or 'All India')."""
    import urllib.parse
    s_clean = urllib.parse.unquote(state).strip().replace("+", " ")
    is_national = s_clean.lower() in ("all", "all india", "allindia", "national")
    summary = _compute_summary(db=db) if is_national else _compute_summary(db=db, state=s_clean)

    if is_national:
        works = db.query(Work).all()
    else:
        works = db.query(Work).filter(func.lower(Work.state) == s_clean.lower()).all()

    works_list = [_work_dict(w) for w in works]

    # Vendor leaderboard
    vendor_report = get_vendor_features_report(works_list)

    # District / State compliance comparison
    district_compliance = {}
    for w in works:
        key = w.state if is_national else w.district
        district_compliance.setdefault(key, {"total": 0, "flagged": 0})
        district_compliance[key]["total"] += 1

    work_ids = [w.work_id for w in works]
    flagged_audits = db.query(AuditRecord).filter(
        AuditRecord.work_id.in_(work_ids),
        AuditRecord.verdict != "VERIFIED COMPLIANT"
    ).all() if work_ids else []
    flagged_ids = {a.work_id: a.verdict for a in flagged_audits}

    for w in works:
        if w.work_id in flagged_ids:
            key = w.state if is_national else w.district
            district_compliance[key]["flagged"] += 1

    dc_list = []
    for loc, vals in district_compliance.items():
        compliance_rate = round((1 - vals["flagged"] / max(vals["total"], 1)) * 100, 1)
        dc_list.append({"district": loc, **vals, "compliance_rate": compliance_rate})
    dc_list.sort(key=lambda x: x["compliance_rate"])

    # Category deviation summary
    cat_deviation_count = db.query(AuditRecord).filter(
        AuditRecord.work_id.in_(work_ids),
        AuditRecord.flag_category_deviation == True
    ).count() if work_ids else 0

    # Outliers matrix
    outliers_query = (
        db.query(AuditRecord)
        .join(Work, AuditRecord.work_id == Work.work_id)
        .filter(AuditRecord.work_id.in_(work_ids))
        .filter((AuditRecord.is_statistical_outlier == True) | (AuditRecord.is_extreme_outlier == True) | (AuditRecord.ml_anomaly_score >= 0.65))
        .order_by(AuditRecord.is_extreme_outlier.desc(), AuditRecord.state_cost_ratio.desc())
        .limit(30)
        .all()
    ) if work_ids else []

    work_map = {w.work_id: w for w in works}
    outliers_matrix = []
    for a in outliers_query:
        w = work_map.get(a.work_id)
        if w:
            outliers_matrix.append({
                "work_id": w.work_id,
                "work_title": w.work_title,
                "state": w.state,
                "district": w.district,
                "category": w.category,
                "estimated_cost_inr": w.estimated_cost_inr,
                "state_cost_ratio": getattr(a, "state_cost_ratio", 1.0) or 1.0,
                "terrain_multiplier": getattr(a, "terrain_multiplier", 1.0) or 1.0,
                "is_extreme_outlier": getattr(a, "is_extreme_outlier", False) or False,
                "ml_anomaly_score": a.ml_anomaly_score,
                "verdict": a.verdict,
                "outlier_diagnostic": getattr(a, "outlier_diagnostic", "") or "",
            })

    return {
        "state": "All India" if is_national else state,
        "is_national": is_national,
        "summary": summary,
        "vendor_leaderboard": vendor_report[:15],
        "district_compliance": dc_list[:25],
        "category_deviations": cat_deviation_count,
        "outliers_matrix": outliers_matrix,
    }


@router.get("/ministry")
def get_ministry_dashboard(db: Session = Depends(get_db)):
    """Ministry (MoSPI/DIID) national dashboard."""
    summary = _compute_summary(db=db)
    all_works = db.query(Work).all()
    works_list = [_work_dict(w) for w in all_works]

    # State-wise risk summary (for heat map)
    state_risk = {}
    for w in all_works:
        s = w.state
        state_risk.setdefault(s, {"total": 0, "flagged": 0, "statutory_holds": 0,
                                   "sanctioned": 0, "disbursed": 0})
        state_risk[s]["total"] += 1
        state_risk[s]["sanctioned"] += w.estimated_cost_inr or 0
        state_risk[s]["disbursed"] += w.expenditure_incurred_inr or 0

    all_audits = db.query(AuditRecord).all()
    work_to_state = {w.work_id: w.state for w in all_works}
    for a in all_audits:
        s = work_to_state.get(a.work_id, "")
        if s and s in state_risk:
            if a.verdict != "VERIFIED COMPLIANT":
                state_risk[s]["flagged"] += 1
            if a.verdict == "STATUTORY HOLD":
                state_risk[s]["statutory_holds"] += 1

    state_risk_list = []
    for state_name, vals in state_risk.items():
        util_pct = round((vals["disbursed"] / vals["sanctioned"] * 100) if vals["sanctioned"] > 0 else 0, 1)
        flag_pct = round((vals["flagged"] / max(vals["total"], 1)) * 100, 1)
        state_risk_list.append({
            "state": state_name, **vals,
            "utilisation_pct": util_pct,
            "flag_pct": flag_pct,
        })

    # Category-wise utilisation
    cat_utilisation = {}
    for w in all_works:
        c = w.category
        cat_utilisation.setdefault(c, {"sanctioned": 0, "disbursed": 0, "count": 0})
        cat_utilisation[c]["sanctioned"] += w.estimated_cost_inr or 0
        cat_utilisation[c]["disbursed"] += w.expenditure_incurred_inr or 0
        cat_utilisation[c]["count"] += 1

    cat_list = []
    for cat, vals in cat_utilisation.items():
        util = round((vals["disbursed"] / vals["sanctioned"] * 100) if vals["sanctioned"] > 0 else 0, 1)
        cat_list.append({"category": cat, **vals, "utilisation_pct": util})
    cat_list.sort(key=lambda x: x["utilisation_pct"])

    # Dormancy pipeline (forecasted, <90 days)
    dormancy_pipeline = get_dormancy_pipeline(works_list, horizon_days=90)

    # Utilisation trend
    util_trend = forecast_utilisation_trend(works_list, group_by="state")

    return {
        "summary": summary,
        "state_risk_heatmap": state_risk_list,
        "category_utilisation": cat_list,
        "dormancy_pipeline": dormancy_pipeline[:30],
        "utilisation_trend": util_trend[:100],
    }


def _work_dict(w: Work) -> dict:
    return {c.name: getattr(w, c.name) for c in w.__table__.columns}


def _active_flags(a: AuditRecord) -> list:
    flag_names = {
        "flag_duplicate_work": "Duplicate Work",
        "flag_sor_inflated": "Cost Inflation",
        "flag_tender_splitting": "Tender Splitting",
        "flag_geo_tampering": "Geo Tampering",
        "flag_parked_funds": "Capital Dormant",
        "flag_expenditure_mismatch": "Expenditure Mismatch",
        "flag_no_physical_evidence": "No Physical Evidence",
        "flag_category_deviation": "Category Deviation",
        "flag_recycled_photo": "Recycled Photo",
    }
    return [label for col, label in flag_names.items() if getattr(a, col, False)]
