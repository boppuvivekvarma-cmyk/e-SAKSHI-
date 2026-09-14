import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'e-SAKSHI 2.0 Sentinel | Government of India — MoSPI',
  description: 'Official AI-Powered Parliamentary Vigilance, Anomaly & Fraud Detection Portal for MPLADS — Ministry of Statistics and Programme Implementation (MoSPI).',
};

const ROLES = [
  {
    href: '/dashboard/mp',
    icon: '🏛️',
    color: '#0B2545',
    tag: 'सांसद पोर्टल',
    title: 'Member of Parliament (MP)',
    sub: 'Constituency work portfolio, fund utilisation tracking, statutory anomaly notices & show-cause letter generator.',
    action: 'Access MP Portal (सांसद लॉगिन) →',
  },
  {
    href: '/dashboard/district',
    icon: '🗺️',
    color: '#133E87',
    tag: 'जिला प्राधिकरण',
    title: 'District Authority / Collector',
    sub: 'Cross-constituency surveillance, 180-day capital dormancy watchlist, field inspection verification queue.',
    action: 'Access District Portal (जिला लॉगिन) →',
  },
  {
    href: '/dashboard/state',
    icon: '🏢',
    color: '#0D5E05',
    tag: 'राज्य नोडल प्राधिकरण',
    title: 'State Nodal Authority (SNA)',
    sub: 'State-wide contractor risk ranking (KMeans ML), cross-district compliance comparison, category deviations.',
    action: 'Access State Portal (राज्य लॉगिन) →',
  },
  {
    href: '/dashboard/ministry',
    icon: '🇮🇳',
    color: '#D85A00',
    tag: 'मंत्रालय (MoSPI / DIID)',
    title: 'Ministry (MoSPI / DIID)',
    sub: 'National heat-map, 90-day predictive dormancy forecasting, quarterly trend forecasting & PAC compliance.',
    action: 'Access National Directorate →',
  },
];

const NATIONAL_METRICS = [
  { label: 'Total Works Audited', value: '490', sub: 'Across 5 Pilot States', color: '#0B2545' },
  { label: 'Total Funds Sanctioned', value: '₹192.17 Cr', sub: '55.0% Overall Utilisation', color: '#133E87' },
  { label: 'Statutory Holds Issued', value: '39 Works', sub: 'Immediate Disbursal Freeze', color: '#DC2626' },
  { label: 'Dormancy Watchlist', value: '10 Works', sub: 'Stalled > 180 Days (PAC Rule)', color: '#7C3AED' },
  { label: 'Verified Compliant', value: '361 Works', sub: 'Clean Public Expenditure', color: '#16A34A' },
];

const STATUTES = [
  {
    code: 'GFR 2017 Rule 149',
    title: 'Schedule of Rates (SoR) Overrun',
    desc: 'Flags estimated costs exceeding local PWD/CPWD benchmark rates by over 20%.',
    badge: 'ENGINE 2',
  },
  {
    code: 'CVC Circular 04/2021',
    title: 'Tender Splitting & Collusion',
    desc: 'Identifies artificial contract fragmentation clustered just below mandatory e-tendering limits.',
    badge: 'ENGINE 3',
  },
  {
    code: 'MPLADS 2023 §11.2',
    title: '180-Day Capital Dormancy',
    desc: 'Surveillance of zero physical progression (>180 days) post fund disbursement.',
    badge: 'ENGINE 5',
  },
  {
    code: 'GFR 2017 Rule 230',
    title: 'Expenditure-Progress Mismatch',
    desc: 'Detects advance payments where disbursed funds significantly exceed verified physical progress.',
    badge: 'ENGINE 6',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Official Government Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0B2545 0%, #133E87 100%)',
        color: '#FFFFFF',
        padding: '36px 40px',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '6px solid var(--goi-saffron)',
      }}>
        <div style={{ maxWidth: 850 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255, 153, 51, 0.15)', border: '1px solid rgba(255, 153, 51, 0.4)',
            color: '#FFB86C', padding: '4px 10px', borderRadius: 3, fontSize: '0.75rem',
            fontWeight: 700, letterSpacing: '0.05em', marginBottom: 12,
          }}>
            🇮🇳 भारत सरकार · सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}>
            e-SAKSHI 2.0 Sentinel — Parliamentary Vigilance Portal
          </h1>
          <p style={{ color: '#E2E8F0', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 18 }}>
            AI-Powered Anomaly, Fraud &amp; Inefficiency Detection Platform for the Member of Parliament Local Area Development Scheme (MPLADS).
            Integrating 9 Deterministic Rule Engines, Isolation Forest ML, KMeans Contractor Risk Clustering, and Automated Parliamentary Reference Notice Generation.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/audit" className="btn btn-saffron">
              📋 Inspect Full Audit Docket (490 Works)
            </Link>
            <Link href="/alerts" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFF', borderColor: 'rgba(255,255,255,0.3)' }}>
              🔔 View Real-time Statutory Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* National Scheme Surveillance Ribbon */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--goi-navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 National Scheme Surveillance Summary <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 500 }}>(राष्ट्रीय सारांश)</span>
          </h2>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>Data As of: September 2026</span>
        </div>

        <div className="kpi-grid">
          {NATIONAL_METRICS.map((m) => (
            <div key={m.label} className="kpi-card" style={{ borderTopColor: m.color }}>
              <div className="kpi-label">{m.label}</div>
              <div className="kpi-value" style={{ color: m.color }}>{m.value}</div>
              <div className="kpi-sub">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Role-Based Portals (Clean Institutional Grid) */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--goi-navy)', marginBottom: 14 }}>
          🏛️ Role-Based Portals — Select Authority to Enter
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {ROLES.map((r) => (
            <div key={r.href} className="card" style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              borderTop: `4px solid ${r.color}`, margin: 0, padding: '22px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: '2rem' }}>{r.icon}</span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, background: '#F1F5F9',
                    color: '#475569', padding: '3px 8px', borderRadius: 3, border: '1px solid #CBD5E1',
                  }}>
                    {r.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--goi-navy)', marginBottom: 8 }}>
                  {r.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>
                  {r.sub}
                </p>
              </div>

              <Link href={r.href} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {r.action}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory & Legal Framework Grid */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div className="card-title">
            📜 Statutory Auditing Framework &amp; GFR Citations
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
            Compliant with GFR 2017 · CVC Guidelines · PAC Reports
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {STATUTES.map((s) => (
            <div key={s.code} style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--goi-navy-mid)' }}>{s.code}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#E2E8F0', padding: '2px 6px', borderRadius: 2 }}>{s.badge}</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--goi-navy)', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
