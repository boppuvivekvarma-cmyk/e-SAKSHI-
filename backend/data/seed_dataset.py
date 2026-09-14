"""
e-SAKSHI 2.0 Sentinel — Synthetic Dataset Generator
Generates mplads_seed.csv with ~500 works + milestone photos,
seeded anomaly cases for all 9 rule engines, vendor master,
and anomaly_label ground truth for validation.
"""

import random
import math
import hashlib
import csv
import os
from datetime import datetime, timedelta

random.seed(42)

# ──────────────────────────────────────────────
# MASTER REFERENCE DATA
# ──────────────────────────────────────────────

STATES = {
    # Northern
    "Delhi":            {"districts": ["New Delhi", "North Delhi", "South Delhi", "West Delhi"], "lat_range": (28.4, 28.9), "lon_range": (76.8, 77.4)},
    "Himachal Pradesh": {"districts": ["Shimla", "Kangra", "Mandi", "Kullu", "Solan"],           "lat_range": (30.3, 33.3), "lon_range": (75.7, 79.1)},
    "Jammu and Kashmir":{"districts": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],            "lat_range": (32.2, 35.8), "lon_range": (73.7, 77.5)},
    "Punjab":           {"districts": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"],          "lat_range": (29.5, 32.5), "lon_range": (73.8, 76.9)},
    "Rajasthan":        {"districts": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],         "lat_range": (23.0, 30.2), "lon_range": (69.5, 78.3)},
    # Southern
    "Karnataka":        {"districts": ["Bengaluru Urban", "Mysuru", "Mangaluru", "Hubballi"],    "lat_range": (11.5, 18.5), "lon_range": (74.0, 78.6)},
    "Kerala":           {"districts": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],  "lat_range": (8.3, 12.8),  "lon_range": (74.8, 77.4)},
    "Tamil Nadu":       {"districts": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],    "lat_range": (8.1, 13.5),  "lon_range": (76.2, 80.4)},
    "Telangana":        {"districts": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],      "lat_range": (15.8, 19.9), "lon_range": (77.2, 81.8)},
    # Western
    "Gujarat":          {"districts": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Kutch"],     "lat_range": (20.1, 24.7), "lon_range": (68.1, 74.5)},
    "Maharashtra":      {"districts": ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad"],       "lat_range": (15.6, 21.0), "lon_range": (72.6, 80.9)},
    # Eastern
    "Bihar":            {"districts": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],             "lat_range": (24.3, 27.5), "lon_range": (83.3, 88.3)},
    "Odisha":           {"districts": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],             "lat_range": (17.8, 22.6), "lon_range": (81.4, 87.5)},
    "West Bengal":      {"districts": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Darjeeling"],"lat_range": (21.5, 27.2), "lon_range": (85.8, 89.9)},
    # Central
    "Madhya Pradesh":   {"districts": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],               "lat_range": (21.3, 26.9), "lon_range": (74.0, 82.8)},
    "Uttar Pradesh":    {"districts": ["Lucknow", "Varanasi", "Agra", "Kanpur", "Prayagraj"],     "lat_range": (23.9, 30.4), "lon_range": (77.1, 84.7)},
    "Uttarakhand":      {"districts": ["Dehradun", "Haridwar", "Nainital", "Rishikesh"],          "lat_range": (28.7, 31.4), "lon_range": (77.6, 81.1)},
    # North-Eastern
    "Assam":            {"districts": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat"],            "lat_range": (24.1, 28.0), "lon_range": (89.7, 96.0)},
    "Arunachal Pradesh":{"districts": ["Itanagar", "Tawang", "Pasighat", "Ziro"],                "lat_range": (26.6, 29.5), "lon_range": (91.5, 97.4)},
    "Sikkim":           {"districts": ["Gangtok", "Namchi", "Gyalshing"],                         "lat_range": (27.1, 28.1), "lon_range": (88.1, 88.9)},
}

