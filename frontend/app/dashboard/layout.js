'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const u = getUser();
    setUser(u);
  }, [router]);

  if (!mounted || !user) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }} />
  }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: 'calc(100vh - 70px)', // Minus navbar
      background: 'var(--bg-dark)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <Sidebar />

      {/* ── Main Content Area ── */}
      <main style={{ flex: 1, padding: '32px', paddingLeft: '92px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
