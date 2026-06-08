'use client';

import { useState, useEffect } from 'react';
import { eventsAPI, bookingsAPI } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [ticketData, setTicketData] = useState([]);
  const [ticketTypeData, setTicketTypeData] = useState([]);
  const [totals, setTotals] = useState({ revenue: 0, customers: 0, orders: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { events } = await eventsAPI.getMyEvents();
      if (!events || events.length === 0) {
        setLoading(false);
        return;
      }

      const bookingsPromises = events.map(e => bookingsAPI.getEventBookings(e.id).catch(() => ({ bookings: [] })));
      const bookingsResults = await Promise.all(bookingsPromises);
      
      const allBookings = bookingsResults
        .flatMap(res => res.bookings || [])
        .filter(b => b.status === 'confirmed');

      // Aggregate Timeseries Data (Revenue per day)
      const timeseries = {};
      let totalRev = 0;
      const uniqueUsers = new Set();

      allBookings.forEach(b => {
        const dateStr = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!timeseries[dateStr]) timeseries[dateStr] = { date: dateStr, revenue: 0, tickets: 0 };
        
        const amt = parseFloat(b.total_amount || 0);
        timeseries[dateStr].revenue += amt;
        timeseries[dateStr].tickets += b.quantity;
        
        totalRev += amt;
        uniqueUsers.add(b.user_email || b.user_id);
      });

      // Sort by timeline
      const sortedTimeline = Object.values(timeseries)
        .sort((a, b) => new Date(a.date + ' 2026') - new Date(b.date + ' 2026')); // rough sort for demo
      
      setSalesData(sortedTimeline);
      setTotals({ revenue: totalRev, customers: uniqueUsers.size, orders: allBookings.length });

      // Aggregate Category Data (Tickets per event)
      const eventDist = events.map(e => {
        const myBookings = allBookings.filter(b => b.event_title === e.title);
        const ticketsSold = myBookings.reduce((sum, b) => sum + b.quantity, 0);
        return { name: e.title.substring(0, 15) + '...', tickets: ticketsSold };
      }).filter(d => d.tickets > 0);
      // Aggregate by Ticket Type
      const typeDist = {};
      allBookings.forEach(b => {
        const type = b.ticket_type || 'General';
        if (!typeDist[type]) typeDist[type] = 0;
        typeDist[type] += b.quantity;
      });
      const typeDataArray = Object.keys(typeDist).map(k => ({ name: k, value: typeDist[k] }));

      setTicketData(eventDist);
      setTicketTypeData(typeDataArray);

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
          <h1 className="section-title">Platform <span style={{ color: 'var(--primary)' }}>Statistics</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Visualize your audience size and revenue tracking.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading analytics payload...</div>
      ) : totals.orders === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
           Wait for your first booking to unlock analytical graphs!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* KPI Mini-Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Total Conversion Volume</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--success)' }}>₹{totals.revenue.toLocaleString()}</div>
            </div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Unique Customers</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{totals.customers}</div>
            </div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Transaction Iterations</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--warning)' }}>{totals.orders}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.5fr) 1fr', gap: '24px' }}>
            {/* Sales Line Graph */}
            <div className="glass-card" style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>Daily Revenue Growth</h3>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Revenue (INR)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Bar Graph */}
            <div className="glass-card" style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>Ticket Distribution</h3>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ticketData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Bar dataKey="tickets" name="Tickets Sold" fill="#111111" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ticket Type Pie Chart */}
            <div className="glass-card" style={{ padding: '24px', height: '350px', display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>Ticket Type Breakdown</h3>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ticketTypeData} cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.name}: ${entry.value}`} dataKey="value">
                      {ticketTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#111111', '#333333', '#10b981', '#f59e0b', '#555555'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
