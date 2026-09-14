/**
 * Offline fallback mock data — full-featured demo without backend.
 * Contains verified records of each verdict and anomaly type.
 */

export interface SummaryData {
  total_works: number;
  total_sanctioned_inr: number;
  total_disbursed_inr: number;
  total_flagged: number;
  statutory_holds: number;
  compliance_inquiry: number;
  capital_dormant: number;
  verified_compliant: number;
  high_risk_alerts: number;
  utilisation_pct: number;
}

export interface MP {
  mp_id: string;
  mp_name: string;
  constituency: string;
  state: string;
}

export interface AuditRecord {
  work_id: string;
  mp_id: string;
  mp_name: string;
  constituency: string;
  state: string;
  district: string;
  work_title: string;
  category: string;
  vendor_name: string;
  vendor_id: string;
  sanction_date: string;
  estimated_cost_inr: number;
  expenditure_incurred_inr: number;
  sor_benchmark_cost_inr?: number;
  completion_pct: number;
  work_status: string;
  verdict: 'STATUTORY HOLD' | 'COMPLIANCE INQUIRY' | 'CAPITAL DORMANT' | 'VERIFIED COMPLIANT' | string;
  risk_score: number;
  flag_sor_inflated?: boolean;
  flag_expenditure_mismatch?: boolean;
  flag_duplicate_work?: boolean;
  flag_tender_splitting?: boolean;
  flag_geo_tampering?: boolean;
  flag_parked_funds?: boolean;
  flag_no_physical_evidence?: boolean;
  flag_category_deviation?: boolean;
  flag_recycled_photo?: boolean;
  ml_anomaly_score?: number;
  vendor_risk_tier?: string;
  projected_dormancy_risk?: boolean;
  days_stalled?: number;
  days_to_dormancy?: number;
  statutory_dossier?: string;
  flags?: string[];
  recommended_action?: string;
  // Pan-India Outlier Intelligence
  is_statistical_outlier?: boolean;
  is_extreme_outlier?: boolean;
  state_cost_ratio?: number;
  terrain_multiplier?: number;
  outlier_diagnostic?: string;
}

export interface OutlierItem {
  work_id: string;
  work_title: string;
  state: string;
  district: string;
  category: string;
  estimated_cost_inr: number;
  state_cost_ratio: number;
  terrain_multiplier: number;
  is_extreme_outlier: boolean;
  ml_anomaly_score: number;
  verdict: string;
  outlier_diagnostic: string;
}

export interface AlertItem {
  id: string;
  work_id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  target_role: string;
  target_id: string;
  summary: string;
  statutory_dossier: string;
  recommended_action?: string;
  verdict: string;
  created_at?: string;
}

export interface DormancyItem {
  work_id: string;
  work_title: string;
  mp_name: string;
  mp_id: string;
  constituency: string;
  state: string;
  district: string;
  category?: string;
  estimated_cost_inr: number;
  expenditure_incurred_inr: number;
  completion_pct: number;
  work_status: string;
  days_stalled: number;
  days_to_dormancy: number;
  days_to_threshold?: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | string;
}

export interface VendorLeaderboardItem {
  vendor_id: string;
  vendor_name: string;
  risk_tier: string;
  award_count: number;
  near_threshold_pct: number;
  avg_cost_ratio: number;
}

export interface StateHeatmapItem {
  state: string;
  total: number;
  flagged: number;
  flag_pct: number;
  statutory_holds: number;
  utilisation_pct: number;
}

export interface CategoryUtilisationItem {
  category: string;
  count: number;
  utilisation_pct: number;
}

export interface UtilTrendItem {
  group: string;
  quarter: string;
  estimated_inr: number;
  disbursed_inr: number;
  utilisation_pct: number;
}

export const MOCK_SUMMARY: SummaryData = {
  total_works: 487,
  total_sanctioned_inr: 1420000000,
  total_disbursed_inr: 985000000,
  total_flagged: 78,
  statutory_holds: 23,
  compliance_inquiry: 31,
  capital_dormant: 24,
  verified_compliant: 409,
  high_risk_alerts: 23,
  utilisation_pct: 69.4,
};

