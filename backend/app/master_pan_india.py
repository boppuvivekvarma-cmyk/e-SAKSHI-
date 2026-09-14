"""
Master Pan-India Reference Directory (MoSPI Standard)
Covers all 28 States and 8 Union Territories (36 total).
Includes:
- Official Census/MoSPI state codes
- Hindi Devanagari titles
- Administrative Planning Zones (Northern, Southern, Eastern, Western, Central, North-Eastern)
- Terrain & Remoteness Cost Multipliers (reflecting authentic CPWD/PWD hill/island SOR allowances)
- Geographic bounding boxes (lat/lon ranges)
- Major constituent districts
"""

from typing import Dict, List, Optional

PAN_INDIA_STATES: Dict[str, Dict] = {
    # ── NORTHERN ZONE ──
    "Delhi": {
        "code": "DL", "hindi": "दिल्ली", "zone": "Northern", "terrain_multiplier": 1.05,
        "lat_range": (28.4, 28.9), "lon_range": (76.8, 77.4),
        "districts": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"]
    },
    "Haryana": {
        "code": "HR", "hindi": "हरियाणा", "zone": "Northern", "terrain_multiplier": 1.0,
        "lat_range": (27.6, 30.9), "lon_range": (74.4, 77.6),
        "districts": ["Gurugram", "Faridabad", "Ambala", "Karnal", "Hisar", "Rohtak"]
    },
    "Himachal Pradesh": {
        "code": "HP", "hindi": "हिमाचल प्रदेश", "zone": "Northern", "terrain_multiplier": 1.35,
        "lat_range": (30.3, 33.3), "lon_range": (75.7, 79.1),
        "districts": ["Shimla", "Kangra", "Mandi", "Kullu", "Solan", "Dharamshala"]
    },
    "Jammu and Kashmir": {
        "code": "JK", "hindi": "जम्मू और कश्मीर", "zone": "Northern", "terrain_multiplier": 1.40,
        "lat_range": (32.2, 35.8), "lon_range": (73.7, 77.5),
        "districts": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"]
    },
    "Ladakh": {
        "code": "LA", "hindi": "लद्दाख", "zone": "Northern", "terrain_multiplier": 1.50,
        "lat_range": (32.0, 36.5), "lon_range": (75.5, 80.5),
        "districts": ["Leh", "Kargil"]
    },
    "Punjab": {
        "code": "PB", "hindi": "पंजाब", "zone": "Northern", "terrain_multiplier": 1.0,
        "lat_range": (29.5, 32.5), "lon_range": (73.8, 76.9),
        "districts": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"]
    },
    "Rajasthan": {
        "code": "RJ", "hindi": "राजस्थान", "zone": "Northern", "terrain_multiplier": 1.10,
        "lat_range": (23.0, 30.2), "lon_range": (69.5, 78.3),
        "districts": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"]
    },
    "Chandigarh": {
        "code": "CH", "hindi": "चंडीगढ़", "zone": "Northern", "terrain_multiplier": 1.0,
        "lat_range": (30.6, 30.8), "lon_range": (76.7, 76.9),
        "districts": ["Chandigarh"]
    },

    # ── SOUTHERN ZONE ──
    "Andhra Pradesh": {
        "code": "AP", "hindi": "आंध्र प्रदेश", "zone": "Southern", "terrain_multiplier": 1.0,
        "lat_range": (12.6, 19.1), "lon_range": (76.7, 84.8),
        "districts": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kurnool"]
    },
    "Karnataka": {
        "code": "KA", "hindi": "कर्नाटक", "zone": "Southern", "terrain_multiplier": 1.05,
        "lat_range": (11.5, 18.5), "lon_range": (74.0, 78.6),
        "districts": ["Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi"]
    },
    "Kerala": {
        "code": "KL", "hindi": "केरल", "zone": "Southern", "terrain_multiplier": 1.15,
        "lat_range": (8.3, 12.8), "lon_range": (74.8, 77.4),
        "districts": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"]
    },
    "Tamil Nadu": {
        "code": "TN", "hindi": "तमिलनाडु", "zone": "Southern", "terrain_multiplier": 1.0,
        "lat_range": (8.1, 13.5), "lon_range": (76.2, 80.4),
        "districts": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"]
    },
    "Telangana": {
        "code": "TS", "hindi": "तेलंगाना", "zone": "Southern", "terrain_multiplier": 1.0,
        "lat_range": (15.8, 19.9), "lon_range": (77.2, 81.8),
        "districts": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"]
    },
    "Puducherry": {
        "code": "PY", "hindi": "पुदुचेरी", "zone": "Southern", "terrain_multiplier": 1.05,
        "lat_range": (11.8, 12.1), "lon_range": (79.7, 79.9),
        "districts": ["Puducherry", "Karaikal"]
    },
    "Lakshadweep": {
        "code": "LD", "hindi": "लक्षद्वीप", "zone": "Southern", "terrain_multiplier": 1.50,
        "lat_range": (8.0, 12.5), "lon_range": (71.0, 74.0),
        "districts": ["Kavaratti"]
    },

    # ── WESTERN ZONE ──
    "Goa": {
        "code": "GA", "hindi": "गोवा", "zone": "Western", "terrain_multiplier": 1.15,
        "lat_range": (14.9, 15.8), "lon_range": (73.6, 74.4),
        "districts": ["North Goa", "South Goa"]
    },
    "Gujarat": {
        "code": "GJ", "hindi": "गुजरात", "zone": "Western", "terrain_multiplier": 1.0,
        "lat_range": (20.1, 24.7), "lon_range": (68.1, 74.5),
        "districts": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Kutch"]
    },
    "Maharashtra": {
        "code": "MH", "hindi": "महाराष्ट्र", "zone": "Western", "terrain_multiplier": 1.05,
        "lat_range": (15.6, 22.0), "lon_range": (72.6, 80.9),
        "districts": ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Thane"]
    },
    "Dadra and Nagar Haveli and Daman and Diu": {
        "code": "DN", "hindi": "दादरा और नगर हवेली और दमन और दीव", "zone": "Western", "terrain_multiplier": 1.05,
        "lat_range": (20.0, 20.8), "lon_range": (72.8, 73.2),
        "districts": ["Daman", "Diu", "Silvassa"]
    },

    # ── EASTERN ZONE ──
    "Bihar": {
        "code": "BR", "hindi": "बिहार", "zone": "Eastern", "terrain_multiplier": 1.0,
        "lat_range": (24.3, 27.5), "lon_range": (83.3, 88.3),
        "districts": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"]
    },
    "Jharkhand": {
        "code": "JH", "hindi": "झारखंड", "zone": "Eastern", "terrain_multiplier": 1.10,
        "lat_range": (21.9, 25.3), "lon_range": (83.3, 87.9),
        "districts": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"]
    },
    "Odisha": {
        "code": "OD", "hindi": "ओडिशा", "zone": "Eastern", "terrain_multiplier": 1.05,
        "lat_range": (17.8, 22.6), "lon_range": (81.4, 87.5),
        "districts": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur"]
    },
    "West Bengal": {
        "code": "WB", "hindi": "पश्चिम बंगाल", "zone": "Eastern", "terrain_multiplier": 1.05,
        "lat_range": (21.5, 27.2), "lon_range": (85.8, 89.9),
        "districts": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Darjeeling"]
    },
    "Andaman and Nicobar Islands": {
        "code": "AN", "hindi": "अंडमान और निकोबार द्वीप समूह", "zone": "Eastern", "terrain_multiplier": 1.50,
        "lat_range": (6.5, 13.7), "lon_range": (92.2, 94.0),
        "districts": ["Port Blair", "Nicobar", "South Andaman"]
    },

    # ── CENTRAL ZONE ──
    "Chhattisgarh": {
        "code": "CG", "hindi": "छत्तीसगढ़", "zone": "Central", "terrain_multiplier": 1.10,
        "lat_range": (17.8, 24.1), "lon_range": (80.2, 84.4),
        "districts": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"]
    },
    "Madhya Pradesh": {
        "code": "MP", "hindi": "मध्य प्रदेश", "zone": "Central", "terrain_multiplier": 1.05,
        "lat_range": (21.3, 26.9), "lon_range": (74.0, 82.8),
        "districts": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"]
    },
    "Uttar Pradesh": {
        "code": "UP", "hindi": "उत्तर प्रदेश", "zone": "Central", "terrain_multiplier": 1.0,
        "lat_range": (23.9, 30.4), "lon_range": (77.1, 84.7),
        "districts": ["Lucknow", "Varanasi", "Agra", "Kanpur", "Prayagraj", "Noida", "Gorakhpur"]
    },
    "Uttarakhand": {
        "code": "UK", "hindi": "उत्तराखंड", "zone": "Central", "terrain_multiplier": 1.35,
        "lat_range": (28.7, 31.4), "lon_range": (77.6, 81.1),
        "districts": ["Dehradun", "Haridwar", "Nainital", "Rishikesh", "Almora"]
    },

    # ── NORTH-EASTERN ZONE ──
    "Arunachal Pradesh": {
        "code": "AR", "hindi": "अरुणाचल प्रदेश", "zone": "North-Eastern", "terrain_multiplier": 1.45,
        "lat_range": (26.6, 29.5), "lon_range": (91.5, 97.4),
        "districts": ["Itanagar", "Tawang", "Pasighat", "Ziro", "Naharlagun"]
    },
    "Assam": {
        "code": "AS", "hindi": "असम", "zone": "North-Eastern", "terrain_multiplier": 1.15,
        "lat_range": (24.1, 28.0), "lon_range": (89.7, 96.0),
        "districts": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"]
    },
    "Manipur": {
        "code": "MN", "hindi": "मणिपुर", "zone": "North-Eastern", "terrain_multiplier": 1.40,
        "lat_range": (23.8, 25.7), "lon_range": (93.0, 94.8),
        "districts": ["Imphal", "Churachandpur", "Thoubal"]
    },
    "Meghalaya": {
        "code": "ML", "hindi": "मेघालय", "zone": "North-Eastern", "terrain_multiplier": 1.35,
        "lat_range": (25.0, 26.1), "lon_range": (89.8, 92.8),
        "districts": ["Shillong", "Tura", "Jowai", "Nongpoh"]
    },
    "Mizoram": {
        "code": "MZ", "hindi": "मिज़ोरम", "zone": "North-Eastern", "terrain_multiplier": 1.40,
        "lat_range": (21.9, 24.5), "lon_range": (92.2, 93.4),
        "districts": ["Aizawl", "Lunglei", "Champhai"]
    },
    "Nagaland": {
        "code": "NL", "hindi": "नागालैंड", "zone": "North-Eastern", "terrain_multiplier": 1.40,
        "lat_range": (25.1, 27.0), "lon_range": (93.3, 95.2),
        "districts": ["Kohima", "Dimapur", "Mokokchung"]
    },
    "Sikkim": {
        "code": "SK", "hindi": "सिक्किम", "zone": "North-Eastern", "terrain_multiplier": 1.40,
        "lat_range": (27.1, 28.1), "lon_range": (88.1, 88.9),
        "districts": ["Gangtok", "Namchi", "Gyalshing", "Mangan"]
    },
    "Tripura": {
        "code": "TR", "hindi": "त्रिपुरा", "zone": "North-Eastern", "terrain_multiplier": 1.25,
        "lat_range": (22.9, 24.5), "lon_range": (91.1, 92.4),
        "districts": ["Agartala", "Udaipur", "Dharmanagar"]
    },
}

