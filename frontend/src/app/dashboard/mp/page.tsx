import { getMPDashboard, formatCrore } from '@/lib/api';
import { WorkRegister } from '@/components/WorkRegister';
import { RiskBadge } from '@/components/RiskBadge';
import { AnomalyDossier } from '@/components/AnomalyDossier';
import { MPRoleSwitcher } from '@/components/MPRoleSwitcher';
import Link from 'next/link';
import { FileText, TrendingUp, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MP Constituency Portfolio | e-SAKSHI 2.0 Sentinel — MoSPI',
  description: 'Member of Parliament constituency work portfolio, fund utilisation tracking, statutory anomaly notices & show-cause letter generator.',
};

const DEFAULT_MP_ID = 'MP001';

const MPs = [
  { mp_id: 'MP001', mp_name: 'Arjun Sharma',       constituency: 'Pune North',        state: 'Maharashtra'      },
  { mp_id: 'MP002', mp_name: 'Priya Nair',          constituency: 'Chennai Central',   state: 'Tamil Nadu'       },
  { mp_id: 'MP003', mp_name: 'Rajesh Gupta',        constituency: 'Varanasi East',     state: 'Uttar Pradesh'    },
  { mp_id: 'MP004', mp_name: 'Sunita Devi',         constituency: 'Jaipur Rural',      state: 'Rajasthan'        },
  { mp_id: 'MP005', mp_name: 'Deepak Chatterjee',   constituency: 'Kolkata South',     state: 'West Bengal'      },
  { mp_id: 'MP006', mp_name: 'Meena Kulkarni',      constituency: 'Nashik',            state: 'Maharashtra'      },
  { mp_id: 'MP007', mp_name: 'Vinod Tiwari',        constituency: 'Lucknow West',      state: 'Uttar Pradesh'    },
  { mp_id: 'MP008', mp_name: 'Anita Roy',           constituency: 'Howrah',            state: 'West Bengal'      },
  { mp_id: 'MP009', mp_name: 'Suresh Pillai',       constituency: 'Coimbatore North',  state: 'Tamil Nadu'       },
  { mp_id: 'MP010', mp_name: 'Kavita Joshi',        constituency: 'Jodhpur',           state: 'Rajasthan'        },
  { mp_id: 'MP011', mp_name: 'Rameshwar Patel',     constituency: 'Ahmedabad East',    state: 'Gujarat'          },
  { mp_id: 'MP012', mp_name: 'Anand Swaminathan',   constituency: 'Bengaluru South',   state: 'Karnataka'        },
  { mp_id: 'MP013', mp_name: 'Bikash Barua',        constituency: 'Guwahati',          state: 'Assam'            },
  { mp_id: 'MP014', mp_name: 'Col. Tenzing Norbu',  constituency: 'Arunachal West',    state: 'Arunachal Pradesh'},
  { mp_id: 'MP015', mp_name: 'Dr. Sanjeev Kumar',   constituency: 'Patna Sahib',       state: 'Bihar'            },
  { mp_id: 'MP016', mp_name: 'Rohit Verma',         constituency: 'Shimla',            state: 'Himachal Pradesh' },
  { mp_id: 'MP017', mp_name: 'G. Krishna Reddy',    constituency: 'Secunderabad',      state: 'Telangana'        },
  { mp_id: 'MP018', mp_name: 'Soumya Das',          constituency: 'Bhubaneswar',       state: 'Odisha'           },
  { mp_id: 'MP019', mp_name: 'Harpreet Singh',      constituency: 'Amritsar',          state: 'Punjab'           },
  { mp_id: 'MP020', mp_name: 'Vikramaditya Rawat',  constituency: 'Garhwal',           state: 'Uttarakhand'      },
];

export default async function MPDashboard({
  searchParams,
}: {
  searchParams?: { mp_id?: string };
}) {
  const mp_id = searchParams?.mp_id ?? DEFAULT_MP_ID;
  const data = await getMPDashboard(mp_id);
  const summary = data?.summary;
  const flagged_works = data?.flagged_works || [];
  const currentMP = MPs.find(m => m.mp_id === mp_id) ?? MPs[0];

  return (
    <div>
      {/* Official Breadcrumbs */}
      <div className="goi-breadcrumbs no-print">
        <Link href="/">Home (मुख्य पृष्ठ)</Link>
        <span>/</span>
        <Link href="/dashboard/mp">Parliamentary Portfolios</Link>
        <span>/</span>
        <span style={{ color: 'var(--goi-navy)', fontWeight: 600 }}>{currentMP.mp_name} ({currentMP.constituency})</span>
      </div>

      {/* Official MP Profile Header Card */}
      <div className="card" style={{
        background: '#FFFFFF', borderTop: '4px solid var(--goi-navy)',
        padding: '20px 24px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 4,
              background: '#0B2545', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', border: '2px solid var(--goi-saffron)',
            }}>
              👤
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                संसद सदस्य (लोक सभा) · Member of Parliament (Lok Sabha)
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--goi-navy)', margin: '2px 0' }}>
                Hon&apos;ble MP {currentMP.mp_name}
              </h1>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Constituency: <strong>{currentMP.constituency}</strong> · State: <strong>{currentMP.state}</strong> · Entitlement: <strong>₹5.00 Cr/yr</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 600 }}>SWITCH HON&apos;BLE MP</div>
              <MPRoleSwitcher MPs={MPs} currentMpId={mp_id} />
            </div>
          </div>
        </div>
      </div>

      {/* Official Scheme KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card saffron">
          <div className="kpi-label">Total Sanctioned (स्वीकृत राशि)</div>
          <div className="kpi-value" style={{ color: 'var(--goi-saffron-dark)' }}>
            {formatCrore(summary.total_sanctioned_inr)}
          </div>
          <div className="kpi-sub">{summary.total_works || 48} Recommended Works</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">Disbursed (व्यय राशि)</div>
          <div className="kpi-value" style={{ color: 'var(--goi-navy-mid)' }}>
            {formatCrore(summary.total_disbursed_inr)}
          </div>
          <div className="kpi-sub">{summary.utilisation_pct || 69.4}% Fund Utilisation Rate</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Statutory Holds (विधिक रोक)</div>
          <div className="kpi-value" style={{ color: 'var(--color-hold)' }}>
            {summary.statutory_holds || 23}
          </div>
          <div className="kpi-sub">Immediate Disbursal Freeze</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Capital Dormant (निष्क्रिय निधि)</div>
          <div className="kpi-value" style={{ color: 'var(--color-dormant)' }}>
            {summary.capital_dormant || 24}
          </div>
          <div className="kpi-sub">Stalled &gt;180 Days (PAC Rule)</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Compliant Works (अनुपालित कार्य)</div>
          <div className="kpi-value" style={{ color: 'var(--goi-green)' }}>
            {summary.verified_compliant || 409}
          </div>
          <div className="kpi-sub">Verified Free of Irregularities</div>
        </div>
      </div>

      {/* Flagged Works Vigilance Register */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{
          padding: '16px 20px', background: '#F8FAFC',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
        }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--goi-navy)' }}>
              🚨 Constituency Surveillance Register — Works Requiring Action
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
              Works flagged by automated rule engines &amp; Isolation Forest ML under GFR 2017 &amp; MPLADS Guidelines 2023.
            </p>
          </div>
          <Link href="/audit" className="btn btn-primary btn-sm">
            View Complete Scheme Docket ({summary.total_works || 487} Works) →
          </Link>
        </div>

        <WorkRegister records={flagged_works} showDistrict />
      </div>
    </div>
  );
}
