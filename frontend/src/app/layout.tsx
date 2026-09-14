import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'e-SAKSHI 2.0 Sentinel | Government of India — MoSPI',
  description: 'Ministry of Statistics & Programme Implementation (MoSPI) — Official AI-Powered MPLADS Parliamentary Surveillance & Anomaly Detection Portal (SIH 2026 PS 26102).',
  keywords: 'e-SAKSHI, MPLADS, Government of India, MoSPI, Parliamentary Surveillance, Audit Docket, GFR 2017, SIH 2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Tricolor National Stripe */}
        <div className="goi-tricolor-bar" />

        {/* Top Accessibility & Ministry Identification Bar */}
        <header className="goi-top-bar no-print">
          <div className="goi-top-bar-inner">
            <div className="goi-top-gov-title">
              <span>🇮🇳 भारत सरकार | Government of India</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span>सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय | Ministry of Statistics and Programme Implementation</span>
            </div>
            <div className="goi-accessibility-tools">
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Screen Reader Access</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button type="button" className="goi-tool-btn" title="Decrease font size">A-</button>
                <button type="button" className="goi-tool-btn" title="Default font size">A</button>
                <button type="button" className="goi-tool-btn" title="Increase font size">A+</button>
              </div>
              <button type="button" className="goi-tool-btn" style={{ fontWeight: 600, background: '#D85A00', borderColor: '#D85A00' }}>
                English / हिन्दी
              </button>
            </div>
          </div>
        </header>

        {/* Official Portal Header with Lion Capital Emblem */}
        <div className="goi-main-header no-print">
          <div className="goi-header-inner">
            <div className="goi-emblem-wrap">
              {/* Official State Emblem of India (Ashoka Lion Capital with Satyameva Jayate) */}
              <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Government of India | भारत सरकार">
                <img
                  src="/emblem-of-india.svg"
                  alt="State Emblem of India | भारत का राष्ट्रीय प्रतीक (सत्यमेव जयते)"
                  className="goi-emblem-img"
                  width={52}
                  height={83}
                />
              </Link>

              <div className="goi-portal-names">
                <div className="goi-hindi-title">
                  ई-साक्षी 2.0 | सांसद स्थानीय क्षेत्र विकास योजना (MPLADS)
                </div>
                <div className="goi-english-title">
                  e-SAKSHI 2.0 Sentinel
                  <span style={{ fontSize: '0.65rem', background: '#D85A00', color: '#FFF', padding: '2px 8px', borderRadius: 3, fontWeight: 700 }}>
                    AI VIGILANCE CORE
                  </span>
                </div>
                <div className="goi-portal-sub">
                  Parliamentary Surveillance, Fraud &amp; Inefficiency Detection System · MoSPI (DIID)
                </div>
              </div>
            </div>

            <div className="goi-header-badges">
              <div className="goi-nic-badge">
                <strong>SIH 2026 · PS 26102</strong>
                Ministry of Statistics &amp; PI<br />
                Govt. of India
              </div>
              <div style={{
                background: '#0B2545', color: '#FFF', padding: '6px 12px',
                borderRadius: 4, textAlign: 'center', fontSize: '0.72rem', fontWeight: 600,
              }}>
                <div style={{ color: '#FF9933', fontSize: '0.62rem', letterSpacing: '0.08em' }}>SURVEILLANCE MODE</div>
                ACTIVE VIGILANCE
              </div>
            </div>
          </div>
        </div>

        {/* Primary Government Navigation Bar */}
        <nav className="goi-nav-bar no-print">
          <div className="goi-nav-inner">
            <ul className="goi-nav-links">
              <li className="goi-nav-item">
                <Link href="/" className="goi-nav-link">
                  🏛️ <span>Home <span className="goi-nav-link-sub">मुख्य पृष्ठ</span></span>
                </Link>
              </li>
              <li className="goi-nav-item">
                <Link href="/dashboard/mp" className="goi-nav-link">
                  👤 <span>MP Portfolio <span className="goi-nav-link-sub">सांसद डैशबोर्ड</span></span>
                </Link>
              </li>
              <li className="goi-nav-item">
                <Link href="/dashboard/district" className="goi-nav-link">
                  🗺️ <span>District Authority <span className="goi-nav-link-sub">जिला प्राधिकरण</span></span>
                </Link>
              </li>
              <li className="goi-nav-item">
                <Link href="/dashboard/state" className="goi-nav-link">
                  🏢 <span>State Nodal <span className="goi-nav-link-sub">राज्य नोडल</span></span>
                </Link>
              </li>
              <li className="goi-nav-item">
                <Link href="/dashboard/ministry" className="goi-nav-link">
                  🇮🇳 <span>Ministry (MoSPI) <span className="goi-nav-link-sub">राष्ट्रीय समीक्षा</span></span>
                </Link>
              </li>
              <li className="goi-nav-item">
                <Link href="/audit" className="goi-nav-link">
                  📋 <span>Audit Docket <span className="goi-nav-link-sub">लेखापरीक्षा रजिस्टर</span></span>
                </Link>
              </li>
              <li className="goi-nav-item">
                <Link href="/alerts" className="goi-nav-link">
                  🔔 <span>Vigilance Alerts <span className="goi-nav-link-sub">सतर्कता अलर्ट</span></span>
                </Link>
              </li>
              <li className="goi-nav-item">
                <Link href="/ingest" className="goi-nav-link">
                  ⚙️ <span>Data Ingest <span className="goi-nav-link-sub">डेटा अपलोड</span></span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Vigilance Alert Ribbon */}
        <div className="goi-vigilance-ticker no-print">
          <div className="goi-ticker-inner">
            <span className="goi-ticker-label">🚨 सतर्कता सूचना</span>
            <span>
              <strong>STATUTORY NOTIFICATION:</strong> Automated cross-district surveillance active across 490 MPLADS works. 39 Statutory Holds issued per GFR 2017 &amp; CVC Circular 04/2021.
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="goi-content-wrap">
          {children}
        </div>

        {/* Official GIGW Government of India Footer */}
        <footer className="goi-footer no-print">
          <div className="goi-footer-top">
            <div className="goi-footer-inner">
              <div className="goi-footer-col">
                <h4>Government Portals</h4>
                <ul className="goi-footer-links">
                  <li><a href="https://www.india.gov.in" target="_blank" rel="noreferrer">National Portal of India (india.gov.in)</a></li>
                  <li><a href="https://www.mospi.gov.in" target="_blank" rel="noreferrer">Ministry of Statistics &amp; PI (MoSPI)</a></li>
                  <li><a href="https://mplads.gov.in" target="_blank" rel="noreferrer">Official MPLADS e-SAKSHI Portal</a></li>
                  <li><a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer">Digital India Programme</a></li>
                </ul>
              </div>
              <div className="goi-footer-col">
                <h4>Statutory Framework</h4>
                <ul className="goi-footer-links">
                  <li><span>MPLADS Guidelines 2023</span></li>
                  <li><span>General Financial Rules (GFR) 2017 Rule 149</span></li>
                  <li><span>Central Vigilance Commission (CVC) Circular 04/2021</span></li>
                  <li><span>Public Accounts Committee (PAC) Report 2019-20</span></li>
                </ul>
              </div>
              <div className="goi-footer-col">
                <h4>Website Policies (GIGW)</h4>
                <ul className="goi-footer-links">
                  <li><span>Terms &amp; Conditions</span></li>
                  <li><span>Privacy Policy</span></li>
                  <li><span>Copyright &amp; Hyperlinking Policy</span></li>
                  <li><span>Accessibility Statement</span></li>
                </ul>
              </div>
              <div className="goi-footer-col">
                <h4>System Information</h4>
                <p style={{ color: '#94A3B8', fontSize: '0.74rem', lineHeight: 1.7 }}>
                  e-SAKSHI 2.0 Sentinel is an AI/ML vigilance analytics platform developed for Smart India Hackathon 2026 (Problem Statement 26102).
                </p>
                <div style={{ marginTop: 10, color: '#FF9933', fontWeight: 600 }}>
                  Active Engine: 9 Rule Engines + Isolation Forest ML
                </div>
              </div>
            </div>
          </div>
          <div className="goi-footer-bottom">
            <div className="goi-footer-bottom-inner">
              <div>
                © 2026 Ministry of Statistics and Programme Implementation (MoSPI), Government of India. All rights reserved.
              </div>
              <div>
                Designed &amp; Hosted by Data Informatics &amp; Innovation Division (DIID) · Total Audited Works: <strong>490</strong>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
