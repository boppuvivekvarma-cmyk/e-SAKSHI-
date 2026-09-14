import { Sidebar } from '@/components/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Ingest | e-SAKSHI 2.0 Sentinel',
  description: 'Upload MPLADS works and milestone CSVs and trigger the full detection pipeline.',
};

export default function IngestPage() {
  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="fade-in">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ marginBottom: 6 }}>⚙️ Data Ingest &amp; Pipeline</h1>
            <p>Upload MPLADS CSV exports and trigger the full anomaly detection pipeline</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
            <div className="card">
              <div className="card-header">
                <span style={{ fontSize: '1.2rem' }}>📂</span>
                <span className="card-title">Works Register CSV</span>
              </div>
              <p style={{ marginBottom: 16, fontSize: '0.83rem' }}>
                Upload the MPLADS works register export. Required columns: work_id, mp_id, work_title,
                category, estimated_cost_inr, expenditure_incurred_inr, completion_pct…
              </p>
              <div style={{
                border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)',
                padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.83rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📤</div>
                Drag &amp; drop <strong>works.csv</strong> here<br />
                <span style={{ fontSize: '0.72rem' }}>or use the FastAPI /api/v1/ingest/works endpoint</span>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span style={{ fontSize: '1.2rem' }}>📸</span>
                <span className="card-title">Milestone Photos CSV</span>
              </div>
              <p style={{ marginBottom: 16, fontSize: '0.83rem' }}>
                Upload milestone photo metadata. Required columns: milestone_id, work_id, stage,
                photo_phash, photo_exif_lat, photo_exif_lon, captured_at…
              </p>
              <div style={{
                border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)',
                padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.83rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📤</div>
                Drag &amp; drop <strong>milestones.csv</strong> here<br />
                <span style={{ fontSize: '0.72rem' }}>or use the FastAPI /api/v1/ingest/milestones endpoint</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ maxWidth: 900, marginTop: 24 }}>
            <div className="card-header">
              <span style={{ fontSize: '1.2rem' }}>🚀</span>
              <span className="card-title">Detection Pipeline</span>
            </div>
            <p style={{ marginBottom: 20, fontSize: '0.85rem' }}>
              The pipeline auto-runs on backend startup. To manually re-trigger after uploading new data:
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)',
              padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.82rem', color: 'var(--color-green)', marginBottom: 16,
            }}>
              POST /api/v1/ingest/run-pipeline
            </div>
            <div style={{
              background: 'var(--color-card-alt)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', padding: '14px 18px',
              fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8,
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>Pipeline stages:</strong><br />
              1. Feature engineering (Haversine · TF-IDF · pHash · Cost ratios)<br />
              2. Rule engines (9 statute-cited deterministic gates)<br />
              3. Isolation Forest ML scorer<br />
              4. KMeans vendor risk clustering<br />
              5. Dormancy forecasting (linear extrapolation)<br />
              6. Composite risk scoring → HOLD / INQUIRY / DORMANT / COMPLIANT<br />
              7. Statutory dossier generation + alert dispatch
            </div>
          </div>

          <div style={{
            marginTop: 24, padding: '16px 20px',
            background: 'rgba(255,123,28,0.08)', border: '1px solid rgba(255,123,28,0.2)',
            borderRadius: 'var(--radius-md)', fontSize: '0.83rem', color: 'var(--text-secondary)', maxWidth: 900,
          }}>
            <strong style={{ color: 'var(--color-saffron)' }}>Demo mode:</strong>{' '}
            This deployment uses built-in synthetic data (~500 works, 9 anomaly categories).
            To connect a live backend, set{' '}
            <code style={{ color: 'var(--color-teal)', fontFamily: 'JetBrains Mono, monospace' }}>NEXT_PUBLIC_BACKEND_URL</code>{' '}
            in Vercel environment variables.
          </div>
        </div>
      </main>
    </div>
  );
}
