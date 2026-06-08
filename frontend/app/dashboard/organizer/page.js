'use client';

import { useState, useEffect } from 'react';
import { eventsAPI, bookingsAPI } from '@/lib/api';
import Link from 'next/link';
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [globalBookings, setGlobalBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await eventsAPI.getMyEvents();
      const myEvents = data.events || [];
      setEvents(myEvents);

      // Fetch bookings for all events to compile master history and revenue
      const bookingsPromises = myEvents.map(e => bookingsAPI.getEventBookings(e.id).catch(() => ({ bookings: [] })));
      const bookingsResults = await Promise.all(bookingsPromises);
      
      const allBookings = bookingsResults
        .flatMap(res => res.bookings || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Latest first
        
      setGlobalBookings(allBookings);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = globalBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
    
  const totalBookings = globalBookings.filter(b => b.status === 'confirmed').length;
  const activeEvents = events.filter(e => new Date(e.date) >= new Date()).length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ── TOP SECTION: OVERVIEW ── */}
      <h1 className="section-title" style={{ marginBottom: '24px' }}>Overview of <span style={{ color: 'var(--primary)' }}>all events</span></h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Main Stats Card */}
        <div className="glass-card" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Total Revenue</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px' }}>
              Lifetime earnings from all events
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', textAlign: 'right' }}>Active Events</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--warning)', textAlign: 'right' }}>
              {activeEvents}
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Tickets Sold</div>
            <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{totalBookings}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Events Created</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{events.length}</div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <Link href="/dashboard/organizer/events" style={{ 
              background: 'var(--primary)', color: '#fff', borderRadius: '8px', 
              padding: '10px 16px', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              <Plus size={16} /> Manage Events
            </Link>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION: CHARTS & LISTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 2fr) 1fr', gap: '24px' }}>
        
        <div>
          {/* Faux Statistics Chart (Real Implementation handled in /statistics route via recharts) */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', height: '280px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Sales Snapshot</h3>
              <Link href="/dashboard/organizer/statistics" style={{ fontSize: '12px', background: 'var(--primary)', color: '#fff', padding: '4px 12px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600 }}>Detailed Stats</Link>
            </div>
            
            {loading ? (
               <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading graphs...</div>
            ) : totalRevenue === 0 ? (
               <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No sales driven yet.</div>
            ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px', paddingTop: '20px' }}>
                    {/* Generative dummy bars for aesthetic snapshot (Real recharts implementation inside Statistics route) */}
                    {[30, 50, 40, 80, 60, 90, 70].map((h, i) => (
                        <div key={i} style={{ 
                        flex: 1, background: i === 5 ? 'var(--success)' : 'var(--bg-card2)', 
                        height: `${h}%`, borderRadius: '6px 6px 0 0',
                        position: 'relative', transition: 'all 0.3s'
                        }} />
                    ))}
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 }}>
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
            </div>
          </div>

          {/* Events List Segment */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }} id="events">
            Recent Events
          </h2>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : events.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No events created yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card2)', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px' }}>Event Details</th>
                    <th style={{ padding: '16px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 5).map(ev => {
                    const isPast = new Date(ev.date) < new Date();
                    return (
                      <tr key={ev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{ev.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ev.category} • {ev.location}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                            {new Date(ev.date).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '11px', color: isPast ? 'var(--error)' : 'var(--success)', fontWeight: 600 }}>
                            {isPast ? 'ENDED' : 'UPCOMING'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-card2)' }}>
              <Link href="/dashboard/organizer/events" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>View Total Roster</Link>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: HISTORY LOGS ── */}
        <div>
          <div className="glass-card" style={{ padding: '24px', height: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Bookings Feed
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <div style={{ color: 'var(--text-secondary)' }}>Loading feed...</div>
              ) : globalBookings.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No bookings active.</div>
              ) : globalBookings.slice(0, 10).map((item, i) => {
                const isCancelled = item.status === 'cancelled';
                return (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: i === 9 ? 'none' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                        {isCancelled ? <ArrowDownRight size={18} color="var(--error)" /> : <ArrowUpRight size={18} color="var(--success)" />}
                      </div>
                      <div style={{ maxWidth: '130px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                           {item.user_name || item.user_email || 'Attendee User'} 
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                           {item.event_title}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontWeight: 700, color: isCancelled ? 'var(--text-secondary)' : 'var(--success)', fontSize: '14px' }}>
                         {isCancelled ? '-' : '+'} ₹{item.total_amount}
                       </div>
                       <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                         {new Date(item.created_at).toLocaleDateString()}
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {globalBookings.length > 10 && (
                <Link href="/dashboard/organizer/attendees" style={{ display: 'block', width: '100%', marginTop: '24px', padding: '12px', background: 'var(--bg-card2)', textAlign: 'center', border: 'none', borderRadius: '8px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                See full ledger
                </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