MPs = [
    ("MP001", "Arjun Sharma",       "Maharashtra",       "Pune North",       "LS"),
    ("MP002", "Priya Nair",         "Tamil Nadu",        "Chennai Central",   "LS"),
    ("MP003", "Rajesh Gupta",       "Uttar Pradesh",      "Varanasi East",    "LS"),
    ("MP004", "Sunita Devi",        "Rajasthan",         "Jaipur Rural",      "LS"),
    ("MP005", "Deepak Chatterjee",  "West Bengal",       "Kolkata South",     "LS"),
    ("MP006", "Meena Kulkarni",     "Maharashtra",       "Nashik",            "LS"),
    ("MP007", "Vinod Tiwari",       "Uttar Pradesh",      "Lucknow West",     "LS"),
    ("MP008", "Anita Roy",          "West Bengal",       "Howrah",            "LS"),
    ("MP009", "Suresh Pillai",      "Tamil Nadu",        "Coimbatore North",  "LS"),
    ("MP010", "Kavita Joshi",       "Rajasthan",         "Jodhpur",           "LS"),
    ("MP011", "Rameshwar Patel",    "Gujarat",           "Ahmedabad East",    "LS"),
    ("MP012", "Anand Swaminathan",  "Karnataka",         "Bengaluru South",   "LS"),
    ("MP013", "Bikash Barua",       "Assam",             "Guwahati",          "LS"),
    ("MP014", "Col. Tenzing Norbu", "Arunachal Pradesh", "Arunachal West",    "LS"),
    ("MP015", "Dr. Sanjeev Kumar",  "Bihar",             "Patna Sahib",       "LS"),
    ("MP016", "Rohit Verma",        "Himachal Pradesh",  "Shimla",            "LS"),
    ("MP017", "G. Krishna Reddy",   "Telangana",         "Secunderabad",      "LS"),
    ("MP018", "Soumya Das",         "Odisha",            "Bhubaneswar",       "LS"),
    ("MP019", "Harpreet Singh",     "Punjab",            "Amritsar",          "LS"),
    ("MP020", "Vikramaditya Rawat", "Uttarakhand",       "Garhwal",           "LS"),
]

CATEGORIES = [
    "Road Construction", "Road Construction", "Road Construction",
    "Bridge Construction", "Bridge Construction",
    "School Building", "School Building",
    "Water Supply", "Water Supply",
    "Health Centre", "Health Centre",
    "Community Hall",
    "Drainage Works", "Drainage Works",
    "Street Lighting",
    "Anganwadi Centre",
    "Boundary Wall",
    "Sports Facility",
    "Cremation Ground",
    "Library Building",
]

VENDORS = [
    ("V001", "Sunrise Constructions Pvt Ltd"),
    ("V002", "Bharat Infra Works"),
    ("V003", "National Build Corp"),
    ("V004", "Pioneer Projects Ltd"),
    ("V005", "Golden Gate Contractors"),
    ("V006", "Apex Construction Co"),
    ("V007", "Delta Infratech"),
    ("V008", "Metro Build Solutions"),
    ("V009", "Heritage Contractors"),
    ("V010", "Shree Ram Builders"),
    ("V011", "Anand Construction"),
    ("V012", "Bright Future Infra"),
    ("V013", "Durga Projects"),
    ("V014", "Kumar & Associates"),
    ("V015", "Reliable Constructions"),
    ("V016", "Star Infrastructure"),
    ("V017", "United Builders"),
    ("V018", "Prime Works Ltd"),
    ("V019", "City Developers"),
    ("V020", "Horizon Build Co"),
]

# V003, V007, V012 are "habitual bad actors" for vendor clustering

SOR_BENCHMARKS = {
    "Road Construction":    2800000,
    "Bridge Construction":  8500000,
    "School Building":      4200000,
    "Water Supply":         3100000,
    "Health Centre":        5600000,
    "Community Hall":       3800000,
    "Drainage Works":       1900000,
    "Street Lighting":      1200000,
    "Anganwadi Centre":     2200000,
    "Boundary Wall":         900000,
    "Sports Facility":      3500000,
    "Cremation Ground":     2100000,
    "Library Building":     4100000,
}

AGENCIES = [
    "District Panchayat",
    "Municipal Corporation",
    "PWD",
    "DRDA",
    "ZP",
    "Block Development Office",
]

STATUSES = ["Completed", "In Progress", "Not Started", "Stalled"]


# ──────────────────────────────────────────────
# UTILITY FUNCTIONS
# ──────────────────────────────────────────────

def rand_coord(state_name):
    s = STATES[state_name]
    lat = round(random.uniform(*s["lat_range"]), 6)
    lon = round(random.uniform(*s["lon_range"]), 6)
    return lat, lon

def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return 2*R*math.asin(math.sqrt(a))

