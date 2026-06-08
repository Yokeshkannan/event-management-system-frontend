'use client';

import { useState, useEffect } from 'react';
import { bookingsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ticket, ArrowUpRight, ArrowDownRight, CalendarDays, Search } from 'lucide-react';

const statusColors = {
  confirmed: 'var(--success)',
  pending:   'var(--warning)',
  cancelled: 'var(--error)',
};

export default function AttendeeDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsAPI.getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? The seat will be released.')) return;
    try {
      await bookingsAPI.cancel(id);
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert('Failed to cancel: ' + err.message);
    }
  };

  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const totalSpent = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((s, b) => s + parseFloat(b.total_amount || 0), 0);
  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.event_date) >= new Date()).length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ── TOP SECTION: OVERVIEW ── */}
      <h1 className="section-title" style={{ marginBottom: '24px' }}>Overview of <span style={{ color: 'var(--primary)' }}>your bookings</span></h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Main Stats Card (Monobank-like) */}
        <div className="glass-card" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Total Spent</div>
            <div style={{ 
              fontSize: '36px', fontWeight: 800, color: 'var(--primary)', 
              display: 'flex', alignItems: 'center', gap: '8px' 
            }}>
              ₹{totalSpent.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px' }}>
              Lifetime spending on events
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Upcoming Events</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success)' }}>
              {upcoming}
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Bookings</div>
            <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{bookings.length}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Confirmed</div>
            <div style={{ color: 'var(--success)', fontWeight: 700 }}>{confirmed}</div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <Link href="/" style={{ 
              background: 'var(--primary)', color: '#fff', borderRadius: '8px', 
              padding: '10px 16px', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              <Search size={16} /> Browse More Events
            </Link>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION: CHARTS & LISTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 2fr) 1fr', gap: '24px' }}>
        
        <div>
          {/* Active Tickets section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
             <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }} id="tickets">
               Active Tickets
             </h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {loading ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : bookings.filter(b => b.status === 'confirmed').length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active tickets found. Proceed to book some!
              </div>
            ) : (
               bookings.filter(b => b.status === 'confirmed').map(booking => (
                <div key={booking.id} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ticket size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{booking.event_title}</h3>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={14} /> {new Date(booking.event_date).toLocaleDateString()}</span>
                      <span>📍 {booking.location}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{booking.ticket_type} (x{booking.quantity})</div>
                    <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>₹{booking.total_amount}</div>
                  </div>
                  <div>
                     <button onClick={() => handleCancel(booking.id)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--error)', color: 'var(--error)', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        Cancel
                     </button>
                  </div>
                </div>
               ))
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: HISTORY LOGS ── */}
        <div>
          <div className="glass-card" style={{ padding: '24px', height: '100%' }} id="history">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Transaction History
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <div style={{ color: 'var(--text-secondary)' }}>Loading history...</div>
              ) : bookings.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No history available.</div>
              ) : bookings.map((item, i) => {
                const isCancelled = item.status === 'cancelled';
                const Icon = isCancelled ? ArrowUpRight : ArrowDownRight;
                const iColor = isCancelled ? 'var(--success)' : 'var(--error)';
                
                return (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: i === bookings.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                        <Icon size={18} color={iColor} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.event_title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                           {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                         {isCancelled ? '+' : '-'} ₹{item.total_amount}
                       </div>
                       <div style={{ fontSize: '10px', color: statusColors[item.status] || 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>
                         {item.status}
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
