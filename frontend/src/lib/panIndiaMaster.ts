/**
 * Pan-India Master Reference Directory (MoSPI Standard)
 * Covers all 28 States and 8 Union Territories (36 Total) across 6 Official Zones.
 */

export interface StateMasterInfo {
  state: string;
  code: string;
  hindi: string;
  zone: 'Northern' | 'Southern' | 'Western' | 'Eastern' | 'Central' | 'North-Eastern';
  terrainMultiplier: number;
  districts?: string[];
}

export const PAN_INDIA_ZONES = [
  'All India',
  'Northern',
  'Southern',
  'Western',
  'Eastern',
  'Central',
  'North-Eastern',
] as const;

export type PanIndiaZone = (typeof PAN_INDIA_ZONES)[number];

export const PAN_INDIA_STATES: StateMasterInfo[] = [
  // ── NORTHERN ZONE ──
  { state: 'Delhi', code: 'DL', hindi: 'दिल्ली', zone: 'Northern', terrainMultiplier: 1.05 },
  { state: 'Haryana', code: 'HR', hindi: 'हरियाणा', zone: 'Northern', terrainMultiplier: 1.0 },
  { state: 'Himachal Pradesh', code: 'HP', hindi: 'हिमाचल प्रदेश', zone: 'Northern', terrainMultiplier: 1.35 },
  { state: 'Jammu and Kashmir', code: 'JK', hindi: 'जम्मू और कश्मीर', zone: 'Northern', terrainMultiplier: 1.40 },
  { state: 'Ladakh', code: 'LA', hindi: 'लद्दाख', zone: 'Northern', terrainMultiplier: 1.50 },
  { state: 'Punjab', code: 'PB', hindi: 'पंजाब', zone: 'Northern', terrainMultiplier: 1.0 },
  { state: 'Rajasthan', code: 'RJ', hindi: 'राजस्थान', zone: 'Northern', terrainMultiplier: 1.10 },
  { state: 'Chandigarh', code: 'CH', hindi: 'चंडीगढ़', zone: 'Northern', terrainMultiplier: 1.0 },

  // ── SOUTHERN ZONE ──
  { state: 'Andhra Pradesh', code: 'AP', hindi: 'आंध्र प्रदेश', zone: 'Southern', terrainMultiplier: 1.0 },
  { state: 'Karnataka', code: 'KA', hindi: 'कर्नाटक', zone: 'Southern', terrainMultiplier: 1.05 },
  { state: 'Kerala', code: 'KL', hindi: 'केरल', zone: 'Southern', terrainMultiplier: 1.15 },
  { state: 'Tamil Nadu', code: 'TN', hindi: 'तमिलनाडु', zone: 'Southern', terrainMultiplier: 1.0 },
  { state: 'Telangana', code: 'TS', hindi: 'तेलंगाना', zone: 'Southern', terrainMultiplier: 1.0 },
  { state: 'Puducherry', code: 'PY', hindi: 'पुदुचेरी', zone: 'Southern', terrainMultiplier: 1.05 },
  { state: 'Lakshadweep', code: 'LD', hindi: 'लक्षद्वीप', zone: 'Southern', terrainMultiplier: 1.50 },

  // ── WESTERN ZONE ──
  { state: 'Goa', code: 'GA', hindi: 'गोवा', zone: 'Western', terrainMultiplier: 1.15 },
  { state: 'Gujarat', code: 'GJ', hindi: 'गुजरात', zone: 'Western', terrainMultiplier: 1.0 },
  { state: 'Maharashtra', code: 'MH', hindi: 'महाराष्ट्र', zone: 'Western', terrainMultiplier: 1.05 },
  { state: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN', hindi: 'दादरा एवं दमन दीव', zone: 'Western', terrainMultiplier: 1.05 },

  // ── EASTERN ZONE ──
  { state: 'Bihar', code: 'BR', hindi: 'बिहार', zone: 'Eastern', terrainMultiplier: 1.0 },
  { state: 'Jharkhand', code: 'JH', hindi: 'झारखंड', zone: 'Eastern', terrainMultiplier: 1.10 },
  { state: 'Odisha', code: 'OD', hindi: 'ओडिशा', zone: 'Eastern', terrainMultiplier: 1.05 },
  { state: 'West Bengal', code: 'WB', hindi: 'पश्चिम बंगाल', zone: 'Eastern', terrainMultiplier: 1.05 },
  { state: 'Andaman and Nicobar Islands', code: 'AN', hindi: 'अंडमान एवं निकोबार', zone: 'Eastern', terrainMultiplier: 1.50 },

  // ── CENTRAL ZONE ──
  { state: 'Chhattisgarh', code: 'CG', hindi: 'छत्तीसगढ़', zone: 'Central', terrainMultiplier: 1.10 },
  { state: 'Madhya Pradesh', code: 'MP', hindi: 'मध्य प्रदेश', zone: 'Central', terrainMultiplier: 1.05 },
  { state: 'Uttar Pradesh', code: 'UP', hindi: 'उत्तर प्रदेश', zone: 'Central', terrainMultiplier: 1.0 },
  { state: 'Uttarakhand', code: 'UK', hindi: 'उत्तराखंड', zone: 'Central', terrainMultiplier: 1.35 },

  // ── NORTH-EASTERN ZONE ──
  { state: 'Arunachal Pradesh', code: 'AR', hindi: 'अरुणाचल प्रदेश', zone: 'North-Eastern', terrainMultiplier: 1.45 },
  { state: 'Assam', code: 'AS', hindi: 'असम', zone: 'North-Eastern', terrainMultiplier: 1.15 },
  { state: 'Manipur', code: 'MN', hindi: 'मणिपुर', zone: 'North-Eastern', terrainMultiplier: 1.40 },
  { state: 'Meghalaya', code: 'ML', hindi: 'मेघालय', zone: 'North-Eastern', terrainMultiplier: 1.35 },
  { state: 'Mizoram', code: 'MZ', hindi: 'मिज़ोरम', zone: 'North-Eastern', terrainMultiplier: 1.40 },
  { state: 'Nagaland', code: 'NL', hindi: 'नागालैंड', zone: 'North-Eastern', terrainMultiplier: 1.40 },
  { state: 'Sikkim', code: 'SK', hindi: 'सिक्किम', zone: 'North-Eastern', terrainMultiplier: 1.40 },
  { state: 'Tripura', code: 'TR', hindi: 'त्रिपुरा', zone: 'North-Eastern', terrainMultiplier: 1.25 },
];

export function getAllStateNames(): string[] {
  return PAN_INDIA_STATES.map((s) => s.state).sort();
}

export function getStateMaster(stateName: string): StateMasterInfo | undefined {
  if (!stateName) return undefined;
  const lower = stateName.trim().toLowerCase();
  return PAN_INDIA_STATES.find((s) => s.state.toLowerCase() === lower);
}

export function getStatesInZone(zone: string): StateMasterInfo[] {
  if (zone === 'All India') return PAN_INDIA_STATES;
  return PAN_INDIA_STATES.filter((s) => s.zone.toLowerCase() === zone.toLowerCase());
}
