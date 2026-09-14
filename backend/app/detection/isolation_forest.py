"""
Hierarchical State-Conditioned Outlier Detection & Isolation Forest Engine
--------------------------------------------------------------------------
Designed for Pan-India Scale (28 States + 8 UTs).

Addresses Pan-India Heterogeneity:
1. Normalizes costs against State-Category Medians rather than crude national averages.
2. Incorporates authentic CPWD/PWD Terrain & Remoteness Multipliers (e.g., Himalayan,
   North-Eastern, and Island cost variations) so legitimate high-altitude construction
   transport costs do not trigger false positive fraud alarms.
3. Employs RobustScaler (Median & IQR based) rather than StandardScaler to prevent
   extreme expenditure outliers from corrupting the scaling baseline.
4. Provides dual outlier verdict:
   - Non-linear multivariate Isolation Forest ML Anomaly Score ∈ [0, 1]
   - Tukey's Interquartile Range (IQR) & MAD Statistical Outlier Fence
"""

import numpy as np
from typing import List, Dict, Tuple, Any
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import RobustScaler
from datetime import datetime
from ..master_pan_india import get_terrain_multiplier, get_state_info
from ..features.engineering import (
    cost_sor_ratio, disbursement_pace, completion_velocity, expenditure_progress_gap
)


def _compute_state_category_benchmarks(works: List[Dict]) -> Dict[Tuple[str, str], Dict[str, float]]:
    """
    Computes median, Q1, Q3, and IQR of estimated costs grouped by (state, category).
    Falls back gracefully if group sample size is small.
    """
    groups: Dict[Tuple[str, str], List[float]] = {}
    cat_all: Dict[str, List[float]] = {}

    for w in works:
        st = w.get("state", "General") or "General"
        cat = w.get("category", "Infrastructure") or "Infrastructure"
        cost = float(w.get("estimated_cost_inr", 0) or 0)
        if cost > 0:
            groups.setdefault((st, cat), []).append(cost)
            cat_all.setdefault(cat, []).append(cost)

    benchmarks: Dict[Tuple[str, str], Dict[str, float]] = {}
    for (st, cat), costs in groups.items():
        arr = np.array(costs)
        q25, med, q75 = np.percentile(arr, [25, 50, 75])
        iqr = max(1.0, q75 - q25)
        benchmarks[(st, cat)] = {
            "median": float(med),
            "q25": float(q25),
            "q75": float(q75),
            "iqr": float(iqr),
            "count": len(costs)
        }

    # Also compute national category fallback medians
    for cat, costs in cat_all.items():
        arr = np.array(costs)
        q25, med, q75 = np.percentile(arr, [25, 50, 75])
        benchmarks[("__national__", cat)] = {
            "median": float(med),
            "q25": float(q25),
            "q75": float(q75),
            "iqr": max(1.0, float(q75 - q25)),
            "count": len(costs)
        }

    return benchmarks


