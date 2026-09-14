import { getDistrictDashboard, formatINR } from '@/lib/api';
import { WorkRegister } from '@/components/WorkRegister';
import { AutoSubmitSelect } from '@/components/AutoSubmitSelect';
import { PAN_INDIA_STATES, getAllStateNames, getStateMaster } from '@/lib/panIndiaMaster';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'District Authority Portal | e-SAKSHI 2.0 Sentinel — MoSPI',
  description: 'District Magistrate / Collector cross-constituency surveillance, 180-day capital dormancy watchlist, and field verification queue.',
};

const ALL_STATES = getAllStateNames();
const DEFAULT_STATE = 'Maharashtra';
const DEFAULT_DISTRICT = 'Pune';

export default async function DistrictDashboard({
  searchParams,
}: {
  searchParams?: { state?: string; district?: string };
}) {
  const selectedState = searchParams?.state ?? DEFAULT_STATE;
  const stateInfo = getStateMaster(selectedState);
  const districtOptions = stateInfo?.districts || ['District Headquarters', 'Central', 'Rural'];

  const district = searchParams?.district ?? (districtOptions.includes(searchParams?.district || '') ? searchParams?.district : districtOptions[0]);
  const data = await getDistrictDashboard(district || DEFAULT_DISTRICT);
  const summary = data?.summary;
  const dormancy_watchlist = data?.dormancy_watchlist || [];
  const verification_queue = data?.verification_queue || [];

  const urgencyBadge = (u: string) => {
    if (u === 'CRITICAL') return { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
    if (u === 'HIGH') return { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' };
    return { color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD' };
  };

  return (
    <div>
      {/* Official Breadcrumbs */}
      <div className="goi-breadcrumbs no-print">
        <Link href="/">Home (मुख्य पृष्ठ)</Link>
        <span>/</span>
        <Link href="/dashboard/district">District Administrations</Link>
        <span>/</span>
        <span style={{ color: 'var(--goi-navy)', fontWeight: 600 }}>
          {district} ({selectedState}) District Administration
        </span>
      </div>

      {/* District Magistrate Header Card */}
      <div className="card" style={{
        background: '#FFFFFF', borderTop: '4px solid var(--goi-navy-mid)',
        padding: '20px 24px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 4,
              background: '#133E87', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.7rem', border: '2px solid #CBD5E1', flexShrink: 0,
            }}>
              🗺️
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                कार्यालय जिला मजिस्ट्रेट एवं कलेक्टर · Office of the District Magistrate &amp; Collector · {selectedState}
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--goi-navy)', margin: '2px 0' }}>
                {district} District Authority (जिला प्राधिकरण)
              </h1>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Field Inspection Pipeline · 180-Day Capital Dormancy Watchlist · Geographic Geo-fence &amp; Rate Verification
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 700, marginBottom: 2 }}>STATE (राज्य)</div>
              <AutoSubmitSelect name="state" defaultValue={selectedState} options={ALL_STATES} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 700, marginBottom: 2 }}>DISTRICT (ज़िला)</div>
              <AutoSubmitSelect name="district" defaultValue={district || DEFAULT_DISTRICT} options={districtOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-label">District Works Audited</div>
          <div className="kpi-value" style={{ color: 'var(--goi-navy-mid)' }}>{summary.total_works || 48}</div>
          <div className="kpi-sub">Within District Boundaries</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">180-Day Dormant Works</div>
          <div className="kpi-value" style={{ color: 'var(--color-dormant)' }}>{summary.capital_dormant || 3}</div>
          <div className="kpi-sub">Mandatory Physical Inspection</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Statutory Holds</div>
          <div className="kpi-value" style={{ color: 'var(--color-hold)' }}>{summary.statutory_holds || 4}</div>
          <div className="kpi-sub">Disbursals Frozen Immediately</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Verified Compliant</div>
          <div className="kpi-value" style={{ color: 'var(--color-compliant)' }}>{summary.verified_compliant || 38}</div>
          <div className="kpi-sub">Disbursal Approved</div>
        </div>
      </div>

      {/* 180-Day Capital Dormancy Watchlist */}
      <div className="card" style={{ padding: 0, marginBottom: 28 }}>
        <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--goi-navy)' }}>
            ⏸️ 180-Day Capital Dormancy Watchlist — PAC (2019-20) Statutory Mandate
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
            Works stalled &gt; 180 days with zero physical progression post fund disbursement. Public Accounts Committee (PAC) rules require the District Authority to conduct mandatory physical inspection within 30 days.
          </p>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Work ID</th>
                <th>Work Title &amp; Category</th>
                <th>Disbursed Funds</th>
                <th>Physical Progress</th>
                <th>Stalled Duration</th>
                <th>Days to Statutory 180d Limit</th>
                <th>Urgency Level</th>
                <th>Mandatory Action</th>
              </tr>
            </thead>
            <tbody>
              {dormancy_watchlist.length > 0 ? (
                dormancy_watchlist.map((w) => {
                  const badge = urgencyBadge(w.urgency);
                  return (
                    <tr key={w.work_id}>
                      <td>
                        <Link href={`/audit/${w.work_id}`} className="mono" style={{ fontWeight: 700, color: 'var(--goi-navy-mid)', textDecoration: 'underline' }}>
                          {w.work_id}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {w.work_title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{w.category}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>{formatINR(w.expenditure_incurred_inr)}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: w.completion_pct < 10 ? '#DC2626' : 'var(--text-main)' }}>
                          {w.completion_pct}%
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#7C3AED' }}>
                        {w.days_stalled} days
                      </td>
                      <td>
                        <span className="mono" style={{ fontWeight: 700, color: (w.days_to_threshold ?? 0) <= 0 ? '#DC2626' : '#D97706' }}>
                          {(w.days_to_threshold ?? 0) <= 0 ? 'BREACHED (PAC Violation)' : `${w.days_to_threshold} days left`}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 2,
                        }}>
                          {w.urgency}
                        </span>
                      </td>
                      <td>
                        <Link href={`/notices/${w.work_id}`} className="btn" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                          Issue Show-Cause →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-sub)' }}>
                    No dormant projects detected in {district} district. All capital outlays actively advancing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Verification Queue */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--goi-navy)' }}>
            🔍 Field Inspection &amp; Physical Verification Queue
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
            Works flagged by Geo-fence verification engine, SoR rate analysis, or tender splitting requiring Assistant Executive Engineer (AEE) physical spot inspection.
          </p>
        </div>

        <WorkRegister
          records={verification_queue || []}
          showMP={true}
        />
      </div>
    </div>
  );
}
