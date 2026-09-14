"""
Full Audit Pipeline — orchestrates all detection steps end-to-end.
Called on CSV ingest or on-demand re-run.
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from .models import Work, MilestonePhoto, AuditRecord, Alert
from .detection.rule_engines import (
    engine_duplicate_work,
    engine_sor_inflated,
    engine_tender_splitting,
    engine_geo_tampering,
    engine_parked_funds,
    engine_expenditure_mismatch,
    engine_no_physical_evidence,
    engine_category_deviation,
    engine_recycled_progression_photo,
)
from .detection.isolation_forest import train_and_score
from .detection.vendor_clustering import cluster_vendor_risk
from .detection.forecasting import predict_dormancy_risk
from .detection.risk_scorer import compute_risk_score, build_statutory_dossier, get_recommended_action


def run_full_pipeline(db: Session) -> Dict[str, Any]:
    """
    Executes the complete audit pipeline:
    1. Load all works + milestones from DB
    2. Run all 9 rule engines
    3. Run Isolation Forest ML scorer
    4. Run vendor clustering
    5. Run dormancy forecasting
    6. Compute composite risk scores + verdicts
    7. Persist AuditRecord + Alert entries
    Returns summary statistics.
    """
    # ── 1. Load data ──────────────────────────
    works_orm = db.query(Work).all()
    milestones_orm = db.query(MilestonePhoto).all()

    if not works_orm:
        return {"processed": 0, "message": "No works found in database."}

    works: List[Dict] = [_work_to_dict(w) for w in works_orm]
    milestones: List[Dict] = [_milestone_to_dict(m) for m in milestones_orm]

    # Pre-compute milestone counts per work_id
    milestone_counts: Dict[str, int] = {}
    for m in milestones:
        wid = m["work_id"]
        milestone_counts[wid] = milestone_counts.get(wid, 0) + 1

    # ── 2. ML scoring ─────────────────────────
    print("[Pipeline] Running Isolation Forest...")
    ml_scores: Dict[str, float] = train_and_score(works)

    # ── 3. Vendor clustering ──────────────────
    print("[Pipeline] Running vendor clustering...")
    vendor_tiers: Dict[str, str] = cluster_vendor_risk(works)

    # ── 4. Per-work rule engines ──────────────
    print(f"[Pipeline] Running rule engines on {len(works)} works...")
    # Clear old audit records and alerts
    db.query(AuditRecord).delete()
    db.query(Alert).delete()
    db.commit()

    processed = 0
    high_risk = 0

    for work in works:
        wid = work["work_id"]

        # Run all 9 engines
        dup_flag,   dup_dos   = engine_duplicate_work(work, works)
        sor_flag,   sor_dos   = engine_sor_inflated(work)
        split_flag, split_dos = engine_tender_splitting(work, works)
        geo_flag,   geo_dos   = engine_geo_tampering(work)
        dorm_flag,  dorm_dos  = engine_parked_funds(work)
        exp_flag,   exp_dos   = engine_expenditure_mismatch(work)
        evid_flag,  evid_dos  = engine_no_physical_evidence(work, milestone_counts)
        cat_flag,   cat_dos   = engine_category_deviation(work, milestones)
        prog_flag,  prog_dos  = engine_recycled_progression_photo(work, milestones)

        flags = {
            "flag_duplicate_work":       dup_flag,
            "flag_sor_inflated":         sor_flag,
            "flag_tender_splitting":     split_flag,
            "flag_geo_tampering":        geo_flag,
            "flag_parked_funds":         dorm_flag,
            "flag_expenditure_mismatch": exp_flag,
            "flag_no_physical_evidence": evid_flag,
            "flag_category_deviation":   cat_flag,
            "flag_recycled_photo":       prog_flag,
        }
        flag_dossiers = {
            "flag_duplicate_work": dup_dos,
            "flag_sor_inflated": sor_dos,
            "flag_tender_splitting": split_dos,
            "flag_geo_tampering": geo_dos,
            "flag_parked_funds": dorm_dos,
            "flag_expenditure_mismatch": exp_dos,
            "flag_no_physical_evidence": evid_dos,
            "flag_category_deviation": cat_dos,
            "flag_recycled_photo": prog_dos,
        }

        ml_info = ml_scores.get(wid, {})
        if isinstance(ml_info, dict):
            ml_score = float(ml_info.get("ml_anomaly_score", 0.0))
            is_stat_outlier = bool(ml_info.get("is_statistical_outlier", False))
            is_ext_outlier = bool(ml_info.get("is_extreme_outlier", False))
            st_cost_ratio = float(ml_info.get("state_cost_ratio", 1.0))
            terr_mult = float(ml_info.get("terrain_multiplier", 1.0))
            outlier_diag = str(ml_info.get("outlier_diagnostic", ""))
        else:
            ml_score = float(ml_info)
            is_stat_outlier = False
            is_ext_outlier = False
            st_cost_ratio = 1.0
            terr_mult = 1.0
            outlier_diag = ""

        result = compute_risk_score(flags, ml_score, dorm_flag)
        dossier = build_statutory_dossier(flags, flag_dossiers, ml_score, dorm_flag)
        if outlier_diag:
            dossier += f"\n• STATISTICAL OUTLIER ANALYSIS: {outlier_diag}"

        action  = get_recommended_action(result["verdict"], flags)

        # Dormancy forecast
        at_risk, days_to_thresh = predict_dormancy_risk(work)

        # Vendor tier
        v_tier = vendor_tiers.get(work.get("vendor_id", ""), "LOW")

        # ── Persist AuditRecord ───────────────
        audit = AuditRecord(
            work_id                   = wid,
            risk_score                = result["risk_score"],
            verdict                   = result["verdict"],
            statutory_dossier         = dossier,
            flag_duplicate_work       = dup_flag,
            flag_sor_inflated         = sor_flag,
            flag_tender_splitting     = split_flag,
            flag_geo_tampering        = geo_flag,
            flag_parked_funds         = dorm_flag,
            flag_expenditure_mismatch = exp_flag,
            flag_no_physical_evidence = evid_flag,
            flag_category_deviation   = cat_flag,
            flag_recycled_photo       = prog_flag,
            ml_anomaly_score          = ml_score,
            days_to_dormancy_threshold = days_to_thresh,
            projected_dormancy_risk   = at_risk,
            vendor_risk_tier          = v_tier,
            is_statistical_outlier    = is_stat_outlier,
            is_extreme_outlier        = is_ext_outlier,
            state_cost_ratio          = st_cost_ratio,
            terrain_multiplier        = terr_mult,
            outlier_diagnostic        = outlier_diag,
        )
        db.add(audit)

        # ── Generate Alerts ───────────────────
        verdict = result["verdict"]
        if verdict != "VERIFIED COMPLIANT":
            severity = "HIGH" if verdict == "STATUTORY HOLD" else "MEDIUM"
            if verdict == "CAPITAL DORMANT":
                severity = "HIGH"
            high_risk += (1 if severity == "HIGH" else 0)

            # Alert for MP
            db.add(Alert(
                work_id=wid, severity=severity, verdict=verdict,
                target_role="mp", target_id=work.get("mp_id", ""),
                summary=f"{verdict}: {work.get('work_title','')} ({work.get('category','')})",
                statutory_dossier=dossier, recommended_action=action,
            ))
            # Alert for District
            db.add(Alert(
                work_id=wid, severity=severity, verdict=verdict,
                target_role="district", target_id=work.get("district", ""),
                summary=f"{verdict}: {work.get('work_title','')} in {work.get('constituency','')}",
                statutory_dossier=dossier, recommended_action=action,
            ))
            # Alert for State
            db.add(Alert(
                work_id=wid, severity=severity, verdict=verdict,
                target_role="state", target_id=work.get("state", ""),
                summary=f"{verdict}: {work.get('work_title','')} ({work.get('district','')})",
                statutory_dossier=dossier, recommended_action=action,
            ))
            # Always notify Ministry for STATUTORY HOLD
            if verdict == "STATUTORY HOLD":
                db.add(Alert(
                    work_id=wid, severity="HIGH", verdict=verdict,
                    target_role="ministry", target_id="NATIONAL",
                    summary=f"STATUTORY HOLD: {work.get('work_title','')} — {work.get('state','')}",
                    statutory_dossier=dossier, recommended_action=action,
                ))

        processed += 1

    db.commit()
    print(f"[Pipeline] Complete. {processed} works processed, {high_risk} high-risk alerts generated.")
    return {
        "processed": processed,
        "high_risk_alerts": high_risk,
        "message": f"Pipeline complete. {processed} works audited.",
    }


def _work_to_dict(w: Work) -> Dict:
    return {c.name: getattr(w, c.name) for c in w.__table__.columns}


def _milestone_to_dict(m: MilestonePhoto) -> Dict:
    return {c.name: getattr(m, c.name) for c in m.__table__.columns}
