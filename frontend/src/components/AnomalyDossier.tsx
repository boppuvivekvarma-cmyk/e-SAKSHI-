'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface Props {
  dossier: string;
  flags?: string[];
  verdict: string;
  recommended_action?: string;
}

export function AnomalyDossier({ dossier, flags, verdict, recommended_action }: Props) {
  const [open, setOpen] = useState(true);

  const isHold = verdict === 'STATUTORY HOLD';
  const isInquiry = verdict === 'COMPLIANCE INQUIRY';
  const isDormant = verdict === 'CAPITAL DORMANT';

  const accentBorder =
    isHold    ? '#DC2626' :
    isDormant ? '#7C3AED' :
    isInquiry ? '#D97706' :
    '#16A34A';

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${accentBorder}`,
      borderLeftWidth: 4,
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: isHold ? '#FEF2F2' : '#F8FAFC',
          border: 'none',
          borderBottom: open ? '1px solid var(--border-light)' : 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isHold ? <AlertTriangle size={16} color="#DC2626" /> : <ShieldCheck size={16} color={accentBorder} />}
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0B2545' }}>
            📜 Official Statutory Dossier (विधिक विवरण एवं नियम उल्लंघन)
          </span>
          {flags && flags.length > 0 && (
            <span style={{
              background: '#FEE2E2', color: '#991B1B',
              border: '1px solid #FCA5A5', padding: '1px 6px',
              fontSize: '0.68rem', fontWeight: 700, borderRadius: 2,
            }}>
              {flags.length} VIOLATION{flags.length > 1 ? 'S' : ''}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
      </button>

      {open && (
        <div style={{ padding: '16px' }}>
          {flags && flags.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Active Anomaly Gates Triggered:
              </div>
              <div className="flags-list">
                {flags.map((f) => (
                  <span key={f} className="flag-chip">{f}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 4,
            padding: '12px 14px',
            fontSize: '0.82rem',
            color: '#1E293B',
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
            fontFamily: 'system-ui, sans-serif',
          }}>
            {dossier}
          </div>

          {recommended_action && (
            <div style={{
              marginTop: 14,
              padding: '12px 14px',
              background: isHold ? '#FEF2F2' : '#FFFBEB',
              border: `1px solid ${isHold ? '#FCA5A5' : '#FCD34D'}`,
              borderRadius: 4,
              fontSize: '0.8rem',
              color: isHold ? '#991B1B' : '#92400E',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                <Info size={14} />
                RECOMMENDED STATUTORY DIRECTIVE (अपेक्षित कार्रवाई)
              </div>
              {recommended_action}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
