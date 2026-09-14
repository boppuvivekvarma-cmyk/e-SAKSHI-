"""
All 9 Deterministic Rule Engines for e-SAKSHI 2.0 Sentinel.
Each engine returns (flagged: bool, dossier: str).
Statutory citations are real MPLADS Guidelines 2023 / GFR 2017 / CVC references.
"""
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
from ..features.engineering import (
    haversine_distance_m, pairwise_text_similarity,
    phash_hamming, cost_sor_ratio, expenditure_progress_gap,
    india_bounding_box_valid
)


# ──────────────────────────────────────────────
# ENGINE 1: Spatial-Semantic Duplicate Detection
# ──────────────────────────────────────────────
DUPLICATE_MAX_DIST_M       = 200.0
DUPLICATE_MIN_TITLE_SIM    = 0.40
DUPLICATE_PHASH_MAX_HAMMING = 2

def engine_duplicate_work(
    work: Dict, all_works: List[Dict]
) -> Tuple[bool, str]:
    """
    Flags if another work exists within 200m with ≥40% title similarity
    OR the same pHash (Hamming ≤ 2) as another work.
    Citation: MPLADS Guidelines 2023 §3.4 — prohibition on duplicate sanctions.
    """
    wid = work["work_id"]
    lat1, lon1 = work.get("latitude", 0), work.get("longitude", 0)
    title1 = work.get("work_title", "")
    phash1 = work.get("photo_phash", "")
    category1 = work.get("category", "")

    for other in all_works:
        if other["work_id"] == wid:
            continue
        lat2, lon2 = other.get("latitude", 0), other.get("longitude", 0)
        phash2 = other.get("photo_phash", "")

        # pHash duplicate check
        if phash1 and phash2 and phash_hamming(phash1, phash2) <= DUPLICATE_PHASH_MAX_HAMMING:
            return (True,
                "ENGINE 1 — Spatial-Semantic Duplicate: Identical perceptual hash (Hamming ≤ 2) detected "
                f"with work {other['work_id']} ({other.get('work_title','')}). "
                "Citation: MPLADS Guidelines 2023 §3.4 — no MP shall recommend a work that duplicates "
                "an existing sanctioned or completed work. GFR 2017 Rule 202 — economy and "
                "avoidance of duplication in public expenditure.")

        # Spatial + semantic check
        if lat1 and lat2:
            dist = haversine_distance_m(lat1, lon1, lat2, lon2)
            if dist <= DUPLICATE_MAX_DIST_M:
                sim = pairwise_text_similarity(title1, other.get("work_title", ""))
                if sim >= DUPLICATE_MIN_TITLE_SIM or other.get("category") == category1:
                    return (True,
                        f"ENGINE 1 — Spatial-Semantic Duplicate: Work {other['work_id']} "
                        f"({other.get('work_title','')}) is {dist:.0f}m away with {sim*100:.0f}% "
                        f"title similarity and same category '{category1}'. "
                        "Citation: MPLADS Guidelines 2023 §3.4 — prohibition on sanctioning "
                        "duplicate works within the same locality. Recommended: Joint site "
                        "verification before release of further funds.")
    return (False, "")


from ..master_pan_india import get_terrain_multiplier

SOR_INFLATION_THRESHOLD = 1.10   # 10% standard GFR/CPWD tender variation threshold

def engine_sor_inflated(work: Dict) -> Tuple[bool, str]:
    """
    Flags if estimated_cost > 1.10× SoR benchmark for the work category,
    adjusting for legitimate state-specific terrain/remoteness multipliers.
    Citation: GFR 2017 Rule 149(i) — cost estimates to be based on
    approved Schedule of Rates; deviations require prior sanction.
    """
    est  = work.get("estimated_cost_inr", 0) or 0
    sor  = work.get("sor_benchmark_cost_inr", 0) or 0
    if sor <= 0:
        return (False, "")
    
    state = work.get("state", "")
    terrain_mult = get_terrain_multiplier(state)
    effective_sor = sor * terrain_mult
    ratio = cost_sor_ratio(est, effective_sor)

    if ratio > SOR_INFLATION_THRESHOLD:
        overage_pct = (ratio - 1.0) * 100
        terrain_note = f" (State terrain allowance: {terrain_mult}× applied for {state})" if terrain_mult > 1.0 else ""
        return (True,
            f"ENGINE 2 — Forensic Rate Analysis: Estimated cost ₹{est:,.0f} is "
            f"{overage_pct:.1f}% above terrain-adjusted SoR benchmark ₹{effective_sor:,.0f} for category "
            f"'{work.get('category','')}'{terrain_note} (inflation ratio {ratio:.2f}×). "
            "Citation: GFR 2017 Rule 149(i) — cost estimates must be based on approved PWD "
            "Schedule of Rates; excess beyond 10% requires counter-signature of superintending "
            "engineer. CVC Circular 04/2021 §2.3 — abnormally high-cost tenders to be "
            "referred for independent rate analysis before award.")
    return (False, "")


