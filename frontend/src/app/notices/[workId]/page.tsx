import { getNoticeData, formatINR } from '@/lib/api';
import { Sidebar } from '@/components/Sidebar';
import { PrintButton } from '@/components/PrintButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Statutory Notice | e-SAKSHI 2.0 Sentinel',
  description: 'Printable Parliamentary Reference Notice and Show-Cause Letter for flagged MPLADS works.',
};

interface PageProps {
  params: {
    workId: string;
  };
}

export default async function NoticePage({ params }: PageProps) {
  const notice = await getNoticeData(params?.workId ?? 'WRK00001');

  const verdictColor =
    notice.verdict === 'STATUTORY HOLD'     ? '#ef4444' :
    notice.verdict === 'CAPITAL DORMANT'    ? '#8b5cf6' :
    notice.verdict === 'COMPLIANCE INQUIRY' ? '#f59e0b' : '#22c55e';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="fade-in no-print" style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <PrintButton />
          <a href="/audit" className="btn btn-ghost">← Back to Audit</a>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            A4 print-ready · Parliamentary Reference Notice + Show-Cause Letter
          </span>
        </div>

        <div className="notice-page" style={{
          background: '#fff', color: '#000',
          fontFamily: 'Georgia, serif',
          maxWidth: 800, margin: '0 auto',
          padding: '48px 60px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          borderRadius: 4,
        }}>
          {/* Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '3px double #1a237e', paddingBottom: 20, marginBottom: 24 }}>
            <img
              src="/emblem-of-india.svg"
              alt="State Emblem of India"
              style={{
                height: '62px',
                width: 'auto',
                margin: '0 auto 10px',
                display: 'block',
              }}
            />
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: '#555', marginBottom: 4 }}>GOVERNMENT OF INDIA</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a237e', letterSpacing: '0.04em' }}>
              MEMBER OF PARLIAMENT LOCAL AREA DEVELOPMENT SCHEME
            </div>
            <div style={{ fontSize: '0.8rem', color: '#555', marginTop: 4 }}>e-SAKSHI 2.0 Sentinel — AI Compliance Monitor</div>
          </div>

          {/* Document type + verdict stamp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a237e', marginBottom: 4 }}>
                Parliamentary Reference Notice
              </div>
              <div style={{ fontSize: '0.8rem', color: '#555' }}>
                Ref: e-SAKSHI/{notice.work_id}/2024<br />
                Date: {notice.notice_date}
              </div>
            </div>
            <div style={{ padding: '10px 20px', border: `2px solid ${verdictColor}`, textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#555', marginBottom: 4, letterSpacing: '0.08em' }}>COMPLIANCE VERDICT</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: verdictColor }}>{notice.verdict}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: verdictColor }}>{notice.risk_score}/100</div>
              <div style={{ fontSize: '0.6rem', color: '#777' }}>Risk Score</div>
            </div>
          </div>

          {/* Addressee */}
          <div style={{ background: '#f5f5f5', padding: '16px 20px', marginBottom: 24, borderLeft: '4px solid #1a237e' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>To,</div>
            <div>The District Magistrate / Collector</div>
            <div style={{ fontWeight: 600 }}>{notice.district} District, {notice.state}</div>
            <br />
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Through,</div>
            <div>The State Nodal Authority (MPLADS), {notice.state}</div>
            <div>The Ministry of Statistics &amp; Programme Implementation (MoSPI/DIID), New Delhi</div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 20 }}>
            <strong>Subject:</strong> Compliance Notice — MPLADS Work{' '}
            <code style={{ fontSize: '0.85em', background: '#f0f0f0', padding: '2px 6px', borderRadius: 3 }}>{notice.work_id}</code>
            {' '}— {notice.work_title}
          </div>

          {/* Reference */}
          <div style={{ marginBottom: 20, fontSize: '0.9rem', color: '#333' }}>
            <strong>Reference:</strong> MPLADS Guidelines 2023; GFR 2017; CVC Circular 04/2021; PAC Report (2019-20); CAG Report No. 12/2022
          </div>

          {/* Body */}
          <p style={{ lineHeight: 1.9, marginBottom: 16, fontSize: '0.9rem', color: '#222' }}>
            The automated compliance analysis system (e-SAKSHI 2.0 Sentinel) has identified one or more
            irregularities in the above-referenced MPLADS work sanctioned under the recommendation of
            <strong> {notice.mp_name}</strong>, Member of Parliament, <strong>{notice.constituency}</strong> constituency.
          </p>

          {/* Work Details Table */}
          <div style={{ marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#1a237e', color: '#fff' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Particulars</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Work ID',              notice.work_id],
                  ['Work Title',           notice.work_title],
                  ['Category',             notice.category],
                  ['Implementing Vendor',  notice.vendor_name],
                  ['Sanction Date',        notice.sanction_date],
                  ['Estimated Cost',       formatINR(notice.estimated_cost_inr)],
                  ['Expenditure Incurred', formatINR(notice.expenditure_incurred_inr)],
                  ['Physical Completion',  `${notice.completion_pct}%`],
                  ['Current Status',       notice.work_status],
                ].map(([k, v], i) => (
                  <tr key={k} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '7px 12px', fontWeight: 600, borderBottom: '1px solid #ddd', color: '#333' }}>{k}</td>
                    <td style={{ padding: '7px 12px', borderBottom: '1px solid #ddd', color: '#111' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Flags */}
          {notice.flags && notice.flags.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.9rem', color: '#c00' }}>⚠ Anomalies / Violations Detected:</div>
              <ol style={{ paddingLeft: 20, fontSize: '0.88rem', lineHeight: 2 }}>
                {notice.flags.map((f) => (
                  <li key={f} style={{ color: '#c00', fontWeight: 600 }}>{f}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Statutory Dossier */}
          <div style={{ marginBottom: 24, background: '#fff8e1', padding: '16px 20px', border: '1px solid #ffc107', borderRadius: 4 }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: '#795548', fontSize: '0.9rem' }}>📜 Statutory Dossier</div>
            <div style={{ fontSize: '0.8rem', lineHeight: 1.9, color: '#444', whiteSpace: 'pre-wrap' }}>{notice.statutory_dossier}</div>
          </div>

          {/* Recommended Action */}
          <div style={{ marginBottom: 28, background: '#ffebee', padding: '16px 20px', border: '1px solid #ef9a9a', borderRadius: 4 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#b71c1c', fontSize: '0.9rem' }}>🔴 Recommended Action</div>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: '#333' }}>{notice.recommended_action}</div>
          </div>

          {/* Signature block */}
          <div style={{ borderTop: '2px solid #1a237e', paddingTop: 24, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ height: 50 }} />
                <div style={{ fontWeight: 700 }}>Authorised Signatory</div>
                <div style={{ fontSize: '0.82rem', color: '#555' }}>e-SAKSHI 2.0 Sentinel<br />MoSPI / DIID Compliance Wing</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ height: 50 }} />
                <div style={{ fontWeight: 700 }}>District Authority</div>
                <div style={{ fontSize: '0.82rem', color: '#555' }}>{notice.district} District<br />{notice.state}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 32, paddingTop: 12, borderTop: '1px solid #ccc', fontSize: '0.72rem', color: '#888', textAlign: 'center' }}>
            This notice is computer-generated by e-SAKSHI 2.0 Sentinel (SIH 2026 PS 26102).
            Work ID: {notice.work_id} · Generated: {notice.notice_date}
          </div>
        </div>
      </main>
    </div>
  );
}
