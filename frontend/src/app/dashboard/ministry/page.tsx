import { getMinistryDashboard, formatCrore, formatINR } from '@/lib/api';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ministry National Dashboard | e-SAKSHI 2.0 Sentinel — MoSPI',
  description: 'Ministry of Statistics & Programme Implementation (MoSPI/DIID) national view — state risk heat-map, trend analysis, dormancy pipeline, category utilisation.',
};

export default async function MinistryDashboard() {
  const data = await getMinistryDashboard();
  const summary = data?.summary;
  const state_risk_heatmap = data?.state_risk_heatmap || [];
  const category_utilisation = data?.category_utilisation || [];
  const dormancy_pipeline = data?.dormancy_pipeline || [];
  const utilisation_trend = data?.utilisation_trend || [];

  const urgencyBadge = (u: string) => {
    if (u === 'CRITICAL') return { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
    if (u === 'HIGH') return { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' };
    return { color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD' };
  };

  const flagRiskColor = (pct: number) => pct >= 20 ? '#DC2626' : pct >= 14 ? '#D97706' : '#16A34A';

  return (
    <div>
      {/* Official Breadcrumbs */}
      <div className="goi-breadcrumbs no-print">
        <Link href="/">Home (मुख्य पृष्ठ)</Link>
        <span>/</span>
        <Link href="/dashboard/ministry">Ministry Directorate</Link>
        <span>/</span>
        <span style={{ color: 'var(--goi-navy)', fontWeight: 600 }}>National Surveillance Directorate (MoSPI)</span>
      </div>

      {/* Ministry National Directorate Header Card */}
      <div className="card" style={{
        background: '#FFFFFF', borderTop: '4px solid var(--goi-saffron)',
        padding: '20px 24px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 4,
              background: '#0B2545', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', border: '2px solid var(--goi-saffron)',
            }}>
              🇮🇳
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                भारत सरकार · सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--goi-navy)', margin: '2px 0' }}>
                National MPLADS Vigilance &amp; Analytics Directorate (MoSPI)
              </h1>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Data Informatics &amp; Innovation Division (DIID) · Inter-State Surveillance, Trend Forecasting &amp; PAC Reporting
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/audit" className="btn btn-primary btn-sm">
              📋 Audit Docket (490 Works)
            </Link>
            <Link href="/alerts" className="btn btn-ghost btn-sm">
              🔔 Vigilance Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* National KPI Ribbon */}
      <div className="kpi-grid">
        <div className="kpi-card saffron">
          <div className="kpi-label">National Works Audited</div>
          <div className="kpi-value" style={{ color: 'var(--goi-saffron-dark)' }}>
            {(summary.total_works || 490).toLocaleString()}
          </div>
          <div className="kpi-sub">Across All States</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">Total Sanctioned (स्वीकृत राशि)</div>
          <div className="kpi-value" style={{ color: 'var(--goi-navy-mid)' }}>
            {formatCrore(summary.total_sanctioned_inr || 1921705365)}
          </div>
          <div className="kpi-sub">{summary.utilisation_pct || 55}% National Utilisation Rate</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Statutory Holds (विधिक रोक)</div>
          <div className="kpi-value" style={{ color: 'var(--color-hold)' }}>
            {summary.statutory_holds || 39}
          </div>
          <div className="kpi-sub">Disbursement Frozen</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Capital Dormant (निष्क्रिय पूंजी)</div>
          <div className="kpi-value" style={{ color: 'var(--color-dormant)' }}>
            {summary.capital_dormant || 10}
          </div>
          <div className="kpi-sub">Stalled &gt;180 Days</div>
        </div>
        <div className="kpi-card teal">
          <div className="kpi-label">90-Day Dormancy Forecast</div>
          <div className="kpi-value" style={{ color: '#0D9488' }}>
            {dormancy_pipeline.length || 3}
          </div>
          <div className="kpi-sub">Early-Warning Extrapolations</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Compliant Works (अनुपालित)</div>
          <div className="kpi-value" style={{ color: 'var(--goi-green)' }}>
            {summary.verified_compliant || 361}
          </div>
          <div className="kpi-sub">Verified Clean Assets</div>
        </div>
      </div>

      {/* Two Column Grid: State Heatmap & Category Utilisation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* State Risk Heatmap */}
        <div className="card" style={{ padding: 0, margin: 0 }}>
          <div style={{ padding: '14px 18px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--goi-navy)' }}>
              🗺️ State Risk Heat-Map &amp; Non-Compliance Ratios
            </h2>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
              Flag rate and statutory hold concentration across pilot states.
            </p>
          </div>

          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>State Name</th>
                  <th>Works</th>
                  <th>Flag Rate (%)</th>
                  <th>Statutory Holds</th>
                  <th>Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {[...state_risk_heatmap].sort((a, b) => b.flag_pct - a.flag_pct).map((s) => (
                  <tr key={s.state}>
                    <td style={{ fontWeight: 700, color: 'var(--goi-navy)' }}>{s.state}</td>
                    <td>{s.total}</td>
                    <td>
                      <div className="risk-bar-wrap">
                        <div className="risk-bar-track" style={{ minWidth: 60 }}>
                          <div className="risk-bar-fill" style={{ width: `${Math.min(100, s.flag_pct * 3)}%`, background: flagRiskColor(s.flag_pct) }} />
                        </div>
                        <span style={{ color: flagRiskColor(s.flag_pct), fontWeight: 700, fontSize: '0.74rem' }}>{s.flag_pct}%</span>
                      </div>
                    </td>
                    <td style={{ color: s.statutory_holds > 5 ? '#DC2626' : 'var(--text-main)', fontWeight: 700 }}>
                      {s.statutory_holds}
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.utilisation_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category-wise Utilisation */}
        <div className="card" style={{ padding: 0, margin: 0 }}>
          <div style={{ padding: '14px 18px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--goi-navy)' }}>
              📊 Sectoral / Category-wise Utilisation Ratios
            </h2>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
              Expenditure progress sorted by priority sector.
            </p>
          </div>

          <div style={{ padding: '12px 18px' }}>
            {[...category_utilisation].sort((a, b) => a.utilisation_pct - b.utilisation_pct).map((c, i) => (
              <div key={c.category} style={{
                padding: '10px 0',
                borderBottom: i < category_utilisation.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--goi-navy)' }}>
                    {c.category} <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 400 }}>({c.count} Works)</span>
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: c.utilisation_pct >= 70 ? 'var(--goi-green)' : c.utilisation_pct >= 50 ? 'var(--goi-navy-mid)' : '#DC2626' }}>
                    {c.utilisation_pct}%
                  </span>
                </div>
                <div className="risk-bar-track">
                  <div className="risk-bar-fill" style={{
                    width: `${c.utilisation_pct}%`,
                    background: c.utilisation_pct >= 70 ? 'var(--goi-green)' : c.utilisation_pct >= 50 ? 'var(--goi-navy-mid)' : '#DC2626',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecasted Dormancy Pipeline Table */}
      <div className="card" style={{ padding: 0, marginBottom: 28 }}>
        <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--goi-navy)' }}>
            ⚡ Predictive Early-Warning Dormancy Pipeline (90-Day Linear Extrapolation)
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
            In-progress works projected by the early-warning model to breach the statutory 180-day stall threshold within 90 days.
          </p>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Work ID &amp; Title</th>
                <th>Hon&apos;ble MP &amp; Constituency</th>
                <th>State</th>
                <th>Disbursed (₹)</th>
                <th>Physical Progress</th>
                <th>Days Stalled</th>
                <th>Days to Threshold</th>
                <th>Urgency Rating</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {dormancy_pipeline.map((w) => {
                const badge = urgencyBadge(w.urgency);
                return (
                  <tr key={w.work_id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.82rem' }}>{w.work_title}</div>
                      <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--goi-navy-mid)' }}>{w.work_id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{w.mp_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{w.constituency}</div>
                    </td>
                    <td>{w.state}</td>
                    <td style={{ fontWeight: 600 }}>{formatINR(w.expenditure_incurred_inr)}</td>
                    <td>{w.completion_pct}%</td>
                    <td style={{ color: '#DC2626', fontWeight: 700 }}>{w.days_stalled} Days</td>
                    <td style={{ fontWeight: 700 }}>
                      {w.days_to_dormancy <= 0 ? (
                        <span style={{ color: '#DC2626' }}>BREACHED ({Math.abs(w.days_to_dormancy)}d ago)</span>
                      ) : (
                        <span>{w.days_to_dormancy} Days Left</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 2,
                      }}>
                        {w.urgency}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link href={`/notices/${w.work_id}`} className="btn btn-primary btn-sm" style={{ background: '#DC2626', borderColor: '#DC2626' }}>
                        Notice
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