export const MOCK_MPs: MP[] = [
  { mp_id: 'MP001', mp_name: 'Arjun Sharma', constituency: 'Pune North', state: 'Maharashtra' },
  { mp_id: 'MP002', mp_name: 'Priya Nair', constituency: 'Chennai Central', state: 'Tamil Nadu' },
  { mp_id: 'MP003', mp_name: 'Rajesh Gupta', constituency: 'Varanasi East', state: 'Uttar Pradesh' },
  { mp_id: 'MP004', mp_name: 'Sunita Devi', constituency: 'Jaipur Rural', state: 'Rajasthan' },
  { mp_id: 'MP005', mp_name: 'Deepak Chatterjee', constituency: 'Kolkata South', state: 'West Bengal' },
  { mp_id: 'MP006', mp_name: 'Meena Kulkarni', constituency: 'Nashik', state: 'Maharashtra' },
  { mp_id: 'MP007', mp_name: 'Vinod Tiwari', constituency: 'Lucknow West', state: 'Uttar Pradesh' },
  { mp_id: 'MP008', mp_name: 'Anita Roy', constituency: 'Howrah', state: 'West Bengal' },
  { mp_id: 'MP009', mp_name: 'Suresh Pillai', constituency: 'Coimbatore North', state: 'Tamil Nadu' },
  { mp_id: 'MP010', mp_name: 'Kavita Joshi', constituency: 'Jodhpur', state: 'Rajasthan' },
];

