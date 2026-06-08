'use client';

import { useState, useEffect } from 'react';
import { bookingsAPI } from '@/lib/api';
import { Ticket, CalendarDays, Download, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function MyTicketsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [ticketModal, setTicketModal] = useState(null);

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
    if (!confirm('Are you sure you want to cancel this ticket?')) return;
    try {
      await bookingsAPI.cancel(id);
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert('Failed to cancel: ' + err.message);
    }
  };

  const handleDownload = (booking) => {
    setTicketModal(booking);
  };

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter((b) => {
      const isPast = new Date(b.event_date) < now;
      if (filter === 'cancelled') return b.status === 'cancelled';
      if (b.status === 'cancelled') return false; // Hide cancelled from other filters
      if (filter === 'upcoming') return !isPast;
      if (filter === 'past') return isPast;
      return true;
    });
  };

  const displayedBookings = getFilteredBookings();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 className="section-title">My <span style={{ color: 'var(--primary)' }}>Tickets</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Manage and download all your event passes.</p>
        </div>
        
        {/* Filter Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-card2)', borderRadius: '12px', padding: '4px' }}>
          {['all', 'upcoming', 'past', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', border: 'none', background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                textTransform: 'capitalize', transition: 'all 0.2s'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your tickets...</div>
        ) : displayedBookings.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No tickets found</h3>
            <p>You {"don't"} have any tickets matching this filter.</p>
            <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>Browse Events</Link>
          </div>
        ) : (
          displayedBookings.map(booking => {
            const isCancelled = booking.status === 'cancelled';
            const isPast = new Date(booking.event_date) < new Date();
            
            return (
              <div key={booking.id} className="glass-card" style={{ 
                padding: '24px', display: 'flex', gap: '24px', alignItems: 'center',
                opacity: isCancelled ? 0.6 : 1, transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
              }}>
                {isCancelled && (
                  <div style={{ position: 'absolute', top: '16px', right: '-30px', background: 'var(--error)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 30px', transform: 'rotate(45deg)' }}>
                    CANCELLED
                  </div>
                )}
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '16px', 
                  background: isCancelled ? 'var(--bg-card2)' : 'linear-gradient(135deg, var(--primary), #333333)', 
                  color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Ticket size={32} />
                  <span style={{ fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>x{booking.quantity}</span>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{booking.event_title}</h3>
                    <span style={{ background: 'var(--bg-card2)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      {booking.ticket_type}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarDays size={16} /> {new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>📍 {booking.location}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{booking.total_amount}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
                  <button 
                    onClick={() => handleDownload(booking)}
                    disabled={isCancelled}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '10px', borderRadius: '8px', border: 'none',
                      background: isCancelled ? 'var(--bg-card2)' : 'var(--primary)', 
                      color: isCancelled ? 'var(--text-secondary)' : '#fff',
                      fontSize: '13px', fontWeight: 600, cursor: isCancelled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Download size={16} /> Download
                  </button>
                  
                  {!isCancelled && !isPast && (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '10px', borderRadius: '8px', border: '1px solid var(--error)',
                        background: 'transparent', color: 'var(--error)',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <XCircle size={16} /> Cancel Ticket
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {ticketModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', width: '100%', maxWidth: '400px' }}>
             {/* Ticket Header */}
             <div style={{ background: 'var(--primary)', color: '#fff', padding: '24px', textAlign: 'center', position: 'relative' }}>
                <button onClick={() => setTicketModal(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎟️</div>
                <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{ticketModal.event_title}</h2>
                <div style={{ opacity: 0.9, fontSize: '14px', marginTop: '4px' }}>{ticketModal.category}</div>
             </div>
             {/* Ticket Body */}
             <div style={{ padding: '24px', color: '#0f172a' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                     <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Date</div>
                     <div style={{ fontWeight: 600 }}>{new Date(ticketModal.event_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                     <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Time</div>
                     <div style={{ fontWeight: 600 }}>{new Date(ticketModal.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                     <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Location</div>
                     <div style={{ fontWeight: 600 }}>{ticketModal.location}</div>
                  </div>
               </div>
               
               <div style={{ borderTop: '2px dashed #cbd5e1', borderBottom: '2px dashed #cbd5e1', padding: '16px 0', margin: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                     <div style={{ fontSize: '14px', fontWeight: 800 }}>{ticketModal.ticket_type} Ticket</div>
                     <div style={{ color: '#64748b', fontSize: '13px' }}>Total Amount: ₹{ticketModal.total_amount}</div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, background: '#f1f5f9', padding: '8px 16px', borderRadius: '8px' }}>
                     x{ticketModal.quantity}
                  </div>
               </div>

               <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Booking ID: {ticketModal.id.split('-')[0].toUpperCase()}</div>
                  {/* Fake Barcode */}
                  <div style={{ height: '50px', background: 'repeating-linear-gradient(90deg, #0f172a, #0f172a 2px, transparent 2px, transparent 4px)', opacity: 0.8, margin: '10px auto', width: '80%' }}></div>
               </div>
               
               <button onClick={() => { window.print(); }} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, marginTop: '16px', cursor: 'pointer' }}>
                  Print Ticket
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
