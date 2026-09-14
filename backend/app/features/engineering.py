"""
Feature Engineering Layer
Provides: Haversine distance, TF-IDF similarity, pHash Hamming distance,
cost ratio, completion velocity, disbursement pace, vendor aggregates.
"""
import math
from typing import List, Tuple, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


# ──────────────────────────────────────────────
# GEOSPATIAL
# ──────────────────────────────────────────────

def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Returns distance in metres between two WGS-84 coordinates."""
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.asin(math.sqrt(max(0.0, a)))


def india_bounding_box_valid(lat: float, lon: float) -> bool:
    """Validates that coordinates fall within India's bounding box."""
    return 6.5 <= lat <= 37.5 and 68.0 <= lon <= 98.0


# ──────────────────────────────────────────────
# TEXTUAL SIMILARITY (TF-IDF)
# ──────────────────────────────────────────────

def tfidf_similarity(titles: List[str]) -> np.ndarray:
    """
    Returns an n×n cosine similarity matrix for the given list of work titles.
    Uses 1-gram and 2-gram TF-IDF features.
    """
    if not titles or len(titles) < 2:
        return np.array([[1.0]])
    vec = TfidfVectorizer(ngram_range=(1, 2), analyzer="word", min_df=1)
    try:
        tfidf_matrix = vec.fit_transform(titles)
        return cosine_similarity(tfidf_matrix)
    except Exception:
        return np.eye(len(titles))


def pairwise_text_similarity(title_a: str, title_b: str) -> float:
    """Returns cosine similarity (0–1) between two work titles."""
    mat = tfidf_similarity([title_a, title_b])
    return float(mat[0, 1])


# ──────────────────────────────────────────────
# PERCEPTUAL HASH
# ──────────────────────────────────────────────

def phash_hamming(hash_a: str, hash_b: str) -> int:
    """
    Computes Hamming distance between two 64-bit hex pHash strings.
    Returns 64 (max) if either hash is empty/invalid.
    """
    if not hash_a or not hash_b or len(hash_a) != 16 or len(hash_b) != 16:
        return 64
    try:
        a_int = int(hash_a, 16)
        b_int = int(hash_b, 16)
        xor = a_int ^ b_int
        return bin(xor).count("1")
    except ValueError:
        return 64


# ──────────────────────────────────────────────
# COST / FINANCIAL FEATURES
# ──────────────────────────────────────────────

def cost_sor_ratio(estimated_cost: float, sor_benchmark: float) -> float:
    """Returns estimated_cost / sor_benchmark. Returns 1.0 if benchmark is 0."""
    if not sor_benchmark or sor_benchmark <= 0:
        return 1.0
    return estimated_cost / sor_benchmark


def disbursement_pace(expenditure: float, estimated_cost: float) -> float:
    """Fraction of estimated cost already disbursed (0–1+)."""
    if not estimated_cost or estimated_cost <= 0:
        return 0.0
    return min(expenditure / estimated_cost, 2.0)


def completion_velocity(completion_pct: float, days_elapsed: int) -> float:
    """Completion percentage per day elapsed since sanction."""
    if days_elapsed <= 0:
        return 0.0
    return completion_pct / days_elapsed


def expenditure_progress_gap(expenditure: float, estimated_cost: float, completion_pct: float) -> float:
    """
    (expenditure_pct - completion_pct) in percentage points.
    Positive = more money spent than work done.
    """
    if not estimated_cost or estimated_cost <= 0:
        return 0.0
    exp_pct = (expenditure / estimated_cost) * 100
    return exp_pct - completion_pct


# ──────────────────────────────────────────────
# VENDOR FEATURE AGGREGATION
# ──────────────────────────────────────────────

def build_vendor_features(works: List[Dict]) -> Dict[str, Dict]:
    """
    Aggregates per-vendor features from a list of work dicts.
    Returns {vendor_id: {avg_contract_size, award_count, near_threshold_pct, avg_cost_ratio}}
    """
    vendor_map: Dict[str, List] = {}
    for w in works:
        vid = w.get("vendor_id", "")
        if vid not in vendor_map:
            vendor_map[vid] = []
        vendor_map[vid].append(w)

    features = {}
    for vid, wlist in vendor_map.items():
        costs = [w.get("estimated_cost_inr", 0) or 0 for w in wlist]
        benchmarks = [w.get("sor_benchmark_cost_inr", 0) or 0 for w in wlist]
        ratios = [cost_sor_ratio(c, b) for c, b in zip(costs, benchmarks) if b > 0]
        # "near threshold" = priced ₹9L–9.99L (just under ₹10L tender limit)
        near_threshold = sum(1 for c in costs if 900_000 <= c <= 999_000)
        features[vid] = {
            "vendor_id": vid,
            "award_count": len(wlist),
            "avg_contract_size": float(np.mean(costs)) if costs else 0,
            "near_threshold_count": near_threshold,
            "near_threshold_pct": near_threshold / max(len(costs), 1),
            "avg_cost_ratio": float(np.mean(ratios)) if ratios else 1.0,
        }
    return features
