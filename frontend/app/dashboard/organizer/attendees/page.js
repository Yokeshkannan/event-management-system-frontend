'use client';

import { useState, useEffect } from 'react';
import { eventsAPI, bookingsAPI } from '@/lib/api';
import { Mail, ShieldCheck, Ticket } from 'lucide-react';

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const data = await eventsAPI.getMyEvents();
      const myEvents = data.events || [];
      
      const bookingsPromises = myEvents.map(e => bookingsAPI.getEventBookings(e.id).catch(() => ({ bookings: [] })));
      const bookingsResults = await Promise.all(bookingsPromises);
      
      const allBookings = bookingsResults
        .flatMap(res => res.bookings || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setAttendees(allBookings);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="section-title">Global <span style={{ color: 'var(--primary)' }}>Attendees</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>View all unique attendees registered across your lifetime events.</p>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
           <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading attendee ledger...</div>
        ) : attendees.length === 0 ? (
           <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendees yet. Spread the word about your events!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card2)', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Attendee Profile</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Event</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Ticket Details</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Amount & Status</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Booking Date</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div>
                         <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.user_name || 'Attendee'}</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{b.user_email || 'No email'}</div>
                       </div>
                     </div>
                  </td>
                  <td style={{ padding: '20px 16px' }}>
                     <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{b.event_title}</div>
                  </td>
                  <td style={{ padding: '20px 16px', color: 'var(--text-secondary)' }}>
                     {b.ticket_type} (x{b.quantity})
                  </td>
                  <td style={{ padding: '20px 16px' }}>
                     <div style={{ fontWeight: 700, color: b.status === 'cancelled' ? 'var(--error)' : 'var(--success)' }}>
                       ₹{b.total_amount}
                     </div>
                     <span style={{ fontSize: '11px', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-card2)', color: b.status === 'cancelled' ? 'var(--error)' : 'var(--text-secondary)' }}>
                       {b.status}
                     </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '14px' }}>
                     {new Date(b.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