ZONES = ["Northern", "Southern", "Western", "Eastern", "Central", "North-Eastern"]

def get_state_info(state_name: str) -> Optional[Dict]:
    """Returns metadata for a given Indian State or Union Territory."""
    if not state_name:
        return None
    # direct match
    if state_name in PAN_INDIA_STATES:
        return PAN_INDIA_STATES[state_name]
    # case-insensitive match
    s_lower = state_name.strip().lower()
    for k, v in PAN_INDIA_STATES.items():
        if k.lower() == s_lower:
            return v
    return None

def get_terrain_multiplier(state_name: str) -> float:
    """
    Returns authentic terrain cost index multiplier for public works.
    Normal plains = 1.0, Hill/High-Altitude = 1.35-1.40, Islands = 1.50.
    """
    info = get_state_info(state_name)
    if info and "terrain_multiplier" in info:
        return float(info["terrain_multiplier"])
    return 1.0

def get_all_states() -> List[str]:
    """Returns sorted list of all 36 States and UTs in India."""
    return sorted(list(PAN_INDIA_STATES.keys()))

def get_states_by_zone(zone: str) -> List[str]:
    """Returns all states within a specific administrative zone."""
    return [k for k, v in PAN_INDIA_STATES.items() if v.get("zone", "").lower() == zone.lower()]

def get_districts_for_state(state_name: str) -> List[str]:
    """Returns master list of major districts for a state."""
    info = get_state_info(state_name)
    if info and "districts" in info:
        return info["districts"]
    return ["District Headquarters", "Central District", "Rural District"]
