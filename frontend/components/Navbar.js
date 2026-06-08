'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, logout, isAuthenticated } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut, Ticket } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    setUser(null);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled
          ? 'var(--bg-card)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 2rem',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ticket size={28} color="var(--primary)" />
          <span
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '1px',
            }}
          >
            TICKETER
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: pathname === link.href ? 'var(--primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: pathname === link.href ? 600 : 500,
              fontSize: '14px',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
            onMouseLeave={(e) => {
              if(pathname !== link.href) e.target.style.color = 'var(--text-secondary)';
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Auth & Theme buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
        
        {/* Theme Toggler */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--bg-card2)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {user ? (
          <div style={{ position: 'relative' }}>
            {/* User Profile Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: dropdownOpen ? 'var(--bg-card)' : 'var(--bg-card2)',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#111111,#333333)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
                {user.name?.split(' ')[0]}
              </span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div 
                  onClick={() => setDropdownOpen(false)} 
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '280px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    borderRadius: '16px',
                    padding: '16px',
                    zIndex: 100,
                    animation: 'fadeInUp 0.2s ease',
                  }}
                >
                  {/* Account Overview */}
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{user.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>{user.email}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                        {user.role}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                        • Member since {new Date().getFullYear()}
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Link
                      href={`/dashboard/${user.role}`}
                      onClick={() => setDropdownOpen(false)}
                      style={{ padding: '10px 12px', borderRadius: '8px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--bg-card2)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      My Dashboard
                    </Link>
                    <Link
                      href={`/dashboard/${user.role}/settings`}
                      onClick={() => setDropdownOpen(false)}
                      style={{ padding: '10px 12px', borderRadius: '8px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--bg-card2)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{ padding: '10px 12px', borderRadius: '8px', color: 'var(--error)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontWeight: 600, transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'var(--bg-card2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            <span style={{ color: 'var(--primary)' }}>👤</span> Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
}