def fake_phash():
    """64-bit hex perceptual hash (random)."""
    return format(random.getrandbits(64), '016x')

def similar_phash(base_hash, hamming_dist=0):
    """Return a pHash that differs from base by exactly hamming_dist bits."""
    n = int(base_hash, 16)
    bits = list(format(n, '064b'))
    positions = random.sample(range(64), hamming_dist)
    for p in positions:
        bits[p] = '1' if bits[p] == '0' else '0'
    return format(int(''.join(bits), 2), '016x')

def rand_date(start_year=2020, end_year=2024):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days))

def small_offset_coord(lat, lon, max_m=100):
    """Slight random offset within max_m metres (compliant photo geo)."""
    dlat = random.uniform(-max_m/111320, max_m/111320)
    dlon = random.uniform(-max_m/(111320*math.cos(math.radians(lat))), max_m/(111320*math.cos(math.radians(lat))))
    return round(lat+dlat, 6), round(lon+dlon, 6)

def large_offset_coord(lat, lon, min_m=600, max_m=5000):
    """Large random offset (tampered/geofence-fail photo)."""
    dist = random.uniform(min_m, max_m)
    bearing = random.uniform(0, 2*math.pi)
    dlat = (dist * math.cos(bearing)) / 111320
    dlon = (dist * math.sin(bearing)) / (111320 * math.cos(math.radians(lat)))
    return round(lat+dlat, 6), round(lon+dlon, 6)


# ──────────────────────────────────────────────
# GENERATE BASE WORKS
# ──────────────────────────────────────────────

def make_work_id(i):
    return f"WRK{i:05d}"

def generate_normal_work(work_idx, mp_tuple, state_name, district):
    mp_id, mp_name, _, constituency, house = mp_tuple
    category = random.choice(CATEGORIES)
    sor = SOR_BENCHMARKS.get(category, 2500000)
    ratio = random.uniform(0.85, 1.25)       # normal cost ratio
    est_cost = round(sor * ratio, 2)
    
    sanction_date = rand_date(2021, 2023)
    rec_date = sanction_date - timedelta(days=random.randint(10, 60))
    
    status = random.choices(STATUSES, weights=[30, 45, 10, 15])[0]
    if status == "Completed":
        completion_pct = 100
        days_stalled = 0
        expenditure = round(est_cost * random.uniform(0.90, 1.05), 2)
    elif status == "In Progress":
        completion_pct = random.randint(20, 85)
        days_stalled = random.randint(0, 30)
        expenditure = round(est_cost * (completion_pct/100) * random.uniform(0.85, 1.10), 2)
    elif status == "Not Started":
        completion_pct = 0
        days_stalled = 0
        expenditure = 0
    else:  # Stalled
        completion_pct = random.randint(5, 40)
        days_stalled = random.randint(30, 120)
        expenditure = round(est_cost * (completion_pct/100) * random.uniform(0.85, 1.10), 2)

    lat, lon = rand_coord(state_name)
    vendor_id, vendor_name = random.choice(VENDORS)
    agency = random.choice(AGENCIES)
    phash = fake_phash()
    exif_lat, exif_lon = small_offset_coord(lat, lon, max_m=80)

    return {
        "work_id": make_work_id(work_idx),
        "state": state_name,
        "district": district,
        "constituency": constituency,
        "house": house,
        "mp_id": mp_id,
        "mp_name": mp_name,
        "work_title": f"{category} at {district} Ward {random.randint(1,30)}",
        "category": category,
        "implementing_agency": agency,
        "vendor_id": vendor_id,
        "vendor_name": vendor_name,
        "recommendation_date": rec_date.strftime("%Y-%m-%d"),
        "sanction_date": sanction_date.strftime("%Y-%m-%d"),
        "estimated_cost_inr": est_cost,
        "sor_benchmark_cost_inr": sor,
        "expenditure_incurred_inr": expenditure,
        "completion_pct": completion_pct,
        "days_stalled": days_stalled,
        "work_status": status,
        "latitude": lat,
        "longitude": lon,
        "photo_phash": phash,
        "photo_exif_lat": exif_lat,
        "photo_exif_lon": exif_lon,
        "anomaly_label": "NORMAL",
    }


# ──────────────────────────────────────────────
# ANOMALY INJECTORS (one per rule engine)
# ──────────────────────────────────────────────

