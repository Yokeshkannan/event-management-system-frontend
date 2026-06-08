'use client';

import { useState, useEffect } from 'react';
import { Building2, Lock, Bell, Users, Trash2, Sun, Moon } from 'lucide-react';
import { getUser, saveAuth, getToken, logout } from '@/lib/auth';
import { authAPI } from '@/lib/api';
import { useTheme } from 'next-themes';

export default function OrganizerSettingsPage() {
  const [user, setUser] = useState({});
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (u) {
      setUser(u);
      setName(u.name);
    }
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ name });
      saveAuth(getToken(), res.user);
      setUser(res.user);
      alert('Organizer Profile updated successfully!');
    } catch(err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      await authAPI.updatePassword(pwdForm);
      alert('Password updated successfully!');
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch(err) {
      alert(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you absolutely certain? This is final.')) {
      alert('Account purged. (Mock function)');
      logout();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title">Organizer <span style={{ color: 'var(--primary)' }}>Settings</span></h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Configure your organizer identity and team preferences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Organizer Profile */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Building2 color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Organizer Profile</h2>
          </div>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label">Organizer / Company Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="input-label">Business Email</label>
              <input 
                type="email" 
                className="input-field" 
                value={user?.email || ''} 
                disabled 
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
            <div>
              <label className="input-label">Payment Gateway Webhook Secret</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="whsec_xxxxxxxxxx" 
              />
              <span style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '6px', display: 'block' }}>Requires API setup in Razorpay/Stripe dashboard.</span>
            </div>
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Lock color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Security & Password</h2>
          </div>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Current Password</label>
                <input type="password" value={pwdForm.currentPassword} onChange={e=>setPwdForm({...pwdForm, currentPassword: e.target.value})} className="input-field" required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">New Password</label>
                <input type="password" value={pwdForm.newPassword} onChange={e=>setPwdForm({...pwdForm, newPassword: e.target.value})} className="input-field" required minLength={6} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={pwdLoading} style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
              {pwdLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Theme Preference */}
        {mounted && (
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              {theme === 'dark' ? <Moon color="var(--primary)" /> : <Sun color="var(--primary)" />}
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Theme Preference</h2>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => setTheme('light')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                  background: theme === 'light' ? 'var(--primary)' : 'var(--bg-card2)',
                  color: theme === 'light' ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border)', fontWeight: 600, transition: 'all 0.2s'
                }}>
                Light Mode
              </button>
              <button 
                onClick={() => setTheme('dark')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                  background: theme === 'dark' ? 'var(--primary)' : 'var(--bg-card2)',
                  color: theme === 'dark' ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border)', fontWeight: 600, transition: 'all 0.2s'
                }}>
                Dark Mode
              </button>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid var(--error)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Trash2 color="var(--error)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--error)' }}>Terminate Platform Account</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            Deleting your organizer profile will instantly purge all your active events and issue full refunds to existing attendees unconditionally. Proceed with extreme caution.
          </p>
          <button 
            onClick={handleDeleteAccount}
            style={{ 
              background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', 
              padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Purge Account & Refund All
          </button>
        </div>
      </div>
    </div>
  );
}
