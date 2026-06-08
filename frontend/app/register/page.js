'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { Suspense } from 'react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'attendee';

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: defaultRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.register(form);
      saveAuth(data.token, data.user);
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
      <div
        style={{
          position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '500px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(51,51,51,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%', maxWidth: '460px',
          background: 'rgba(26,26,46,0.85)',
          border: '1px solid rgba(17,17,17,0.2)',
          borderRadius: '20px', padding: '40px',
          backdropFilter: 'blur(20px)',
          animation: 'fadeInUp 0.5s ease',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
            Create Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Join EventHub today</p>
        </div>

        {/* Role Toggle */}
        <div style={{ marginBottom: '24px' }}>
          <label className="input-label" style={{ marginBottom: '10px' }}>I am a...</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { value: 'attendee', emoji: '🎟️', label: 'Attendee', desc: 'Book tickets' },
              { value: 'organizer', emoji: '🎭', label: 'Organizer', desc: 'Create events' },
            ].map((r) => (
              <div
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                style={{
                  border: `2px solid ${form.role === r.value ? '#111111' : 'rgba(17,17,17,0.2)'}`,
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: form.role === r.value ? 'rgba(17,17,17,0.1)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '24px' }}>{r.emoji}</div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '14px', marginTop: '4px' }}>{r.label}</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="input-field"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
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
              placeholder="Min 6 characters"
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
                borderRadius: '10px', padding: '12px 14px',
                color: '#f87171', fontSize: '14px',
              }}
            >⚠️ {error}</div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? 'Creating account...' : `Create ${form.role === 'organizer' ? 'Organizer' : 'Attendee'} Account →`}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#444444', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ color: '#94a3b8', textAlign: 'center', padding: '4rem' }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
