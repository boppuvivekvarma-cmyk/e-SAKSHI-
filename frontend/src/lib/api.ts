/**
 * Typed API client — Vercel-compatible.
 * getBaseUrl() returns an absolute URL for server-side fetches.
 */
import {
  MOCK_SUMMARY,
  MOCK_AUDIT_RECORDS,
  MOCK_ALERTS,
  MOCK_DORMANCY_PIPELINE,
  MOCK_VENDOR_LEADERBOARD,
  MOCK_STATE_HEATMAP,
  MOCK_CATEGORY_UTILISATION,
  MOCK_UTIL_TREND,
  SummaryData,
  AuditRecord,
  AlertItem,
  DormancyItem,
  VendorLeaderboardItem,
  StateHeatmapItem,
  CategoryUtilisationItem,
  UtilTrendItem,
  OutlierItem,
} from './mockData';

export type {
  SummaryData,
  AuditRecord,
  AlertItem,
  DormancyItem,
  VendorLeaderboardItem,
  StateHeatmapItem,
  CategoryUtilisationItem,
  UtilTrendItem,
  OutlierItem,
};

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
}

async function fetchJSON<T>(url: string, fallback: T): Promise<T> {
  try {
    const base = getBaseUrl();
    const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
    const res = await fetch(fullUrl, {
      next: { revalidate: 30 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getSummary(params?: Record<string, string | number | undefined>): Promise<SummaryData> {
  const q = params
    ? new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : '';
  return fetchJSON<SummaryData>(`/api/v1/dashboard/summary${q ? '?' + q : ''}`, MOCK_SUMMARY);
}

export async function getMPDashboard(mp_id: string): Promise<{
  summary: SummaryData;
  category_breakdown: any[];
  status_breakdown: any[];
  flagged_works: AuditRecord[];
}> {
  return fetchJSON(`/api/v1/dashboard/mp/${mp_id}`, {
    summary: MOCK_SUMMARY,
    category_breakdown: [],
    status_breakdown: [],
    flagged_works: MOCK_AUDIT_RECORDS.filter(r => r.verdict !== 'VERIFIED COMPLIANT'),
  });
}

export async function getDistrictDashboard(district: string): Promise<{
  summary: SummaryData;
  dormancy_watchlist: DormancyItem[];
  verification_queue: AuditRecord[];
}> {
  return fetchJSON(`/api/v1/dashboard/district/${encodeURIComponent(district)}`, {
    summary: MOCK_SUMMARY,
    dormancy_watchlist: MOCK_DORMANCY_PIPELINE,
    verification_queue: MOCK_AUDIT_RECORDS.filter(r => r.verdict !== 'VERIFIED COMPLIANT'),
  });
}

export async function getStateDashboard(state: string): Promise<{
  state?: string;
  is_national?: boolean;
  summary: SummaryData;
  vendor_leaderboard: VendorLeaderboardItem[];
  district_compliance: any[];
  category_deviations: number;
  outliers_matrix?: OutlierItem[];
}> {
  return fetchJSON(`/api/v1/dashboard/state/${encodeURIComponent(state)}`, {
    state,
    is_national: state.toLowerCase() === 'all india',
    summary: MOCK_SUMMARY,
    vendor_leaderboard: MOCK_VENDOR_LEADERBOARD,
    district_compliance: [],
    category_deviations: 6,
    outliers_matrix: [],
  });
}

export async function getStates(): Promise<Array<{
  state: string;
  code: string;
  hindi: string;
  zone: string;
  terrain_multiplier: number;
  works_count: number;
  has_data: boolean;
}>> {
  return fetchJSON('/api/v1/dashboard/states', []);
}

export async function getDistricts(state?: string): Promise<string[]> {
  const q = state ? `?state=${encodeURIComponent(state)}` : '';
  return fetchJSON<string[]>(`/api/v1/dashboard/districts${q}`, []);
}

export async function getMinistryDashboard(): Promise<{
  summary: SummaryData;
  state_risk_heatmap: StateHeatmapItem[];
  category_utilisation: CategoryUtilisationItem[];
  dormancy_pipeline: DormancyItem[];
  utilisation_trend: UtilTrendItem[];
}> {
  return fetchJSON('/api/v1/dashboard/ministry', {
    summary: MOCK_SUMMARY,
    state_risk_heatmap: MOCK_STATE_HEATMAP,
    category_utilisation: MOCK_CATEGORY_UTILISATION,
    dormancy_pipeline: MOCK_DORMANCY_PIPELINE,
    utilisation_trend: MOCK_UTIL_TREND,
  });
}

export async function getAuditDocket(params?: {
  verdict?: string;
  state?: string;
  district?: string;
  mp_id?: string;
  min_risk_score?: number;
  outliers_only?: boolean;
  limit?: number;
}): Promise<AuditRecord[]> {
  const q = params
    ? new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : '';
  return fetchJSON<AuditRecord[]>(`/api/v1/audit/docket${q ? '?' + q : ''}`, MOCK_AUDIT_RECORDS);
}

export async function getWorkAudit(work_id: string): Promise<AuditRecord> {
  return fetchJSON<AuditRecord>(
    `/api/v1/audit/docket/${work_id}`,
    MOCK_AUDIT_RECORDS.find(r => r.work_id === work_id) ?? MOCK_AUDIT_RECORDS[0]
  );
}

export async function getAlerts(params?: { limit?: number; role?: string }): Promise<AlertItem[]> {
  const q = params
    ? new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : '';
  return fetchJSON<AlertItem[]>(`/api/v1/alerts/${q ? '?' + q : ''}`, MOCK_ALERTS);
}

export async function getNoticeData(work_id: string): Promise<AuditRecord & {
  notice_date: string;
  district?: string;
}> {
  const mockRecord = MOCK_AUDIT_RECORDS.find(r => r.work_id === work_id) ?? MOCK_AUDIT_RECORDS[0];
  return fetchJSON(`/api/v1/notices/${work_id}`, {
    ...mockRecord,
    flags: ['Cost Inflation', 'Expenditure-Progress Mismatch'],
    recommended_action: 'IMMEDIATE ACTION REQUIRED: Suspend further fund disbursement.',
    notice_date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
  });
}

export function formatCrore(amount: number | null | undefined): string {
  if (!amount) return '₹0';
  const crore = amount / 10000000;
  if (crore >= 100) return `₹${(crore / 100).toFixed(1)}K Cr`;
  if (crore >= 1) return `₹${crore.toFixed(2)} Cr`;
  return `₹${(amount / 100000).toFixed(1)} L`;
}

export function formatINR(amount: number | null | undefined): string {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function verdictClass(verdict: string): string {
  switch (verdict) {
    case 'STATUTORY HOLD':
      return 'badge-hold';
    case 'COMPLIANCE INQUIRY':
      return 'badge-inquiry';
    case 'CAPITAL DORMANT':
      return 'badge-dormant';
    default:
      return 'badge-compliant';
  }
}

export function riskBarColor(score: number): string {
  if (score >= 60) return '#ef4444';
  if (score >= 25) return '#f59e0b';
  return '#22c55e';
}

export function severityClass(s: string): string {
  return s === 'HIGH' ? 'badge-hold' : s === 'MEDIUM' ? 'badge-inquiry' : 'badge-compliant';
}
