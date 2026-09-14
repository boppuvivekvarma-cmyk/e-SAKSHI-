"""
Predictive / Early-Warning Forecasting Module.
Projects whether in-progress works will breach the 180-day dormancy threshold
before they actually do — satisfying the PS 'early warning mechanism' requirement.
Also produces constituency-level fund utilisation trend data for the Ministry view.
"""
import numpy as np
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta


DORMANCY_THRESHOLD_DAYS = 180
COMPLETION_DORMANCY_PCT = 10  # below this at threshold = dormant
DORMANCY_COMPLETION_PCT = 10


def _days_elapsed(sanction_date_str: str) -> int:
    try:
        sd = datetime.strptime(sanction_date_str, "%Y-%m-%d")
        return max(1, (datetime.today() - sd).days)
    except Exception:
        return 365


def predict_dormancy_risk(work: Dict) -> Tuple[bool, Optional[int]]:
    """
    For an in-progress/stalled work, estimates days until it becomes CAPITAL DORMANT.
    Uses linear extrapolation of completion velocity.

    Returns: (projected_dormancy_risk: bool, days_to_threshold: int | None)
    - projected_dormancy_risk = True if work is on track to hit 180-day stall
      with <10% completion before completion is achieved.
    - days_to_threshold = estimated days remaining until the dormancy condition is met
      (None if not at risk or already dormant).
    """
    status      = work.get("work_status", "")
    completion  = work.get("completion_pct", 0) or 0
    days_stalled = work.get("days_stalled", 0) or 0
    sanction_date = work.get("sanction_date", "")

    # Already fully dormant
    if days_stalled >= DORMANCY_THRESHOLD_DAYS and completion < DORMANCY_COMPLETION_PCT:
        return (True, 0)

    # Only forecast for in-progress or stalled works
    if status not in ("In Progress", "Stalled", "Not Started"):
        return (False, None)

    days_el = _days_elapsed(sanction_date)

    # If stalled but not yet at threshold
    if status == "Stalled" and days_stalled > 0:
        days_remaining = max(0, DORMANCY_THRESHOLD_DAYS - days_stalled)
        if completion < DORMANCY_COMPLETION_PCT:
            return (True, days_remaining)
        return (False, None)

    # Estimate completion velocity (% per day)
    if days_el > 0 and completion > 0:
        velocity = completion / days_el  # %/day
        # Days to reach 100% at current velocity
        if velocity > 0:
            days_to_complete = (100 - completion) / velocity
        else:
            days_to_complete = float("inf")

        # Stall budget remaining before dormancy threshold
        stall_budget = max(0, DORMANCY_THRESHOLD_DAYS - days_stalled)

        # If work is essentially stalled (velocity near 0) and completion < 10%
        if velocity < 0.05 and completion < DORMANCY_COMPLETION_PCT:
            return (True, stall_budget)

        # If projected completion date exceeds stall budget + current stall
        if days_to_complete > stall_budget + 90 and completion < DORMANCY_COMPLETION_PCT + 20:
            return (True, stall_budget)

    # No dormancy risk detected
    return (False, None)


def forecast_utilisation_trend(works: List[Dict], group_by: str = "state") -> List[Dict]:
    """
    Groups works by 'state' or 'constituency' and computes quarterly utilisation rates.
    Returns a list of {group, quarter, utilisation_pct} for trend charts.
    """
    # Group by the given field
    groups: Dict[str, List[Dict]] = {}
    for w in works:
        key = w.get(group_by, "Unknown")
        groups.setdefault(key, []).append(w)

    result = []
    for group_name, group_works in groups.items():
        total_est = sum(w.get("estimated_cost_inr", 0) or 0 for w in group_works)
        total_exp = sum(w.get("expenditure_incurred_inr", 0) or 0 for w in group_works)
        utilisation_pct = (total_exp / total_est * 100) if total_est > 0 else 0

        # Simulate quarterly breakdown by sanction year-quarter
        quarterly: Dict[str, Tuple[float, float]] = {}
        for w in group_works:
            try:
                sd = datetime.strptime(w.get("sanction_date", "2022-01-01"), "%Y-%m-%d")
                q = f"{sd.year}-Q{(sd.month - 1) // 3 + 1}"
            except Exception:
                q = "2022-Q1"
            prev = quarterly.get(q, (0.0, 0.0))
            quarterly[q] = (
                prev[0] + (w.get("estimated_cost_inr", 0) or 0),
                prev[1] + (w.get("expenditure_incurred_inr", 0) or 0),
            )
        for q, (est, exp) in sorted(quarterly.items()):
            result.append({
                "group": group_name,
                "quarter": q,
                "estimated_inr": est,
                "disbursed_inr": exp,
                "utilisation_pct": round((exp / est * 100) if est > 0 else 0, 1),
            })

    return result


def get_dormancy_pipeline(works: List[Dict], horizon_days: int = 90) -> List[Dict]:
    """
    Returns works projected to become dormant within `horizon_days`.
    For Ministry dashboard: 'Forecasted Dormancy Pipeline'.
    """
    pipeline = []
    for w in works:
        if w.get("work_status") == "Completed":
            continue
        at_risk, days_rem = predict_dormancy_risk(w)
        if at_risk and days_rem is not None and days_rem <= horizon_days:
            pipeline.append({
                "work_id": w["work_id"],
                "work_title": w.get("work_title"),
                "mp_name": w.get("mp_name"),
                "constituency": w.get("constituency"),
                "state": w.get("state"),
                "district": w.get("district"),
                "completion_pct": w.get("completion_pct", 0),
                "days_stalled": w.get("days_stalled", 0),
                "days_to_dormancy": days_rem,
                "estimated_cost_inr": w.get("estimated_cost_inr", 0),
                "expenditure_incurred_inr": w.get("expenditure_incurred_inr", 0),
                "urgency": "CRITICAL" if days_rem <= 30 else ("HIGH" if days_rem <= 60 else "MEDIUM"),
            })

    return sorted(pipeline, key=lambda x: x["days_to_dormancy"])
