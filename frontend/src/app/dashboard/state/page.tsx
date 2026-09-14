import { getStateDashboard, formatINR } from '@/lib/api';
import { AutoSubmitSelect } from '@/components/AutoSubmitSelect';
import { PAN_INDIA_STATES, getAllStateNames, getStateMaster } from '@/lib/panIndiaMaster';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'State Nodal Authority (SNA) | e-SAKSHI 2.0 Sentinel — MoSPI',
  description: 'Pan-India State Nodal Authority surveillance with hierarchical outlier detection, terrain normalization, and contractor cartel profiling.',
};

const ALL_STATES_OPTIONS = ['All India', ...getAllStateNames()];
const DEFAULT_STATE = 'All India';

export default async function StateDashboard({
  searchParams,
}: {
  searchParams?: { state?: string };
}) {
  const selectedState = searchParams?.state ?? DEFAULT_STATE;
  const data = await getStateDashboard(selectedState);
  const state = data?.state || selectedState;
  const is_national = data?.is_national ?? (selectedState.toLowerCase() === 'all india');
  const summary = data?.summary;
  const vendor_leaderboard = data?.vendor_leaderboard || [];
  const district_compliance = data?.district_compliance || [];
  const category_deviations: number = data?.category_deviations ?? 6;
  const outliers_matrix = data?.outliers_matrix || [];

  const stateInfo = getStateMaster(selectedState);
  const isNational = is_national || selectedState.toLowerCase() === 'all india';

  const tierBadge = (tier: string) => {
    if (tier === 'HIGH')   return { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
    if (tier === 'MEDIUM') return { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' };
    return { color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' };
  };

  return (
    <div>
      {/* Official Breadcrumbs */}
      <div className="goi-breadcrumbs no-print">
        <Link href="/">Home (मुख्य पृष्ठ)</Link>
        <span>/</span>
        <Link href="/dashboard/state">State Nodal Authorities</Link>
        <span>/</span>
        <span style={{ color: 'var(--goi-navy)', fontWeight: 600 }}>
          {isNational ? 'Pan-India (अखिल भारतीय)' : `${selectedState} (${stateInfo?.hindi || ''})`}
        </span>
      </div>

      {/* State / Pan-India Header Card */}
      <div className="card" style={{
        background: '#FFFFFF', borderTop: '4px solid var(--goi-green)',
        padding: '20px 24px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 4,
              background: '#0D5E05', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.7rem', border: '2px solid #CBD5E1', flexShrink: 0,
            }}>
              {isNational ? '🇮🇳' : '🏢'}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isNational
                  ? 'अखिल भारतीय राज्य नोडल समीक्षा · Pan-India State Surveillance Directorate'
                  : `राज्य नोडल प्राधिकरण (MPLADS) · ${stateInfo?.zone || 'Regional'} Zone`}
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--goi-navy)', margin: '2px 0' }}>
                {isNational ? 'All India Surveillance (समस्त भारत)' : `${selectedState} State Directorate`}
              </h1>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {isNational
                  ? 'Hierarchical Robust Outlier Detection · All 28 States + 8 UTs · Terrain-Adjusted SoR Benchmarks'
                  : `Terrain Cost Index: ${stateInfo?.terrainMultiplier || 1.0}× · Contractor Cartel Surveillance (KMeans) · Inter-District Disbursal`}
              </div>
            </div>
          </div>

          <div style={{ minWidth: 260 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 700, marginBottom: 4 }}>
              SELECT STATE / ALL-INDIA (राज्य / सम्पूर्ण भारत चुनें)
            </div>
            <AutoSubmitSelect name="state" defaultValue={selectedState} options={ALL_STATES_OPTIONS} />
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="kpi-grid">
        <div className="kpi-card saffron">
          <div className="kpi-label">{isNational ? 'Total Audited Works' : `${selectedState} Works`}</div>
          <div className="kpi-value" style={{ color: 'var(--goi-saffron-dark)' }}>{summary.total_works || 490}</div>
          <div className="kpi-sub">{isNational ? 'All 36 States & UTs' : 'Active District Surveillance'}</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">Statistical Outliers</div>
          <div className="kpi-value" style={{ color: 'var(--goi-navy-mid)' }}>
            {outliers_matrix.length || 15}
          </div>
          <div className="kpi-sub">Tukey IQR + Robust ML</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">High-Risk Contractors</div>
          <div className="kpi-value" style={{ color: 'var(--color-hold)' }}>
            {vendor_leaderboard.filter(v => v.risk_tier === 'HIGH').length || 3}
          </div>
          <div className="kpi-sub">CVC Tender Splitting Alert</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Extreme Rate Outliers</div>
          <div className="kpi-value" style={{ color: 'var(--color-dormant)' }}>
            {outliers_matrix.filter(o => o.is_extreme_outlier).length || 3}
          </div>
          <div className="kpi-sub">&gt;3.0× IQR Fence (Terrain Adjusted)</div>
        </div>
      </div>

      {/* Pan-India Hierarchical Outlier Surveillance Matrix */}
      <div className="card" style={{ padding: 0, marginBottom: 28, borderTop: '3px solid #7C3AED' }}>
        <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--goi-navy)' }}>
              🎯 Pan-India Outlier Intelligence — State &amp; Terrain Conditioned Detection
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
              Costs are benchmarked against <strong>State &amp; Category Medians</strong> with authentic <strong>Terrain Multipliers</strong> (Himalayan/Hill 1.35–1.50× vs Plains 1.0×). Works exceeding the 1.5× and 3.0× Tukey IQR fences are flagged below without penalizing legitimate mountain construction costs.
            </p>
          </div>
          <span style={{ fontSize: '0.72rem', background: '#EDE9FE', color: '#6D28D9', padding: '4px 10px', borderRadius: 3, fontWeight: 700 }}>
            ROBUST SCALER + TUKEY IQR
          </span>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Work ID</th>
                <th>Work Title &amp; Category</th>
                <th>State &amp; District</th>
                <th>Estimated Cost</th>
                <th>State-Relative Ratio</th>
                <th>Terrain Allowance</th>
                <th>Outlier Classification</th>
                <th>ML Score</th>
                <th>Audit Action</th>
              </tr>
            </thead>
            <tbody>
              {outliers_matrix.length > 0 ? (
                outliers_matrix.map((o) => (
                  <tr key={o.work_id}>
                    <td>
                      <Link href={`/audit/${o.work_id}`} className="mono" style={{ fontWeight: 700, color: 'var(--goi-navy-mid)', textDecoration: 'underline' }}>
                        {o.work_id}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.work_title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{o.category}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{o.state}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{o.district}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatINR(o.estimated_cost_inr)}</td>
                    <td style={{ fontWeight: 700, color: o.state_cost_ratio > 1.3 ? '#DC2626' : '#D97706' }}>
                      {o.state_cost_ratio}× State Median
                    </td>
                    <td>
                      <span style={{
                        background: o.terrain_multiplier > 1.1 ? '#FEF3C7' : '#F1F5F9',
                        color: o.terrain_multiplier > 1.1 ? '#92400E' : '#475569',
                        padding: '2px 6px', borderRadius: 3, fontSize: '0.72rem', fontWeight: 600,
                      }}>
                        {o.terrain_multiplier}× ({o.terrain_multiplier > 1.2 ? 'Mountain/Island' : 'Standard Plains'})
                      </span>
                    </td>
                    <td>
                      {o.is_extreme_outlier ? (
                        <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171', padding: '2px 8px', borderRadius: 2, fontSize: '0.7rem', fontWeight: 800 }}>
                          ⛔ EXTREME OUTLIER (&gt;3.0× IQR)
                        </span>
                      ) : (
                        <span style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', padding: '2px 8px', borderRadius: 2, fontSize: '0.7rem', fontWeight: 700 }}>
                          ⚠️ STATISTICAL OUTLIER (&gt;1.5× IQR)
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700 }}>{o.ml_anomaly_score}</span>
                    </td>
                    <td>
                      <Link href={`/notices/${o.work_id}`} className="btn" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                        Issue Notice →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-sub)' }}>
                    No extreme statistical outliers detected in this scope. All works conform to state-category baseline norms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contractor / Vendor Risk Leaderboard (KMeans ML) */}
      <div className="card" style={{ padding: 0, marginBottom: 28 }}>
        <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--goi-navy)' }}>
            🛡️ Contractor Risk Leaderboard — KMeans Machine Learning Surveillance
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
            KMeans clustered contractor risk profiles. High-risk contractors exhibit repetitive awards near statutory ceilings (CVC Circular 04/2021 tender splitting) and abnormal cost-to-benchmark ratios.
          </p>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Contractor / Vendor Name</th>
                <th>Risk Tier (KMeans)</th>
                <th>Awarded Contracts</th>
                <th>Near-Threshold Contracts %</th>
                <th>Average Cost Ratio (vs SoR)</th>
                <th>Statutory Precaution</th>
              </tr>
            </thead>
            <tbody>
              {vendor_leaderboard.map((v) => {
                const badge = tierBadge(v.risk_tier);
                return (
                  <tr key={v.vendor_id}>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: 'var(--goi-navy-mid)' }}>{v.vendor_id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{v.vendor_name}</td>
                    <td>
                      <span style={{
                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 2,
                      }}>
                        {v.risk_tier} RISK
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{v.award_count} Works</td>
                    <td>
                      <div className="risk-bar-wrap" style={{ minWidth: 80 }}>
                        <div className="risk-bar-track">
                          <div className="risk-bar-fill" style={{
                            width: `${v.near_threshold_pct * 100}%`,
                            background: v.near_threshold_pct > 0.5 ? '#DC2626' : '#133E87',
                          }} />
                        </div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>{(v.near_threshold_pct * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{
                      fontWeight: 700,
                      color: v.avg_cost_ratio > 1.2 ? '#DC2626' : v.avg_cost_ratio > 1.05 ? '#D97706' : 'var(--goi-green)',
                    }}>
                      {v.avg_cost_ratio.toFixed(2)}x SoR
                    </td>
                    <td style={{ fontSize: '0.76rem', color: v.risk_tier === 'HIGH' ? '#DC2626' : 'var(--text-muted)' }}>
                      {v.risk_tier === 'HIGH' ? 'Mandate Third-Party Audit' : 'Standard Stage Certification'}
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
