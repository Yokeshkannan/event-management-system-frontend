'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, isAuthenticated, logout } from '@/lib/auth';
import { 
  Home,
  LayoutDashboard, 
  Ticket, 
  CalendarDays, 
  BarChart3, 
  LogOut, 
  Settings, 
  Users
} from 'lucide-react';

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, [pathname]);

  if (!mounted || !user) {
    return null; // Do not render sidebar if not logged in or not mounted
  }

  const isOrganizer = user.role === 'organizer';

  const attendeeNav = [
    { icon: <Home size={20} />, label: 'Home', href: '/' },
    { icon: <Ticket size={20} />, label: 'My Tickets', href: '/dashboard/attendee/tickets' },
    { icon: <CalendarDays size={20} />, label: 'History', href: '/dashboard/attendee/history' },
    { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '/dashboard/attendee' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/dashboard/attendee/settings' },
  ];

  const organizerNav = [
    { icon: <Home size={20} />, label: 'Home', href: '/' },
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/dashboard/organizer' },
    { icon: <CalendarDays size={20} />, label: 'My Events', href: '/dashboard/organizer/events' },
    { icon: <Users size={20} />, label: 'Attendees', href: '/dashboard/organizer/attendees' },
    { icon: <BarChart3 size={20} />, label: 'Statistics', href: '/dashboard/organizer/statistics' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/dashboard/organizer/settings' },
  ];

  const navItems = isOrganizer ? organizerNav : attendeeNav;

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        width: isHovered ? '220px' : '60px', 
        background: 'var(--bg-card)', 
        borderRight: '1px solid var(--border)',
        padding: isHovered ? '32px 20px' : '32px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isHovered ? 'stretch' : 'center',
        position: 'fixed',
        top: '70px', // Below navbar
        left: 0,
        height: 'calc(100vh - 70px)',
        zIndex: 50,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        boxShadow: isHovered ? '4px 0 24px rgba(0,0,0,0.15)' : 'none'
      }}>
    
      {/* User Card */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', 
        marginBottom: '40px', padding: isHovered ? '0 10px' : '0' 
      }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #111111, #333333)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 800, color: '#fff',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
        }}>
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ 
          opacity: isHovered ? 1 : 0, 
          width: isHovered ? 'auto' : 0,
          transition: 'opacity 0.2s',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {user.name}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {user.role} Account
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, width: '100%' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: isHovered ? '14px' : '0',
                padding: '12px', borderRadius: '12px',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '15px',
                transition: 'background 0.2s, color 0.2s',
                justifyContent: isHovered ? 'flex-start' : 'center',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-card2)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
              title={!isHovered ? item.label : ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                {item.icon}
              </div>
              <span style={{ 
                opacity: isHovered ? 1 : 0, 
                width: isHovered ? 'auto' : 0,
                transition: 'opacity 0.2s ease',
                overflow: 'hidden'
              }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: '8px', 
        borderTop: '1px solid var(--border)', paddingTop: '24px', width: '100%' 
      }}>
        <button 
          onClick={() => { logout(); router.push('/'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: isHovered ? '14px' : '0',
            padding: '12px', borderRadius: '12px',
            background: 'transparent',
            color: 'var(--error)',
            border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '15px', textAlign: 'left',
            transition: 'background 0.2s',
            justifyContent: isHovered ? 'flex-start' : 'center',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          title={!isHovered ? 'Log Out' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
            <LogOut size={20} />
          </div>
          <span style={{ 
            opacity: isHovered ? 1 : 0, 
            width: isHovered ? 'auto' : 0,
            transition: 'opacity 0.2s ease',
            overflow: 'hidden'
          }}>
            Log Out
          </span>
        </button>
      </div>
    </aside>
  );
}