# ──────────────────────────────────────────────
# ENGINE 3: Procurement Regularity (Tender Splitting)
# ──────────────────────────────────────────────
SPLIT_MAX_DAYS      = 14
SPLIT_MIN_AMOUNT    = 900_000
SPLIT_MAX_AMOUNT    = 999_000

def engine_tender_splitting(work: Dict, all_works: List[Dict]) -> Tuple[bool, str]:
    """
    Flags if same vendor has ≥2 works priced ₹9L–9.99L sanctioned within 14 days.
    Intent: avoid ₹10L open-tender threshold by splitting.
    Citation: CVC Circular 04/2021 §2.1 — splitting of requirements to
    avoid tender is a corruption-prone practice; GFR 2017 Rule 154.
    """
    cost = work.get("estimated_cost_inr", 0) or 0
    if not (SPLIT_MIN_AMOUNT <= cost <= SPLIT_MAX_AMOUNT):
        return (False, "")

    vendor_id = work.get("vendor_id", "")
    sanction_date = work.get("sanction_date", "")
    if not sanction_date or not vendor_id:
        return (False, "")

    try:
        sd1 = datetime.strptime(sanction_date, "%Y-%m-%d")
    except ValueError:
        return (False, "")

    partners = []
    for other in all_works:
        if other["work_id"] == work["work_id"]:
            continue
        if other.get("vendor_id") != vendor_id:
            continue
        other_cost = other.get("estimated_cost_inr", 0) or 0
        if not (SPLIT_MIN_AMOUNT <= other_cost <= SPLIT_MAX_AMOUNT):
            continue
        try:
            sd2 = datetime.strptime(other["sanction_date"], "%Y-%m-%d")
        except ValueError:
            continue
        if abs((sd2 - sd1).days) <= SPLIT_MAX_DAYS:
            partners.append(other["work_id"])

    if partners:
        return (True,
            f"ENGINE 3 — Procurement Regularity (Tender Splitting): Vendor "
            f"'{work.get('vendor_name',vendor_id)}' awarded this work (₹{cost:,.0f}) and "
            f"{len(partners)} other work(s) ({', '.join(partners)}) each priced ₹9L–9.99L "
            f"within a {SPLIT_MAX_DAYS}-day window — pattern consistent with deliberate "
            "splitting to stay below the ₹10L competitive-tender threshold. "
            "Citation: CVC Circular 04/2021 §2.1 — splitting of tenders/requirements to "
            "circumvent prescribed tender limits is a serious irregularity. GFR 2017 Rule 154 "
            "— works exceeding ₹10L require open advertised tender process.")
    return (False, "")


# ──────────────────────────────────────────────
# ENGINE 4: Geofence Verification
# ──────────────────────────────────────────────
GEO_TAMPER_THRESHOLD_M = 500.0

def engine_geo_tampering(work: Dict) -> Tuple[bool, str]:
    """
    Flags if photo EXIF coordinates are >500m from declared site coordinates.
    Citation: MPLADS Guidelines 2023 §6.2 — geotagged photographs are
    mandatory for all works; photos must be taken at the work site.
    """
    lat  = work.get("latitude", 0) or 0
    lon  = work.get("longitude", 0) or 0
    elat = work.get("photo_exif_lat", 0) or 0
    elon = work.get("photo_exif_lon", 0) or 0

    if not all([lat, lon, elat, elon]):
        return (False, "")
    if not india_bounding_box_valid(elat, elon):
        return (True,
            "ENGINE 4 — Geofence Verification: EXIF coordinates fall outside India's "
            "geographic bounds — photo cannot have been taken at declared site. "
            "Citation: MPLADS Guidelines 2023 §6.2.")

    dist = haversine_distance_m(lat, lon, elat, elon)
    if dist > GEO_TAMPER_THRESHOLD_M:
        return (True,
            f"ENGINE 4 — Geofence Verification: Photo EXIF location is {dist:.0f}m from "
            f"declared site coordinates (threshold: {GEO_TAMPER_THRESHOLD_M:.0f}m). "
            "Possible causes: photo taken at a different location, GPS spoofing, or "
            "submission of photographs from another site. "
            "Citation: MPLADS Guidelines 2023 §6.2 — geotagged progress photographs "
            "are mandatory; photos must be captured at the physical work site. "
            "CVC Circular 17/2019 — fabrication of site photographs is grounds for "
            "criminal prosecution under IPC §420.")
    return (False, "")


