/**
 * Next.js API Route — Catch-all handler for /api/v1/*
 * On Vercel (no backend), serves mock data directly.
 * If NEXT_PUBLIC_BACKEND_URL is set, proxies to the real FastAPI backend.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  MOCK_SUMMARY, MOCK_AUDIT_RECORDS, MOCK_ALERTS,
  MOCK_DORMANCY_PIPELINE, MOCK_VENDOR_LEADERBOARD,
  MOCK_STATE_HEATMAP, MOCK_CATEGORY_UTILISATION,
  MOCK_UTIL_TREND,
} from '@/lib/mockData';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');

  // ── Proxy to real backend if configured ──────────────────
  if (BACKEND_URL) {
    try {
      const search = new URL(request.url).search;
      const url = `${BACKEND_URL}/api/v1/${path}${search}`;
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (_err) {
      // fall through to mock data
    }
  }

  // ── Mock data responses ───────────────────────────────────
  const search = request.nextUrl.searchParams;
  const mp_id     = search.get('mp_id');
  const stateParam = search.get('state');
  const verdict   = search.get('verdict');
  const role      = search.get('role');
  const target_id = search.get('target_id');

  // Dashboard summary
  if (path === 'dashboard/summary') {
    return NextResponse.json(MOCK_SUMMARY);
  }

  // MP dashboard
  if (path.startsWith('dashboard/mp/')) {
    const mpId = path.split('/')[2];
    return NextResponse.json({
      summary: MOCK_SUMMARY,
      category_breakdown: [
        { category: 'Road Construction', count: 12, sanctioned: 33600000, disbursed: 21504000 },
        { category: 'School Building',   count: 8,  sanctioned: 33600000, disbursed: 25536000 },
        { category: 'Water Supply',      count: 6,  sanctioned: 18600000, disbursed: 13950000 },
        { category: 'Health Centre',     count: 4,  sanctioned: 22400000, disbursed: 18144000 },
        { category: 'Community Hall',    count: 5,  sanctioned: 19000000, disbursed: 11400000 },
      ],
      status_breakdown: [
        { status: 'Completed',   count: 22 },
        { status: 'In Progress', count: 18 },
        { status: 'Stalled',     count: 7  },
        { status: 'Not Started', count: 3  },
      ],
      flagged_works: MOCK_AUDIT_RECORDS.filter(r => r.mp_id === mpId || r.mp_id === 'MP001'),
    });
  }

  // District dashboard
  if (path.startsWith('dashboard/district/')) {
    return NextResponse.json({
      summary: MOCK_SUMMARY,
      dormancy_watchlist: MOCK_DORMANCY_PIPELINE,
      verification_queue: MOCK_AUDIT_RECORDS.filter(r => r.verdict !== 'VERIFIED COMPLIANT'),
    });
  }

  // State dashboard
  if (path.startsWith('dashboard/state/')) {
    return NextResponse.json({
      summary: MOCK_SUMMARY,
      vendor_leaderboard: MOCK_VENDOR_LEADERBOARD,
      district_compliance: [
        { district: 'Pune',       total: 45, flagged: 9, compliance_rate: 80.0 },
        { district: 'Nashik',     total: 32, flagged: 5, compliance_rate: 84.4 },
        { district: 'Nagpur',     total: 28, flagged: 6, compliance_rate: 78.6 },
        { district: 'Aurangabad', total: 18, flagged: 2, compliance_rate: 88.9 },
        { district: 'Solapur',    total: 12, flagged: 3, compliance_rate: 75.0 },
      ],
      category_deviations: 6,
    });
  }

  // Ministry dashboard
  if (path === 'dashboard/ministry') {
    return NextResponse.json({
      summary: MOCK_SUMMARY,
      state_risk_heatmap: MOCK_STATE_HEATMAP,
      category_utilisation: MOCK_CATEGORY_UTILISATION,
      dormancy_pipeline: MOCK_DORMANCY_PIPELINE,
      utilisation_trend: MOCK_UTIL_TREND,
    });
  }

  // Audit docket
  if (path === 'audit/docket') {
    let records = [...MOCK_AUDIT_RECORDS];
    if (verdict)    records = records.filter(r => r.verdict === verdict);
    if (mp_id)      records = records.filter(r => r.mp_id === mp_id);
    if (stateParam) records = records.filter(r => r.state === stateParam);
    return NextResponse.json(records);
  }

  // Single work audit
  if (path.startsWith('audit/docket/')) {
    const workId = path.split('/')[2];
    const record = MOCK_AUDIT_RECORDS.find(r => r.work_id === workId) || MOCK_AUDIT_RECORDS[0];
    return NextResponse.json(record);
  }

  // Alerts
  if (path === 'alerts' || path === 'alerts/') {
    let alerts = [...MOCK_ALERTS];
    if (role)      alerts = alerts.filter(a => a.target_role === role);
    if (target_id) alerts = alerts.filter(a => a.target_id === target_id);
    return NextResponse.json(alerts);
  }

  // Alerts count
  if (path === 'alerts/count') {
    return NextResponse.json({ total: 3, high: 2, medium: 1, unacknowledged: 3 });
  }

  // Notices
  if (path.startsWith('notices/')) {
    const workId = path.split('/')[1];
    const record = MOCK_AUDIT_RECORDS.find(r => r.work_id === workId) || MOCK_AUDIT_RECORDS[0];
    return NextResponse.json({
      work_id: record.work_id,
      mp_name: record.mp_name,
      mp_id: record.mp_id,
      constituency: record.constituency,
      state: record.state,
      district: record.district,
      work_title: record.work_title,
      category: record.category,
      sanction_date: record.sanction_date,
      estimated_cost_inr: record.estimated_cost_inr,
      expenditure_incurred_inr: record.expenditure_incurred_inr,
      completion_pct: record.completion_pct,
      work_status: record.work_status,
      vendor_name: record.vendor_name,
      verdict: record.verdict,
      risk_score: record.risk_score,
      statutory_dossier: record.statutory_dossier,
      flags: ['Cost Inflation', 'Expenditure-Progress Mismatch'],
      recommended_action: 'IMMEDIATE ACTION REQUIRED: Suspend further fund disbursement.',
      notice_date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    });
  }

  // Health check
  if (path === '' || path === 'health') {
    return NextResponse.json({ status: 'healthy', source: 'next-api-mock' });
  }

  return NextResponse.json({ error: 'Not found', path }, { status: 404 });
}

// Pipeline trigger (no-op on Vercel without backend)
export async function POST(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  if (BACKEND_URL) {
    try {
      const routePath = params.path.join('/');
      const body = await request.text();
      const res = await fetch(`${BACKEND_URL}/api/v1/${routePath}`, {
        method: 'POST',
        headers: { 'Content-Type': request.headers.get('content-type') || 'application/json' },
        body,
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch (_err) {
      // fall through
    }
  }
  return NextResponse.json({
    message: 'Pipeline not available in demo mode. All data served from mock dataset.',
  });
}
