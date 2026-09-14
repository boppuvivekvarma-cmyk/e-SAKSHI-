'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users, MapPin, Building2, Shield,
  FileText, Bell, Upload, ChevronRight, Activity, HelpCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    section: 'AUTHORITY PORTALS (प्राधिकरण)',
    items: [
      { href: '/dashboard/mp',       icon: Users,    label: 'MP Portfolio', sub: 'सांसद डैशबोर्ड' },
      { href: '/dashboard/district', icon: MapPin,   label: 'District Authority', sub: 'जिला प्राधिकरण' },
      { href: '/dashboard/state',    icon: Building2,label: 'State Nodal', sub: 'राज्य नोडल' },
      { href: '/dashboard/ministry', icon: Shield,   label: 'Ministry (MoSPI)', sub: 'राष्ट्रीय समीक्षा' },
    ],
  },
  {
    section: 'VIGILANCE OPERATIONS (निगरानी)',
    items: [
      { href: '/audit',    icon: FileText, label: 'Full Audit Docket', sub: 'लेखापरीक्षा रजिस्टर' },
      { href: '/alerts',   icon: Bell,     label: 'Statutory Alerts', sub: 'सतर्कता अलर्ट' },
      { href: '/ingest',   icon: Upload,   label: 'Data Ingest Portal', sub: 'डेटा अंतर्ग्रहण' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar no-print">
      {/* Ministry Department Seal */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/emblem-of-india.svg"
            alt="State Emblem of India"
            style={{
              height: '42px',
              width: 'auto',
              flexShrink: 0,
              filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15))',
            }}
          />
          <div>
            <div className="sidebar-logo-text">e-SAKSHI 2.0</div>
            <div className="sidebar-logo-sub">MoSPI Vigilance Wing</div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav>
        {NAV_ITEMS.map((sec) => (
          <div key={sec.section}>
            <div className="sidebar-nav-section">{sec.section}</div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${active ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={16} color={active ? '#0B2545' : '#64748B'} />
                    <div>
                      <div>{item.label}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{item.sub}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} color={active ? '#0B2545' : '#CBD5E1'} />
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Official Government Support Box */}
      <div style={{
        marginTop: 24, padding: '12px 14px',
        background: '#F8FAFC', border: '1px solid #E2E8F0',
        borderRadius: 4, fontSize: '0.74rem', color: '#475569',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0B2545', marginBottom: 4 }}>
          <HelpCircle size={14} color="#D85A00" />
          MPLADS DIID Helpdesk
        </div>
        <div>Toll Free: 1800-11-8888</div>
        <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: 2 }}>support-esakshi@gov.in</div>
      </div>
    </aside>
  );
}
