import { getAuditDocket } from '@/lib/api';
import { WorkRegister } from '@/components/WorkRegister';
import { Sidebar } from '@/components/Sidebar';
import { getAllStateNames } from '@/lib/panIndiaMaster';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Full Audit Docket (लेखापरीक्षा रजिस्टर) | e-SAKSHI 2.0 Sentinel — MoSPI',
  description: 'Pan-India MPLADS surveillance audit register — risk scores, statutory verdicts, rule violations, and hierarchical outlier diagnostics.',
};

interface PageProps {
  searchParams?: {
    outliers_only?: string;
    verdict?: string;
    state?: string;
    mp_id?: string;
    min_risk?: string;
  };
}

export default async function AuditPage({ searchParams }: PageProps) {
  const outliersOnly = searchParams?.outliers_only === 'true' || searchParams?.outliers_only === 'on';

  const records = await getAuditDocket({
    verdict:        searchParams?.verdict,
    state:          searchParams?.state,
    mp_id:          searchParams?.mp_id,
    min_risk_score: searchParams?.min_risk ? parseFloat(searchParams.min_risk) : undefined,
    outliers_only:  outliersOnly,
    limit:          300,
  });

  const verdicts = ['STATUTORY HOLD', 'COMPLIANCE INQUIRY', 'CAPITAL DORMANT', 'VERIFIED COMPLIANT'];
  const allStates = getAllStateNames();

  const outlierCount = records.filter(r => r.is_statistical_outlier || r.is_extreme_outlier).length;

  return (
    <div>
      {/* Official Breadcrumbs */}
      <div className="goi-breadcrumbs no-print">
        <Link href="/">Home (मुख्य पृष्ठ)</Link>
        <span>/</span>
        <span style={{ color: 'var(--goi-navy)', fontWeight: 600 }}>Parliamentary Surveillance Audit Register (अखिल भारतीय लेखापरीक्षा रजिस्टर)</span>
      </div>

      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <div className="card" style={{ borderTop: '4px solid var(--goi-navy)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--goi-navy)', marginBottom: 4 }}>
                  📋 Pan-India Scheme Audit Docket (संपूर्ण भारतीय योजना रजिस्टर)
                </h1>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  Total Audited Records: <strong>{records.length} Works</strong> · Pan-India Coverage (All 36 States &amp; UTs) · State-Conditioned Outlier Analysis
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-hold">39 Holds</span>
                <span className="badge badge-inquiry">80 Inquiries</span>
                <span className="badge badge-dormant">10 Dormant</span>
                {outlierCount > 0 && (
                  <span style={{
                    background: '#EDE9FE', color: '#6D28D9', border: '1px solid #C4B5FD',
                    fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 3,
                  }}>
                    🎯 {outlierCount} Statistical Outliers
                  </span>
                )}
              </div>
            </div>

            {/* Official Filter Bar */}
            <form method="GET" style={{
              display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
              marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-light)',
            }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: 2 }}>VERDICT (निर्णय)</label>
                <select name="verdict" defaultValue={searchParams?.verdict ?? ''}>
                  <option value="">All Verdicts (सभी निर्णय)</option>
                  {verdicts.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: 2 }}>STATE / UT (राज्य / संघ राज्य)</label>
                <select name="state" defaultValue={searchParams?.state ?? ''}>
                  <option value="">All 36 States &amp; UTs (समस्त भारत)</option>
                  {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: 2 }}>MIN RISK SCORE</label>
                <input
                  type="text"
                  name="min_risk"
                  placeholder="Min score (0-100)"
                  defaultValue={searchParams?.min_risk ?? ''}
                  style={{ width: 140 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#6D28D9' }}>
                  <input
                    type="checkbox"
                    name="outliers_only"
                    value="true"
                    defaultChecked={outliersOnly}
                  />
                  <span>Outliers Only (सांख्यिकीय आउटलायर)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <button type="submit" className="btn btn-primary btn-sm">Apply Filter</button>
                <Link href="/audit" className="btn btn-ghost btn-sm">Reset</Link>
              </div>
            </form>
          </div>

          <WorkRegister records={records} showMP showDistrict />
        </main>
      </div>
    </div>
  );
}
