"""
Vendor Risk Clustering — KMeans on vendor-level aggregates.
Assigns each vendor to a risk tier: HIGH / MEDIUM / LOW.
"""
import numpy as np
from typing import Dict, List
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from ..features.engineering import build_vendor_features


def cluster_vendor_risk(works: List[Dict]) -> Dict[str, str]:
    """
    Returns {vendor_id: "HIGH" | "MEDIUM" | "LOW"} risk tier for every vendor.
    """
    vendor_features = build_vendor_features(works)
    if not vendor_features:
        return {}

    vendor_ids = list(vendor_features.keys())
    feature_keys = ["award_count", "avg_contract_size", "near_threshold_pct", "avg_cost_ratio"]
    X = np.array([[vendor_features[vid][k] for k in feature_keys] for vid in vendor_ids], dtype=float)
    X = np.nan_to_num(X, nan=0.0)

    if len(vendor_ids) < 3:
        return {vid: "LOW" for vid in vendor_ids}

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    k = min(3, len(vendor_ids))
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)

    # Determine which cluster is highest risk:
    # highest average (near_threshold_pct + avg_cost_ratio) → HIGH
    cluster_risk_score = {}
    for cluster_id in range(k):
        idxs = [i for i, l in enumerate(labels) if l == cluster_id]
        avg_ntp   = np.mean([vendor_features[vendor_ids[i]]["near_threshold_pct"] for i in idxs])
        avg_ratio = np.mean([vendor_features[vendor_ids[i]]["avg_cost_ratio"] for i in idxs])
        cluster_risk_score[cluster_id] = avg_ntp * 2 + avg_ratio

    sorted_clusters = sorted(cluster_risk_score.items(), key=lambda x: x[1], reverse=True)
    tier_map = {}
    for rank, (cluster_id, _) in enumerate(sorted_clusters):
        tier = ["HIGH", "MEDIUM", "LOW"][min(rank, 2)]
        tier_map[cluster_id] = tier

    return {vendor_ids[i]: tier_map[labels[i]] for i in range(len(vendor_ids))}


def get_vendor_features_report(works: List[Dict]) -> List[Dict]:
    """Returns a sorted list of vendor risk feature dicts for the leaderboard."""
    vendor_features = build_vendor_features(works)
    tiers = cluster_vendor_risk(works)
    result = []
    for vid, feats in vendor_features.items():
        row = dict(feats)
        row["risk_tier"] = tiers.get(vid, "LOW")
        row["vendor_name"] = next(
            (w["vendor_name"] for w in works if w.get("vendor_id") == vid), vid
        )
        result.append(row)
    return sorted(result, key=lambda x: (x["risk_tier"] == "HIGH", x["near_threshold_pct"]), reverse=True)
