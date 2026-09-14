"""
Composite Risk Scorer — merges all engine flags + ML score into a final verdict.
Implements §6.6 of the SRS exactly.
"""
from typing import Dict


# ──────────────────────────────────────────────
# WEIGHT TABLE (from SRS §6.6)
# ──────────────────────────────────────────────
WEIGHTS = {
    "flag_duplicate_work":       35,
    "flag_sor_inflated":         30,
    "flag_geo_tampering":        25,
    "flag_tender_splitting":     25,
    "flag_parked_funds":         20,
    "flag_expenditure_mismatch": 35,   # highest — direct fund-misuse signal
    "flag_no_physical_evidence": 25,
    "flag_category_deviation":   25,   # §4.1 statutory violation -> triggers inquiry
    "flag_recycled_photo":       25,   # §6.3 fraud signal -> triggers inquiry
    "ml_anomaly_high":           15,   # ml_anomaly_score > 0.7
}

VERDICT_THRESHOLDS = {
    "STATUTORY HOLD":       60,
    "COMPLIANCE INQUIRY":   25,
    "CAPITAL DORMANT":      None,   # special: dormancy flag regardless of score
    "VERIFIED COMPLIANT":   0,
}


def compute_risk_score(flags: Dict[str, bool], ml_anomaly_score: float, is_dormant: bool) -> Dict:
    """
    Args:
        flags: dict of {flag_name: bool} for all 9 rule engines
        ml_anomaly_score: float ∈ [0, 1]
        is_dormant: bool from Engine 5 (parked funds)

    Returns:
        {risk_score, verdict}
    """
    score = 0

    for flag_name, weight in WEIGHTS.items():
        if flag_name == "ml_anomaly_high":
            if ml_anomaly_score > 0.7:
                score += weight
        else:
            if flags.get(flag_name, False):
                score += weight

    score = min(100, score)

    # Determine verdict
    if is_dormant:
        verdict = "CAPITAL DORMANT"
    elif score >= VERDICT_THRESHOLDS["STATUTORY HOLD"]:
        verdict = "STATUTORY HOLD"
    elif score >= VERDICT_THRESHOLDS["COMPLIANCE INQUIRY"]:
        verdict = "COMPLIANCE INQUIRY"
    elif any(flags.get(k, False) for k in (
        "flag_duplicate_work", "flag_sor_inflated", "flag_geo_tampering",
        "flag_tender_splitting", "flag_expenditure_mismatch",
        "flag_no_physical_evidence", "flag_category_deviation", "flag_recycled_photo"
    )):
        # Any active statutory fraud/violation flag requires compliance inquiry
        verdict = "COMPLIANCE INQUIRY"
    else:
        verdict = "VERIFIED COMPLIANT"

    return {"risk_score": float(score), "verdict": verdict}


def build_statutory_dossier(flags: Dict[str, bool], flag_dossiers: Dict[str, str],
                             ml_anomaly_score: float, is_dormant: bool) -> str:
    """
    Concatenates all triggered engine dossier strings into one statutory document.
    """
    sections = []
    for flag_name, triggered in flags.items():
        if triggered and flag_name in flag_dossiers and flag_dossiers[flag_name]:
            sections.append(flag_dossiers[flag_name])

    if ml_anomaly_score > 0.7:
        sections.append(
            f"ML ANOMALY DETECTION: Isolation Forest anomaly score {ml_anomaly_score:.2f} "
            "(threshold: 0.70) — this work is a multivariate outlier across the feature "
            "space of cost ratio, completion velocity, disbursement pace, and stall duration. "
            "No single threshold is breached, but the combination of these signals deviates "
            "significantly from the scheme-wide distribution of compliant works."
        )

    if not sections:
        return "No anomalies detected. All rule engines and ML scorer returned within normal parameters."

    return "\n\n".join(f"[{i+1}] {s}" for i, s in enumerate(sections))


def get_recommended_action(verdict: str, flags: Dict[str, bool]) -> str:
    if verdict == "STATUTORY HOLD":
        return (
            "IMMEDIATE ACTION REQUIRED: Suspend further fund disbursement for this work. "
            "District Authority to conduct mandatory physical site inspection within 7 days. "
            "MP to submit written explanation to State Nodal Authority. "
            "Refer to CVO/Ministry DIID for independent audit if inspection confirms irregularity."
        )
    elif verdict == "CAPITAL DORMANT":
        return (
            "DORMANCY NOTICE: Issue formal notice to implementing agency for completion within "
            "60 days or explain grounds for delay. District Authority to submit utilisation "
            "certificate. If no progress in 30 days, recommend fund recovery proceedings under "
            "MPLADS Guidelines 2023 §8.5."
        )
    elif verdict == "COMPLIANCE INQUIRY":
        return (
            "INQUIRY INITIATED: Request detailed progress report and supporting documentation "
            "(photographs, measurement books, contractor bills) from implementing agency within "
            "15 days. Escalate to State Nodal Authority if documentation is incomplete."
        )
    else:
        return "No action required. Continue routine monitoring as per MPLADS Guidelines 2023 §9.1."
