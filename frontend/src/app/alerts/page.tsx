import { getAlerts } from '@/lib/api';
import { Sidebar } from '@/components/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alerts | e-SAKSHI 2.0 Sentinel',
  description: 'Role-scoped alert feed — all high and medium risk flags raised by the detection pipeline.',
};

const SEVERITY_COLOR: Record<string, string> = {
  HIGH:   'var(--color-hold)',
  MEDIUM: 'var(--color-inquiry)',
  LOW:    'var(--color-green)',
};

export default async function AlertsPage() {
  const alerts = await getAlerts({ limit: 100 });

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="fade-in">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ marginBottom: 6 }}>🔔 Alert Feed</h1>
            <p>Real-time anomaly alerts — {alerts.length} active</p>
          </div>

          {alerts.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No active alerts</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {alerts.map((a) => {
              const col = SEVERITY_COLOR[a.severity] ?? 'var(--color-green)';
              return (
                <div key={a.id ?? a.work_id} className="card"
                  style={{ borderLeftColor: col, borderLeftWidth: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className="badge" style={{ background: `${col}20`, color: col, border: `1px solid ${col}40` }}>
                          {a.severity}
                        </span>
                        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.work_id}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 4 }}>{a.summary}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.statutory_dossier}</div>
                      {a.recommended_action && (
                        <div style={{ marginTop: 10, fontSize: '0.76rem', color: col, fontWeight: 600 }}>
                          → {a.recommended_action}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <a href={`/audit/${a.work_id}`} className="btn btn-ghost btn-sm">View</a>
                      {a.verdict !== 'VERIFIED COMPLIANT' && (
                        <a href={`/notices/${a.work_id}`} className="btn btn-ghost btn-sm">Notice</a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
