'use client';
import Link from 'next/link';
import { formatINR } from '@/lib/api';
import { RiskBadge } from './RiskBadge';
import { FileText, ExternalLink, AlertTriangle } from 'lucide-react';

interface WorkRecord {
  work_id: string;
  work_title: string;
  category: string;
  district?: string;
  constituency?: string;
  mp_name?: string;
  vendor_name?: string;
  estimated_cost_inr?: number;
  expenditure_incurred_inr?: number;
  completion_pct?: number;
  work_status?: string;
  sanction_date?: string;
  verdict: string;
  risk_score: number;
  flags?: string[];
  is_extreme_outlier?: boolean;
  is_statistical_outlier?: boolean;
  state_cost_ratio?: number;
  terrain_multiplier?: number;
}

interface Props {
  records?: WorkRecord[];
  works?: WorkRecord[];
  showMP?: boolean;
  showDistrict?: boolean;
  compact?: boolean;
}

export function WorkRegister({ records, works, showMP, showDistrict, compact }: Props) {
  const dataList = records || works || [];
  const rowClass = (verdict: string) =>
    verdict === 'STATUTORY HOLD'    ? 'row-hold' :
    verdict === 'COMPLIANCE INQUIRY'? 'row-inquiry' :
    verdict === 'CAPITAL DORMANT'   ? 'row-dormant' : '';

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Work ID <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>कार्य आईडी</span></th>
            <th>Work Title &amp; Category <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>विवरण व श्रेणी</span></th>
            {showMP && <th>MP &amp; Constituency <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>सांसद व क्षेत्र</span></th>}
            {showDistrict && <th>District <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>जिला</span></th>}
            <th>Sanctioned (₹) <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>स्वीकृत राशि</span></th>
            <th>Disbursed (₹) <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>व्यय राशि</span></th>
            <th>Physical Progress <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>प्रगति %</span></th>
            <th>Status <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>स्थिति</span></th>
            <th>Compliance Verdict <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>सतर्कता निर्णय</span></th>
            <th style={{ textAlign: 'center' }}>Statutory Actions <span style={{ opacity: 0.7, fontSize: '0.68rem', display: 'block' }}>कार्रवाई</span></th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((r) => (
            <tr key={r.work_id} className={rowClass(r.verdict)}>
              <td>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--goi-navy-mid)' }}>
                  {r.work_id}
                </span>
              </td>
              <td>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.83rem', maxWidth: 220 }}>
                  {r.work_title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: 2, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>{r.category}</span>
                  {r.is_extreme_outlier && (
                    <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '0.62rem', fontWeight: 800, padding: '1px 5px', borderRadius: 2 }}>
                      EXTREME OUTLIER
                    </span>
                  )}
                  {!r.is_extreme_outlier && r.is_statistical_outlier && (
                    <span style={{ background: '#EDE9FE', color: '#6D28D9', fontSize: '0.62rem', fontWeight: 700, padding: '1px 5px', borderRadius: 2 }}>
                      OUTLIER
                    </span>
                  )}
                </div>
              </td>
              {showMP && (
                <td>
                  <div style={{ fontWeight: 600 }}>{r.mp_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{r.constituency}</div>
                </td>
              )}
              {showDistrict && <td>{r.district}</td>}
              <td style={{ fontWeight: 600 }}>{r.estimated_cost_inr ? formatINR(r.estimated_cost_inr) : '—'}</td>
              <td style={{ fontWeight: 600 }}>{r.expenditure_incurred_inr ? formatINR(r.expenditure_incurred_inr) : '—'}</td>
              <td>
                <div className="risk-bar-wrap" style={{ minWidth: 80 }}>
                  <div className="risk-bar-track">
                    <div
                      className="risk-bar-fill"
                      style={{
                        width: `${r.completion_pct ?? 0}%`,
                        background: (r.completion_pct ?? 0) >= 80 ? 'var(--goi-green)' : (r.completion_pct ?? 0) >= 40 ? 'var(--goi-navy-mid)' : 'var(--color-hold)',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 600, minWidth: 32 }}>
                    {(r.completion_pct ?? 0).toFixed(0)}%
                  </span>
                </div>
              </td>
              <td>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600,
                  color: r.work_status === 'Completed' ? 'var(--goi-green)' : r.work_status === 'Stalled' ? 'var(--color-hold)' : 'var(--goi-navy-mid)',
                }}>
                  {r.work_status}
                </span>
              </td>
              <td>
                <RiskBadge verdict={r.verdict} score={r.risk_score} showScore />
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <Link href={`/audit/${r.work_id}`} className="btn btn-ghost btn-sm" title="View Audit Dossier">
                    <FileText size={12} /> Dossier
                  </Link>
                  {r.verdict !== 'VERIFIED COMPLIANT' && (
                    <Link href={`/notices/${r.work_id}`} className="btn btn-primary btn-sm" title="Print Statutory Notice" style={{ background: '#DC2626', borderColor: '#DC2626' }}>
                      Notice
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