export const MOCK_AUDIT_RECORDS: AuditRecord[] = [
  {
    work_id: 'WRK00001',
    mp_id: 'MP001',
    mp_name: 'Arjun Sharma',
    constituency: 'Pune North',
    state: 'Maharashtra',
    district: 'Pune',
    work_title: 'Construction of RCC Road — Village Kothrud to Katraj',
    category: 'Road Construction',
    vendor_name: 'Vijay Constructions Pvt Ltd',
    vendor_id: 'VEN001',
    sanction_date: '2023-04-10',
    estimated_cost_inr: 4800000,
    expenditure_incurred_inr: 5420000,
    sor_benchmark_cost_inr: 4000000,
    completion_pct: 35,
    work_status: 'Stalled',
    verdict: 'STATUTORY HOLD',
    risk_score: 87.4,
    flag_sor_inflated: true,
    flag_expenditure_mismatch: true,
    flag_duplicate_work: false,
    flag_tender_splitting: false,
    flag_geo_tampering: false,
    flag_parked_funds: false,
    flag_no_physical_evidence: false,
    flag_category_deviation: false,
    flag_recycled_photo: false,
    ml_anomaly_score: -0.341,
    vendor_risk_tier: 'HIGH',
    projected_dormancy_risk: true,
    days_stalled: 210,
    days_to_dormancy: -30,
    statutory_dossier: 'Cost inflation of 35.5% above Schedule of Rates (GFR Rule 149 violation). Expenditure-progress mismatch: 54.2L disbursed against 35% completion. CVC Circular 04/2021 §3.2 mandates immediate inquiry.',
    flags: ['Cost Inflation above SoR', 'Disproportionate Disbursement'],
    recommended_action: 'Suspend payments, initiate inquiry within 7 days.',
  },
  {
    work_id: 'WRK00002',
    mp_id: 'MP002',
    mp_name: 'Priya Nair',
    constituency: 'Chennai Central',
    state: 'Tamil Nadu',
    district: 'Chennai',
    work_title: 'Construction of Primary Health Centre — Ward 12',
    category: 'Health Centre',
    vendor_name: 'Nair Infrastructure Ltd',
    vendor_id: 'VEN002',
    sanction_date: '2023-06-15',
    estimated_cost_inr: 6500000,
    expenditure_incurred_inr: 3200000,
    sor_benchmark_cost_inr: 6000000,
    completion_pct: 55,
    work_status: 'In Progress',
    verdict: 'COMPLIANCE INQUIRY',
    risk_score: 52.1,
    flag_sor_inflated: false,
    flag_expenditure_mismatch: true,
    flag_duplicate_work: false,
    flag_tender_splitting: false,
    flag_geo_tampering: false,
    flag_parked_funds: false,
    flag_no_physical_evidence: false,
    flag_category_deviation: false,
    flag_recycled_photo: false,
    ml_anomaly_score: -0.128,
    vendor_risk_tier: 'MEDIUM',
    projected_dormancy_risk: false,
    days_stalled: 45,
    days_to_dormancy: 135,
    statutory_dossier: 'Expenditure-progress ratio anomaly detected: 32L disbursed but only 55% physical completion. MPLADS Guidelines 2023 §8.4 requires proportional disbursement certification.',
    flags: ['Expenditure-Progress Ratio Mismatch'],
    recommended_action: 'Request physical inspection report from District Authority.',
  },
  {
    work_id: 'WRK00003',
    mp_id: 'MP003',
    mp_name: 'Rajesh Gupta',
    constituency: 'Varanasi East',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    work_title: 'Installation of Solar Street Lights — Shivpur Block',
    category: 'Renewable Energy',
    vendor_name: 'SolarTech Solutions',
    vendor_id: 'VEN003',
    sanction_date: '2022-11-01',
    estimated_cost_inr: 2200000,
    expenditure_incurred_inr: 2200000,
    sor_benchmark_cost_inr: 2000000,
    completion_pct: 8,
    work_status: 'Stalled',
    verdict: 'CAPITAL DORMANT',
    risk_score: 74.8,
    flag_sor_inflated: false,
    flag_expenditure_mismatch: false,
    flag_duplicate_work: false,
    flag_tender_splitting: false,
    flag_geo_tampering: false,
    flag_parked_funds: true,
    flag_no_physical_evidence: true,
    flag_category_deviation: false,
    flag_recycled_photo: false,
    ml_anomaly_score: -0.289,
    vendor_risk_tier: 'HIGH',
    projected_dormancy_risk: true,
    days_stalled: 420,
    days_to_dormancy: -240,
    statutory_dossier: 'Work stalled for 420 days with only 8% physical completion against 100% fund release. Capital Dormancy confirmed per MPLADS Guidelines 2023 §11.2. PAC Report 2019-20 Finding 47 applies.',
    flags: ['Parked Funds', 'No Physical Progress'],
    recommended_action: 'Issue formal show-cause notice to implementing agency.',
  },
  {
    work_id: 'WRK00004',
    mp_id: 'MP004',
    mp_name: 'Sunita Devi',
    constituency: 'Jaipur Rural',
    state: 'Rajasthan',
    district: 'Jaipur',
    work_title: 'Renovation of Government Higher Secondary School — Sanganer',
    category: 'School Building',
    vendor_name: 'Rajput Builders',
    vendor_id: 'VEN004',
    sanction_date: '2023-08-20',
    estimated_cost_inr: 3800000,
    expenditure_incurred_inr: 3400000,
    sor_benchmark_cost_inr: 3500000,
    completion_pct: 88,
    work_status: 'In Progress',
    verdict: 'VERIFIED COMPLIANT',
    risk_score: 12.3,
    flag_sor_inflated: false,
    flag_expenditure_mismatch: false,
    flag_duplicate_work: false,
    flag_tender_splitting: false,
    flag_geo_tampering: false,
    flag_parked_funds: false,
    flag_no_physical_evidence: false,
    flag_category_deviation: false,
    flag_recycled_photo: false,
    ml_anomaly_score: 0.142,
    vendor_risk_tier: 'LOW',
    projected_dormancy_risk: false,
    days_stalled: 0,
    days_to_dormancy: 999,
    statutory_dossier: 'All parameters within statutory limits. Cost, progress, and disbursement ratios are compliant. No anomalies detected across all 9 rule engines.',
    flags: [],
    recommended_action: 'Normal monitoring. Next milestone inspection scheduled.',
  },
  {
    work_id: 'WRK00005',
    mp_id: 'MP005',
    mp_name: 'Deepak Chatterjee',
    constituency: 'Kolkata South',
    state: 'West Bengal',
    district: 'Kolkata',
    work_title: 'Construction of Community Hall — Tollygunge',
    category: 'Community Hall',
    vendor_name: 'Bengal Infra Works',
    vendor_id: 'VEN005',
    sanction_date: '2023-01-05',
    estimated_cost_inr: 5500000,
    expenditure_incurred_inr: 5500000,
    sor_benchmark_cost_inr: 5000000,
    completion_pct: 20,
    work_status: 'Stalled',
    verdict: 'STATUTORY HOLD',
    risk_score: 91.2,
    flag_sor_inflated: true,
    flag_expenditure_mismatch: true,
    flag_duplicate_work: true,
    flag_tender_splitting: false,
    flag_geo_tampering: false,
    flag_parked_funds: true,
    flag_no_physical_evidence: false,
    flag_category_deviation: false,
    flag_recycled_photo: false,
    ml_anomaly_score: -0.478,
    vendor_risk_tier: 'HIGH',
    projected_dormancy_risk: true,
    days_stalled: 310,
    days_to_dormancy: -130,
    statutory_dossier: 'Multiple critical violations: (1) Spatial-semantic duplicate detected within 180m radius. (2) Full fund disbursed against 20% completion. (3) Capital dormancy confirmed. CVC Circular 04/2021 §3.1 & CAG Report 12/2022 Finding 23.',
    flags: ['Spatial-Semantic Duplicate', 'Parked Funds', 'Cost Inflation'],
    recommended_action: 'IMMEDIATE ACTION REQUIRED: Suspend further fund disbursement pending inquiry.',
  },
  {
    work_id: 'WRK00006',
    mp_id: 'MP001',
    mp_name: 'Arjun Sharma',
    constituency: 'Pune North',
    state: 'Maharashtra',
    district: 'Pune',
    work_title: 'Water Supply Pipeline — Hadapsar Extension',
    category: 'Water Supply',
    vendor_name: 'AquaTech Solutions',
    vendor_id: 'VEN006',
    sanction_date: '2023-09-12',
    estimated_cost_inr: 4200000,
    expenditure_incurred_inr: 2100000,
    sor_benchmark_cost_inr: 4000000,
    completion_pct: 48,
    work_status: 'In Progress',
    verdict: 'VERIFIED COMPLIANT',
    risk_score: 18.7,
    flag_sor_inflated: false,
    flag_expenditure_mismatch: false,
    flag_duplicate_work: false,
    flag_tender_splitting: false,
    flag_geo_tampering: false,
    flag_parked_funds: false,
    flag_no_physical_evidence: false,
    flag_category_deviation: false,
    flag_recycled_photo: false,
    ml_anomaly_score: 0.087,
    vendor_risk_tier: 'LOW',
    projected_dormancy_risk: false,
    days_stalled: 0,
    days_to_dormancy: 999,
    statutory_dossier: 'Work progressing as per schedule. Disbursement proportional to completion. All milestone photographs geotagged correctly.',
    flags: [],
    recommended_action: 'Normal monitoring.',
  },
];

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'ALT001',
    work_id: 'WRK00001',
    severity: 'HIGH',
    target_role: 'MP',
    target_id: 'MP001',
    summary: 'STATUTORY HOLD — Cost inflation 35.5% above SoR',
    statutory_dossier: 'GFR Rule 149 violation. Immediate disbursement suspension required.',
    recommended_action: 'Suspend payments, initiate inquiry within 7 days.',
    verdict: 'STATUTORY HOLD',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ALT002',
    work_id: 'WRK00003',
    severity: 'HIGH',
    target_role: 'DISTRICT',
    target_id: 'Varanasi',
    summary: 'CAPITAL DORMANT — Work stalled 420 days',
    statutory_dossier: 'MPLADS Guidelines 2023 §11.2 — Dormancy threshold breached.',
    recommended_action: 'Issue formal show-cause notice to implementing agency.',
    verdict: 'CAPITAL DORMANT',
    created_at: '2024-01-14T09:30:00Z',
  },
  {
    id: 'ALT003',
    work_id: 'WRK00002',
    severity: 'MEDIUM',
    target_role: 'STATE',
    target_id: 'Tamil Nadu',
    summary: 'COMPLIANCE INQUIRY — Expenditure-progress mismatch',
    statutory_dossier: 'MPLADS Guidelines 2023 §8.4 — Disproportionate disbursement.',
    recommended_action: 'Request physical inspection report from District Authority.',
    verdict: 'COMPLIANCE INQUIRY',
    created_at: '2024-01-13T14:00:00Z',
  },
];