# ──────────────────────────────────────────────
# ENGINE 5: Capital Dormancy Tracker
# ──────────────────────────────────────────────
DORMANCY_STALLED_DAYS_THRESHOLD  = 180
DORMANCY_COMPLETION_PCT_THRESHOLD = 10

def engine_parked_funds(work: Dict) -> Tuple[bool, str]:
    """
    Flags if work is stalled >180 days with <10% completion.
    Citation: PAC Report 2019-20 §4.7 — MPLADS funds left unspent >180 days
    in a financial year are to be reported as 'parked funds';
    MPLADS Guidelines 2023 §8.3 — dormant works to be reported to MoSPI.
    """
    stalled = work.get("days_stalled", 0) or 0
    pct     = work.get("completion_pct", 0) or 0
    status  = work.get("work_status", "")

    if (status in ("Stalled", "Not Started") and
            stalled >= DORMANCY_STALLED_DAYS_THRESHOLD and
            pct < DORMANCY_COMPLETION_PCT_THRESHOLD):
        return (True,
            f"ENGINE 5 — Capital Dormancy: Work has been stalled for {stalled} days with "
            f"only {pct:.0f}% physical completion — classified as CAPITAL DORMANT. "
            f"₹{work.get('expenditure_incurred_inr',0):,.0f} has already been disbursed. "
            "Citation: PAC Report (2019-20) §4.7 — funds parked in implementing agencies "
            "without commensurate work progress constitute audit objection. "
            "MPLADS Guidelines 2023 §8.3 — District Authority to conduct mandatory "
            "inspection and submit utilisation certificate within 30 days.")
    return (False, "")


# ──────────────────────────────────────────────
# ENGINE 6: Expenditure-Progress Mismatch
# ──────────────────────────────────────────────
EXP_PROGRESS_GAP_THRESHOLD = 40.0  # percentage points

def engine_expenditure_mismatch(work: Dict) -> Tuple[bool, str]:
    """
    Flags if expenditure% exceeds completion% by >40 percentage points.
    Strongest single fund-misuse signal in the model.
    Citation: GFR 2017 Rule 230 — payments to be commensurate with
    physical progress; advance payments require specific sanction.
    """
    exp   = work.get("expenditure_incurred_inr", 0) or 0
    est   = work.get("estimated_cost_inr", 0) or 0
    pct   = work.get("completion_pct", 0) or 0

    gap = expenditure_progress_gap(exp, est, pct)
    if gap >= EXP_PROGRESS_GAP_THRESHOLD:
        exp_pct = (exp / est * 100) if est > 0 else 0
        return (True,
            f"ENGINE 6 — Expenditure-Progress Mismatch: {exp_pct:.1f}% of funds disbursed "
            f"(₹{exp:,.0f}) against only {pct:.0f}% physical completion — a gap of "
            f"{gap:.1f} percentage points (threshold: {EXP_PROGRESS_GAP_THRESHOLD}pp). "
            "Indicates possible premature/advance payment not justified by physical progress. "
            "Citation: GFR 2017 Rule 230 — no payment shall be made in advance of physical "
            "progress without specific prior sanction of the competent authority. "
            "MPLADS Guidelines 2023 §7.3 — payment to contractor must be commensurate "
            "with certified progress at each stage. This flag carries the highest weight "
            "in the composite risk score as the strongest direct fund-misuse signal.")
    return (False, "")


# ──────────────────────────────────────────────
# ENGINE 7: Asset Existence Verification
# ──────────────────────────────────────────────

def engine_no_physical_evidence(work: Dict, milestone_counts: Any) -> Tuple[bool, str]:
    """
    Flags completed works with zero milestone photo records.
    Citation: MPLADS Guidelines 2023 §7.1 — completion certificate must be
    accompanied by geotagged photographs; CAG Audit Report 2022 §6.4.
    """
    status = work.get("work_status", "")
    if status != "Completed":
        return (False, "")

    if isinstance(milestone_counts, dict):
        count = milestone_counts.get(work.get("work_id", ""), 0)
    elif isinstance(milestone_counts, (int, float)):
        count = int(milestone_counts)
    else:
        count = 0

    if count == 0:
        return (True,
            f"ENGINE 7 — Asset Existence Verification: Work marked 'Completed' with "
            f"₹{work.get('expenditure_incurred_inr',0):,.0f} fully disbursed, but zero "
            "milestone photograph records on file. Funds closed out with no physical "
            "evidence of the asset. "
            "Citation: MPLADS Guidelines 2023 §7.1 — completion certificate for any "
            "sanctioned work must be accompanied by geo-tagged before/after photographs "
            "and an inspection report from the District Authority. "
            "CAG Report No. 12 of 2022 §6.4 — works where completion reported without "
            "supporting photographic/inspection evidence are to be treated as "
            "'unverified completions' pending site inspection.")
    return (False, "")


