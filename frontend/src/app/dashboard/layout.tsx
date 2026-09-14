import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