export const MOCK_DORMANCY_PIPELINE: DormancyItem[] = [
  {
    work_id: 'WRK00003',
    work_title: 'Installation of Solar Street Lights — Shivpur Block',
    mp_name: 'Rajesh Gupta',
    mp_id: 'MP003',
    constituency: 'Varanasi East',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    estimated_cost_inr: 2200000,
    expenditure_incurred_inr: 2200000,
    completion_pct: 8,
    work_status: 'Stalled',
    days_stalled: 420,
    days_to_dormancy: -240,
    urgency: 'CRITICAL',
  },
  {
    work_id: 'WRK00005',
    work_title: 'Construction of Community Hall — Tollygunge',
    mp_name: 'Deepak Chatterjee',
    mp_id: 'MP005',
    constituency: 'Kolkata South',
    state: 'West Bengal',
    district: 'Kolkata',
    estimated_cost_inr: 5500000,
    expenditure_incurred_inr: 5500000,
    completion_pct: 20,
    work_status: 'Stalled',
    days_stalled: 310,
    days_to_dormancy: -130,
    urgency: 'CRITICAL',
  },
  {
    work_id: 'WRK00007',
    work_title: 'Drainage Canal — Jodhpur North Block',
    mp_name: 'Kavita Joshi',
    mp_id: 'MP010',
    constituency: 'Jodhpur',
    state: 'Rajasthan',
    district: 'Jodhpur',
    estimated_cost_inr: 3100000,
    expenditure_incurred_inr: 1800000,
    completion_pct: 40,
    work_status: 'Stalled',
    days_stalled: 155,
    days_to_dormancy: 25,
    urgency: 'HIGH',
  },
];