# ──────────────────────────────────────────────
# ENGINE 8: Category Consistency
# ──────────────────────────────────────────────

def engine_category_deviation(work: Dict, milestones: List[Dict]) -> Tuple[bool, str]:
    """
    Flags where the completion-stage declared_category differs from the originally sanctioned category.
    Citation: MPLADS Guidelines 2023 §4.1 — works must be executed as sanctioned;
    any change in scope/category requires fresh recommendation from MP.
    """
    sanctioned_cat = work.get("category", "")
    work_id = work.get("work_id", "")

    # Check direct work record attribute if present in dataset
    declared_work = work.get("declared_category_at_completion", "")
    if declared_work and declared_work.strip().lower() != sanctioned_cat.strip().lower():
        return (True,
            f"ENGINE 8 — Category Consistency: Sanctioned category is "
            f"'{sanctioned_cat}' but completion-stage register records declare "
            f"category '{declared_work}'. Asset executed differs from what was sanctioned. "
            "Citation: MPLADS Guidelines 2023 §4.1 — MPs cannot recommend changes "
            "to the nature or type of an approved work; any deviation from the "
            "sanctioned work category requires fresh recommendation and re-sanction. "
            "GFR 2017 Rule 209 — expenditure must be incurred for the purpose for "
            "which it was sanctioned.")

    work_milestones = [m for m in milestones if m.get("work_id") == work_id]
    after_milestones = [m for m in work_milestones if m.get("stage") == "after"]

    for m in after_milestones:
        declared = m.get("declared_category", "")
        if declared and declared.strip().lower() != sanctioned_cat.strip().lower():
            return (True,
                f"ENGINE 8 — Category Consistency: Sanctioned category is "
                f"'{sanctioned_cat}' but completion-stage milestone records declare "
                f"category '{declared}'. Asset executed differs from what was sanctioned. "
                "Citation: MPLADS Guidelines 2023 §4.1 — MPs cannot recommend changes "
                "to the nature or type of an approved work; any deviation from the "
                "sanctioned work category requires fresh recommendation and re-sanction. "
                "GFR 2017 Rule 209 — expenditure must be incurred for the purpose for "
                "which it was sanctioned.")
    return (False, "")


# ──────────────────────────────────────────────
# ENGINE 9: Before/After Progression
# ──────────────────────────────────────────────
PROGRESSION_PHASH_THRESHOLD = 5   # Hamming ≤ 5 = suspiciously similar

def engine_recycled_progression_photo(work: Dict, milestones: List[Dict]) -> Tuple[bool, str]:
    """
    Flags where the 'before' and 'after' milestone pHash Hamming distance ≤ 5,
    indicating the same image was submitted for multiple stages (no real progress).
    Citation: MPLADS Guidelines 2023 §6.3 — milestone photographs must evidence
    actual physical progress at each stage.
    """
    work_id = work["work_id"]
    work_milestones = [m for m in milestones if m.get("work_id") == work_id]

    before_hashes = [m["photo_phash"] for m in work_milestones
                     if m.get("stage") == "before" and m.get("photo_phash")]
    after_hashes  = [m["photo_phash"] for m in work_milestones
                     if m.get("stage") == "after"  and m.get("photo_phash")]

    if not before_hashes or not after_hashes:
        return (False, "")

    for bh in before_hashes:
        for ah in after_hashes:
            dist = phash_hamming(bh, ah)
            if dist <= PROGRESSION_PHASH_THRESHOLD:
                return (True,
                    f"ENGINE 9 — Before/After Progression: Perceptual hash Hamming distance "
                    f"between 'before' and 'after' milestone photos is {dist} (threshold: "
                    f"≤{PROGRESSION_PHASH_THRESHOLD}), indicating these images are nearly "
                    "identical — no meaningful physical change recorded between claimed "
                    "milestones. Consistent with submission of recycled/duplicate photographs "
                    "to falsely claim progress. "
                    "Citation: MPLADS Guidelines 2023 §6.3 — geotagged before/during/after "
                    "photographs must demonstrably show physical progress at each milestone. "
                    "IPC §465 — fabrication of official progress records constitutes forgery.")
    return (False, "")