def inject_duplicate(base_work, dup_idx):
    """Engine 1: Spatial-Semantic Duplicate — same location, same title."""
    w = dict(base_work)
    w["work_id"] = make_work_id(dup_idx)
    # Move within 150m
    dlat = random.uniform(-0.0005, 0.0005)
    dlon = random.uniform(-0.0005, 0.0005)
    w["latitude"] = round(base_work["latitude"] + dlat, 6)
    w["longitude"] = round(base_work["longitude"] + dlon, 6)
    # Slightly reworded title
    w["work_title"] = base_work["work_title"].replace("at", "near").replace("Ward", "Block")
    w["sanction_date"] = (datetime.strptime(base_work["sanction_date"], "%Y-%m-%d")
                          + timedelta(days=random.randint(5, 60))).strftime("%Y-%m-%d")
    w["recommendation_date"] = w["sanction_date"]
    w["anomaly_label"] = "DUPLICATE_WORK"
    return w

def inject_cost_inflation(base_work, idx):
    """Engine 2: Forensic Rate — cost > 1.30× SoR."""
    w = dict(base_work)
    w["work_id"] = make_work_id(idx)
    inflation = random.uniform(1.35, 1.80)
    w["estimated_cost_inr"] = round(base_work["sor_benchmark_cost_inr"] * inflation, 2)
    w["anomaly_label"] = "COST_INFLATED"
    return w

def inject_tender_splitting(base_vendor_id, base_vendor_name, mp_tuple, state, district, idx_start):
    """Engine 3: Tender splitting — 2 works same vendor priced ₹9–9.99L within 14 days."""
    works = []
    mp_id, mp_name, _, constituency, house = mp_tuple
    anchor_date = rand_date(2021, 2023)
    for i, delta_days in enumerate([0, random.randint(2, 14)]):
        sd = anchor_date + timedelta(days=delta_days)
        works.append({
            "work_id": make_work_id(idx_start + i),
            "state": state, "district": district, "constituency": constituency,
            "house": house, "mp_id": mp_id, "mp_name": mp_name,
            "work_title": f"Boundary Wall at {district} Zone {random.randint(1,10)}",
            "category": "Boundary Wall",
            "implementing_agency": random.choice(AGENCIES),
            "vendor_id": base_vendor_id, "vendor_name": base_vendor_name,
            "recommendation_date": sd.strftime("%Y-%m-%d"),
            "sanction_date": sd.strftime("%Y-%m-%d"),
            "estimated_cost_inr": round(random.uniform(900000, 999000), 2),
            "sor_benchmark_cost_inr": SOR_BENCHMARKS["Boundary Wall"],
            "expenditure_incurred_inr": round(random.uniform(800000, 950000), 2),
            "completion_pct": random.randint(60, 100),
            "days_stalled": 0,
            "work_status": "Completed",
            "latitude": round(random.uniform(15.6, 21.0), 6),
            "longitude": round(random.uniform(72.6, 80.9), 6),
            "photo_phash": fake_phash(),
            "photo_exif_lat": 0, "photo_exif_lon": 0,
            "anomaly_label": "TENDER_SPLITTING",
        })
    return works

def inject_geofence(base_work, idx):
    """Engine 4: Geofence — EXIF coords far from site."""
    w = dict(base_work)
    w["work_id"] = make_work_id(idx)
    w["photo_exif_lat"], w["photo_exif_lon"] = large_offset_coord(base_work["latitude"], base_work["longitude"])
    w["anomaly_label"] = "GEO_TAMPERING"
    return w

def inject_dormant(base_work, idx):
    """Engine 5: Capital Dormancy — stalled >180 days, <10% complete."""
    w = dict(base_work)
    w["work_id"] = make_work_id(idx)
    w["work_status"] = "Stalled"
    w["days_stalled"] = random.randint(185, 500)
    w["completion_pct"] = random.randint(0, 9)
    w["expenditure_incurred_inr"] = round(w["estimated_cost_inr"] * (w["completion_pct"]/100), 2)
    w["anomaly_label"] = "CAPITAL_DORMANT"
    return w

def inject_expenditure_mismatch(base_work, idx):
    """Engine 6: Expenditure-Progress Mismatch — high spend, low completion."""
    w = dict(base_work)
    w["work_id"] = make_work_id(idx)
    w["work_status"] = "In Progress"
    w["completion_pct"] = random.randint(5, 25)     # low completion
    # but high expenditure
    w["expenditure_incurred_inr"] = round(w["estimated_cost_inr"] * random.uniform(0.72, 0.92), 2)
    w["days_stalled"] = random.randint(0, 60)
    w["anomaly_label"] = "EXPENDITURE_MISMATCH"
    return w