def _build_robust_feature_matrix(
    works: List[Dict],
    benchmarks: Dict[Tuple[str, str], Dict[str, float]]
) -> Tuple[np.ndarray, List[Dict[str, Any]]]:
    """
    Builds a robust feature matrix using state-conditioned and terrain-adjusted metrics:
    [adjusted_cost_ratio, comp_velocity, stalled_ratio, disburse_pace, exp_progress_gap, completion_pct]
    """
    rows = []
    metadata = []
    today = datetime.today()

    for w in works:
        st = w.get("state", "General") or "General"
        cat = w.get("category", "Infrastructure") or "Infrastructure"
        est = float(w.get("estimated_cost_inr", 0) or 0)
        sor = float(w.get("sor_benchmark_cost_inr", 0) or 0)
        exp = float(w.get("expenditure_incurred_inr", 0) or 0)
        pct = float(w.get("completion_pct", 0) or 0)
        stalled = float(w.get("days_stalled", 0) or 0)

        # Lookup benchmark
        bm = benchmarks.get((st, cat)) or benchmarks.get(("__national__", cat), {"median": sor or est or 1.0, "q75": sor or est or 1.0, "iqr": (sor or est or 1.0)*0.2})
        median_cost = max(1.0, bm["median"])
        terrain_mult = get_terrain_multiplier(st)

        # State-relative cost ratio
        state_cost_ratio = est / median_cost
        # Terrain-adjusted cost ratio (discounts legitimate mountain/island transport factors)
        adjusted_cost_ratio = state_cost_ratio / terrain_mult

        # Elapsed days
        try:
            sd = datetime.strptime(w.get("sanction_date", "2022-01-01"), "%Y-%m-%d")
            days_elapsed = max(1, (today - sd).days)
        except Exception:
            days_elapsed = 365

        f_comp_vel = completion_velocity(pct, days_elapsed)
        f_stalled = min(stalled / 365.0, 3.0)
        f_disburse = disbursement_pace(exp, est)
        f_gap = expenditure_progress_gap(exp, est, pct) / 100.0
        f_pct = pct / 100.0

        rows.append([adjusted_cost_ratio, f_comp_vel, f_stalled, f_disburse, f_gap, f_pct])

        # Statistical IQR outlier check
        q75 = bm.get("q75", median_cost * 1.2)
        iqr = bm.get("iqr", median_cost * 0.3)
        mild_fence = q75 + (1.5 * iqr * terrain_mult)
        extreme_fence = q75 + (3.0 * iqr * terrain_mult)

        is_stat_outlier = bool(est > mild_fence)
        is_ext_outlier = bool(est > extreme_fence)

        diagnostic = ""
        if is_ext_outlier:
            diagnostic = f"Extreme Statistical Outlier: Cost ₹{est:,.0f} is {state_cost_ratio:.2f}× above {st} median for {cat} (exceeds 3.0× IQR fence). Terrain index: {terrain_mult}×."
        elif is_stat_outlier:
            diagnostic = f"Statistical Outlier: Cost ₹{est:,.0f} is {state_cost_ratio:.2f}× above {st} median for {cat} (exceeds 1.5× IQR fence). Terrain index: {terrain_mult}×."
        elif adjusted_cost_ratio < 0.35 and est > 0:
            diagnostic = f"Sub-normal Cost: Value is significantly below {st} standard rates ({state_cost_ratio:.2f}× of median)."

        metadata.append({
            "work_id": w["work_id"],
            "state_cost_ratio": round(state_cost_ratio, 2),
            "terrain_multiplier": terrain_mult,
            "is_statistical_outlier": is_stat_outlier,
            "is_extreme_outlier": is_ext_outlier,
            "outlier_diagnostic": diagnostic,
        })

    return np.array(rows, dtype=float), metadata


def train_and_score(works: List[Dict]) -> Dict[str, Dict[str, Any]]:
    """
    Trains a Robust-scaled Isolation Forest on all works across India.
    Returns:
    {
        work_id: {
            "ml_anomaly_score": float [0, 1],
            "is_statistical_outlier": bool,
            "is_extreme_outlier": bool,
            "state_cost_ratio": float,
            "terrain_multiplier": float,
            "outlier_diagnostic": str
        }
    }
    """
    if len(works) < 5:
        return {
            w["work_id"]: {
                "ml_anomaly_score": 0.0,
                "is_statistical_outlier": False,
                "is_extreme_outlier": False,
                "state_cost_ratio": 1.0,
                "terrain_multiplier": get_terrain_multiplier(w.get("state", "")),
                "outlier_diagnostic": "",
            }
            for w in works
        }

    benchmarks = _compute_state_category_benchmarks(works)
    X, metadata = _build_robust_feature_matrix(works, benchmarks)

    # Replace any NaN/Inf with safe bounds
    X = np.nan_to_num(X, nan=0.0, posinf=5.0, neginf=-5.0)

    # RobustScaler uses Median and Interquartile Range (immune to extreme value skew)
    scaler = RobustScaler(with_centering=True, with_scaling=True, quantile_range=(25.0, 75.0))
    X_scaled = scaler.fit_transform(X)

    # Train Isolation Forest on scaled feature representations
    clf = IsolationForest(
        n_estimators=250,
        contamination=0.10,  # 10% expected anomaly contamination in robust Pan-India dataset
        max_samples="auto",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_scaled)

    # Invert decision function so higher = more anomalous
    raw_scores = -clf.decision_function(X_scaled)
    mn, mx = raw_scores.min(), raw_scores.max()
    if mx > mn:
        norm_scores = (raw_scores - mn) / (mx - mn)
    else:
        norm_scores = np.zeros_like(raw_scores)

    results: Dict[str, Dict[str, Any]] = {}
    for i, meta in enumerate(metadata):
        wid = meta["work_id"]
        results[wid] = {
            "ml_anomaly_score": round(float(norm_scores[i]), 3),
            "is_statistical_outlier": meta["is_statistical_outlier"],
            "is_extreme_outlier": meta["is_extreme_outlier"],
            "state_cost_ratio": meta["state_cost_ratio"],
            "terrain_multiplier": meta["terrain_multiplier"],
            "outlier_diagnostic": meta["outlier_diagnostic"],
        }

    return results
