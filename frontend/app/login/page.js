'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.login(form);
      saveAuth(data.token, data.user);
      
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }

      // Redirect based on role if no redirect param exists
      if (data.user.role === 'organizer') {
        router.push('/dashboard/organizer');
      } else {
        router.push('/dashboard/attendee');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '500px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(17,17,17,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%', maxWidth: '440px',
          background: 'rgba(26,26,46,0.85)',
          border: '1px solid rgba(17,17,17,0.2)',
          borderRadius: '20px', padding: '40px',
          backdropFilter: 'blur(20px)',
          animation: 'fadeInUp 0.5s ease',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎪</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Sign in to your EventHub account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '12px 14px',
                color: '#f87171',
                fontSize: '14px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Demo credentials */}
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(17,17,17,0.07)',
            border: '1px dashed rgba(17,17,17,0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <strong style={{ color: '#444444' }}>Demo:</strong> Register first, then login.
          Use role <code style={{ color: '#555555' }}>organizer</code> to create events,
          or <code style={{ color: '#34d399' }}>attendee</code> to book tickets.
        </div>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '24px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#444444', fontWeight: 600, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