export const MOCK_VENDOR_LEADERBOARD: VendorLeaderboardItem[] = [
  { vendor_id: 'VEN001', vendor_name: 'Vijay Constructions Pvt Ltd', risk_tier: 'HIGH', award_count: 14, near_threshold_pct: 0.71, avg_cost_ratio: 1.42 },
  { vendor_id: 'VEN005', vendor_name: 'Bengal Infra Works', risk_tier: 'HIGH', award_count: 9, near_threshold_pct: 0.56, avg_cost_ratio: 1.38 },
  { vendor_id: 'VEN003', vendor_name: 'SolarTech Solutions', risk_tier: 'HIGH', award_count: 7, near_threshold_pct: 0.43, avg_cost_ratio: 1.25 },
  { vendor_id: 'VEN002', vendor_name: 'Nair Infrastructure Ltd', risk_tier: 'MEDIUM', award_count: 11, near_threshold_pct: 0.27, avg_cost_ratio: 1.09 },
  { vendor_id: 'VEN004', vendor_name: 'Rajput Builders', risk_tier: 'LOW', award_count: 6, near_threshold_pct: 0.08, avg_cost_ratio: 0.97 },
  { vendor_id: 'VEN006', vendor_name: 'AquaTech Solutions', risk_tier: 'LOW', award_count: 4, near_threshold_pct: 0.05, avg_cost_ratio: 0.94 },
];

export const MOCK_STATE_HEATMAP: StateHeatmapItem[] = [
  { state: 'Maharashtra', total: 95, flagged: 22, flag_pct: 23.2, statutory_holds: 8, utilisation_pct: 68 },
  { state: 'Uttar Pradesh', total: 88, flagged: 19, flag_pct: 21.6, statutory_holds: 7, utilisation_pct: 61 },
  { state: 'West Bengal', total: 72, flagged: 14, flag_pct: 19.4, statutory_holds: 4, utilisation_pct: 71 },
  { state: 'Rajasthan', total: 81, flagged: 12, flag_pct: 14.8, statutory_holds: 3, utilisation_pct: 74 },
  { state: 'Tamil Nadu', total: 68, flagged: 8, flag_pct: 11.8, statutory_holds: 1, utilisation_pct: 79 },
];

export const MOCK_CATEGORY_UTILISATION: CategoryUtilisationItem[] = [
  { category: 'Road Construction', count: 98, utilisation_pct: 71 },
  { category: 'School Building', count: 74, utilisation_pct: 68 },
  { category: 'Water Supply', count: 62, utilisation_pct: 74 },
  { category: 'Health Centre', count: 55, utilisation_pct: 63 },
  { category: 'Community Hall', count: 48, utilisation_pct: 57 },
  { category: 'Sanitation', count: 44, utilisation_pct: 82 },
  { category: 'Renewable Energy', count: 38, utilisation_pct: 45 },
  { category: 'Drainage Works', count: 35, utilisation_pct: 59 },
  { category: 'Sports Facility', count: 33, utilisation_pct: 66 },
];

export const MOCK_UTIL_TREND: UtilTrendItem[] = [
  { group: 'Maharashtra', quarter: 'Q1-2023', estimated_inr: 350000000, disbursed_inr: 220000000, utilisation_pct: 63 },
  { group: 'Maharashtra', quarter: 'Q2-2023', estimated_inr: 350000000, disbursed_inr: 240000000, utilisation_pct: 69 },
  { group: 'Maharashtra', quarter: 'Q3-2023', estimated_inr: 350000000, disbursed_inr: 250000000, utilisation_pct: 71 },
  { group: 'Uttar Pradesh', quarter: 'Q1-2023', estimated_inr: 280000000, disbursed_inr: 160000000, utilisation_pct: 57 },
  { group: 'Uttar Pradesh', quarter: 'Q2-2023', estimated_inr: 280000000, disbursed_inr: 170000000, utilisation_pct: 61 },
  { group: 'Uttar Pradesh', quarter: 'Q3-2023', estimated_inr: 280000000, disbursed_inr: 175000000, utilisation_pct: 63 },
  { group: 'Tamil Nadu', quarter: 'Q1-2023', estimated_inr: 220000000, disbursed_inr: 165000000, utilisation_pct: 75 },
  { group: 'Tamil Nadu', quarter: 'Q2-2023', estimated_inr: 220000000, disbursed_inr: 170000000, utilisation_pct: 77 },
  { group: 'Tamil Nadu', quarter: 'Q3-2023', estimated_inr: 220000000, disbursed_inr: 175000000, utilisation_pct: 80 },
];
