'use client';

import { useState, useEffect } from 'react';
import { bookingsAPI } from '@/lib/api';
import { ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';

export default function TransactionHistoryPage() {
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

  const totalSpent = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="section-title">Transaction <span style={{ color: 'var(--primary)' }}>History</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Track your spending across all events.</p>
        </div>
        <div style={{ textAlign: 'right', background: 'var(--bg-card)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Total Spent Platform-wide</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IndianRupee size={24} /> {totalSpent.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading history...</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card2)', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Event</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Payment Gateway</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const isCancelled = booking.status === 'cancelled';
                return (
                  <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {new Date(booking.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{booking.event_title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{booking.ticket_type} (x{booking.quantity})</div>
                    </td>
                    <td style={{ padding: '20px 16px', color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'capitalize' }}>
                      {booking.payment_gateway || 'Razorpay'}
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <span style={{ 
                        background: isCancelled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                        color: isCancelled ? 'var(--error)' : 'var(--success)', 
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' 
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px',
                        fontWeight: 700, color: isCancelled ? 'var(--text-secondary)' : 'var(--text-primary)', fontSize: '16px' 
                      }}>
                        {isCancelled ? '+' : '-'} ₹{booking.total_amount}
                        {isCancelled ? <ArrowUpRight size={18} color="var(--text-secondary)" /> : <ArrowDownRight size={18} color="var(--error)" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
