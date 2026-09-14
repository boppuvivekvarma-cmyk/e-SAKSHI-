import { getWorkAudit, formatINR } from '@/lib/api';
import { Sidebar } from '@/components/Sidebar';
import { RiskBadge } from '@/components/RiskBadge';
import { AnomalyDossier } from '@/components/AnomalyDossier';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work Audit | e-SAKSHI 2.0 Sentinel',
  description: 'Detailed audit record for a single MPLADS work.',
};

const FLAG_LABELS: Record<string, string> = {
  flag_duplicate_work:       'Spatial-Semantic Duplicate Work',
  flag_sor_inflated:         'Cost Above Schedule of Rates',
  flag_tender_splitting:     'Procurement Irregularity — Tender Splitting',
  flag_geo_tampering:        'Geofence Verification Failure',
  flag_parked_funds:         'Capital Dormancy — Parked Funds',
  flag_expenditure_mismatch: 'Expenditure-Progress Mismatch',
  flag_no_physical_evidence: 'No Physical Evidence of Asset Creation',
  flag_category_deviation:   'Category Consistency Violation',
  flag_recycled_photo:       'Before/After Photo Progression Failure',
};

interface PageProps {
  params: {
    workId: string;
  };
}

export default async function WorkAuditPage({ params }: PageProps) {
  const record = await getWorkAudit(params?.workId ?? 'WRK00001');
  const recordMap = record as Record<string, any>;
  const activeFlags = Object.entries(FLAG_LABELS)
    .filter(([col]) => Boolean(recordMap[col]))
    .map(([, label]) => label);

  const fields = [
    ['Work ID',          record.work_id],
    ['MP',               record.mp_name],
    ['Constituency',     record.constituency],
    ['State / District', `${record.state} / ${record.district}`],
    ['Category',         record.category],
    ['Vendor',           record.vendor_name],
    ['Sanction Date',    record.sanction_date],
    ['Estimated Cost',   formatINR(record.estimated_cost_inr)],
    ['Disbursed',        formatINR(record.expenditure_incurred_inr)],
    ['Completion',       `${record.completion_pct}%`],
    ['Status',           record.work_status],
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="fade-in">
          <div style={{ marginBottom: 20, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Link href="/audit" style={{ color: 'var(--color-saffron)' }}>← Audit Docket</Link>
            {' '} / {record.work_id}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
            <div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{record.work_id}</div>
              <h1 style={{ marginBottom: 4, fontSize: '1.4rem' }}>{record.work_title}</h1>
              <p>{record.category} · {record.mp_name} · {record.constituency}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
              <RiskBadge verdict={record.verdict} score={record.risk_score} showScore />
              {record.verdict !== 'VERIFIED COMPLIANT' && (
                <Link href={`/notices/${record.work_id}`} className="btn btn-primary btn-sm">🖨️ Print Notice</Link>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 16 }}>Work Details</div>
              <div className="table-wrapper">
                <table>
                  <tbody>
                    {fields.map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ fontWeight: 600, color: 'var(--text-secondary)', width: '40%', fontSize: '0.8rem', padding: '10px 16px' }}>{k}</td>
                        <td style={{ color: 'var(--text-primary)', fontSize: '0.85rem', padding: '10px 16px' }}>{v ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <div className="card-header">
                  <span style={{ color: 'var(--color-hold)' }}>⚠</span>
                  <span className="card-title">Active Flags ({activeFlags.length})</span>
                </div>
                {activeFlags.length === 0 ? (
                  <div style={{ color: 'var(--color-green)', fontSize: '0.82rem' }}>✓ No flags — work is fully compliant</div>
                ) : (
                  <div className="flags-list">
                    {activeFlags.map(f => <span key={f} className="flag-chip">{f}</span>)}
                  </div>
                )}
              </div>

              <AnomalyDossier
                dossier={record.statutory_dossier || ''}
                verdict={record.verdict}
                flags={activeFlags}
                recommended_action={
                  record.verdict === 'STATUTORY HOLD'
                    ? 'IMMEDIATE ACTION REQUIRED: Suspend further fund disbursement pending inquiry.'
                    : record.verdict === 'COMPLIANCE INQUIRY'
                    ? 'Request documentation from implementing agency within 15 days.'
                    : record.verdict === 'CAPITAL DORMANT'
                    ? 'Issue formal notice to implementing agency for completion within 60 days.'
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