def inject_no_evidence(base_work, idx):
    """Engine 7: Asset Existence — Completed with no photo records."""
    w = dict(base_work)
    w["work_id"] = make_work_id(idx)
    w["work_status"] = "Completed"
    w["completion_pct"] = 100
    w["photo_phash"] = ""          # empty = no milestone photo
    w["photo_exif_lat"] = 0
    w["photo_exif_lon"] = 0
    w["anomaly_label"] = "NO_PHYSICAL_EVIDENCE"
    return w

def inject_category_deviation(base_work, idx):
    """Engine 8: Category Consistency — milestone declared different category."""
    w = dict(base_work)
    w["work_id"] = make_work_id(idx)
    # milestone will have a different category — stored in milestones table
    w["anomaly_label"] = "CATEGORY_DEVIATION"
    w["work_status"] = "Completed"
    w["completion_pct"] = 100
    return w

def inject_recycled_photo(base_work, idx):
    """Engine 9: Before/After Progression — before and after pHash identical."""
    w = dict(base_work)
    w["work_id"] = make_work_id(idx)
    w["work_status"] = "Completed"
    w["completion_pct"] = 100
    w["anomaly_label"] = "RECYCLED_PROGRESSION_PHOTO"
    return w


# ──────────────────────────────────────────────
# MILESTONE PHOTOS TABLE
# ──────────────────────────────────────────────

def generate_milestones(works):
    """
    Returns list of milestone photo records.
    Normal/compliant completed works get before+during+after with distinct pHashes.
    Anomaly types 7, 8, 9 get special records.
    """
    milestones = []
    mid = 1
    for w in works:
        wid = w["work_id"]
        label = w["anomaly_label"]
        lat, lon = w["latitude"], w["longitude"]

        if label == "NO_PHYSICAL_EVIDENCE":
            # No milestone records at all
            continue

        if label == "RECYCLED_PROGRESSION_PHOTO":
            # before and after same pHash
            base = fake_phash()
            for stage, dt_offset in [("before", 0), ("after", 90)]:
                cap = (datetime.strptime(w["sanction_date"], "%Y-%m-%d")
                       + timedelta(days=dt_offset)).strftime("%Y-%m-%d")
                elat, elon = small_offset_coord(lat, lon, 50)
                milestones.append({
                    "milestone_id": f"MS{mid:06d}", "work_id": wid, "stage": stage,
                    "captured_at": cap, "photo_phash": base,
                    "photo_exif_lat": elat, "photo_exif_lon": elon,
                    "declared_category": w["category"],
                })
                mid += 1
            continue

        if label == "CATEGORY_DEVIATION":
            # After stage declares a different category
            other_cats = [c for c in SOR_BENCHMARKS if c != w["category"]]
            deviated_cat = random.choice(other_cats)
            for stage, dt_offset, cat in [("before", 0, w["category"]),
                                            ("during", 45, w["category"]),
                                            ("after", 120, deviated_cat)]:
                cap = (datetime.strptime(w["sanction_date"], "%Y-%m-%d")
                       + timedelta(days=dt_offset)).strftime("%Y-%m-%d")
                ph = fake_phash()
                elat, elon = small_offset_coord(lat, lon, 80)
                milestones.append({
                    "milestone_id": f"MS{mid:06d}", "work_id": wid, "stage": stage,
                    "captured_at": cap, "photo_phash": ph,
                    "photo_exif_lat": elat, "photo_exif_lon": elon,
                    "declared_category": cat,
                })
                mid += 1
            continue

        # Normal / other anomaly types: proper milestone sequence
        if w["work_status"] == "Completed":
            stages = [("before", 0), ("during", 45), ("after", 120)]
        elif w["work_status"] == "In Progress":
            stages = [("before", 0), ("during", random.randint(20, 60))]
        else:
            stages = [("before", 0)]

        base_hash = w.get("photo_phash") or fake_phash()
        for i, (stage, dt_offset) in enumerate(stages):
            cap = (datetime.strptime(w["sanction_date"], "%Y-%m-%d")
                   + timedelta(days=dt_offset)).strftime("%Y-%m-%d")
            # each stage has a unique pHash (real progress)
            ph = base_hash if i == 0 else fake_phash()
            if label == "GEO_TAMPERING" and stage == "after":
                elat, elon = w["photo_exif_lat"], w["photo_exif_lon"]
            else:
                elat, elon = small_offset_coord(lat, lon, 80)
            milestones.append({
                "milestone_id": f"MS{mid:06d}", "work_id": wid, "stage": stage,
                "captured_at": cap, "photo_phash": ph,
                "photo_exif_lat": elat, "photo_exif_lon": elon,
                "declared_category": w["category"],
            })
            mid += 1
    return milestones


# ──────────────────────────────────────────────
# MAIN GENERATOR
# ──────────────────────────────────────────────

def generate_dataset(n_normal=420):
    works = []
    idx = 1

    # ── Normal works ──────────────────────────
    for _ in range(n_normal):
        mp = random.choice(MPs)
        state = mp[2]
        district = random.choice(STATES[state]["districts"])
        w = generate_normal_work(idx, mp, state, district)
        works.append(w)
        idx += 1

    # ── Anomaly injections ────────────────────
    # Engine 1: 10 duplicate pairs
    base_dupes = random.sample([w for w in works if w["work_status"] == "Completed"], 10)
    for bw in base_dupes:
        works.append(inject_duplicate(bw, idx)); idx += 1

    # Engine 2: 8 cost-inflated works
    base_inflated = random.sample(works[:50], 8)
    for bw in base_inflated:
        works.append(inject_cost_inflation(bw, idx)); idx += 1

    # Engine 3: 3 tender-splitting clusters (6 works)
    bad_vendors = [("V003", "National Build Corp"), ("V007", "Delta Infratech"), ("V012", "Bright Future Infra")]
    for vv in bad_vendors:
        mp = random.choice(MPs)
        state = mp[2]
        district = random.choice(STATES[state]["districts"])
        split_works = inject_tender_splitting(vv[0], vv[1], mp, state, district, idx)
        works.extend(split_works); idx += len(split_works)

    # Engine 4: 8 geofence violations
    for bw in random.sample(works[:100], 8):
        works.append(inject_geofence(bw, idx)); idx += 1

    # Engine 5: 10 dormant works
    for bw in random.sample(works[:150], 10):
        works.append(inject_dormant(bw, idx)); idx += 1

    # Engine 6: 8 expenditure-progress mismatches
    for bw in random.sample(works[:200], 8):
        works.append(inject_expenditure_mismatch(bw, idx)); idx += 1

    # Engine 7: 8 no-physical-evidence (completed, no photos)
    for bw in random.sample(works[:250], 8):
        works.append(inject_no_evidence(bw, idx)); idx += 1

    # Engine 8: 6 category deviation
    for bw in random.sample(works[:300], 6):
        works.append(inject_category_deviation(bw, idx)); idx += 1

    # Engine 9: 6 recycled progression photos
    for bw in random.sample(works[:350], 6):
        works.append(inject_recycled_photo(bw, idx)); idx += 1

    # ── Generate milestones ───────────────────
    milestones = generate_milestones(works)

    return works, milestones


def write_csv(works, milestones, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    works_path = os.path.join(out_dir, "mplads_seed.csv")
    milestones_path = os.path.join(out_dir, "milestones_seed.csv")

    if works:
        with open(works_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(works[0].keys()))
            writer.writeheader()
            writer.writerows(works)
        print(f"[OK] Written {len(works)} works -> {works_path}")

    if milestones:
        with open(milestones_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(milestones[0].keys()))
            writer.writeheader()
            writer.writerows(milestones)
        print(f"[OK] Written {len(milestones)} milestones -> {milestones_path}")


if __name__ == "__main__":
    print("Generating e-SAKSHI 2.0 Sentinel seed dataset...")
    works, milestones = generate_dataset(n_normal=420)
    anomaly_counts = {}
    for w in works:
        anomaly_counts[w["anomaly_label"]] = anomaly_counts.get(w["anomaly_label"], 0) + 1
    print(f"Total works: {len(works)}")
    for label, cnt in sorted(anomaly_counts.items()):
        print(f"  {label}: {cnt}")
    print(f"Total milestones: {len(milestones)}")

    out_dir = os.path.join(os.path.dirname(__file__))
    write_csv(works, milestones, out_dir)
    print("Done.")
