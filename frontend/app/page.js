'use client';

import { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import { eventsAPI } from '@/lib/api';
import Link from 'next/link';
import { Search, Calendar, MapPin, CreditCard, ShieldCheck, Ticket, RotateCcw, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      const data = await eventsAPI.getAll(params);
      setEvents(data.events || []);
    } catch (err) {
      setError('Failed to fetch events from the server. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  // Group events for BookMyShow style display
  const displayEvents = events;
  const recommendedEvents = displayEvents.slice(0, 8);
  const musicEvents = displayEvents.filter(e => e.category === 'Music');
  const techEvents = displayEvents.filter(e => e.category === 'Technology');
  const otherEvents = displayEvents.filter(e => e.category !== 'Music' && e.category !== 'Technology');

  const EventCarousel = ({ title, items, fallbackTitle }) => {
    if (!loading && items.length === 0) return null;

    return (
      <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h2>
          <Link href="/events" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            See All <ChevronRight size={16} />
          </Link>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
             {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ width: '280px', height: '320px', flexShrink: 0, borderRadius: '16px' }} />
             ))}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px',
            scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'
          }}>
            {items.map((event) => (
              <div key={event.id} style={{ width: '300px', flexShrink: 0 }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />
      <main style={{ flex: 1, width: '100%' }}>
        {/* ── TICKETER STYLE HERO SECTION ───────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            padding: '100px 2rem 220px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #090914 0%, #0a0a12 100%)',
            color: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', zIndex: 2 }}>
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: '16px',
              }}
            >
              Book Tickets Of Your Favorite Events!
            </h1>
            <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '40px' }}>
              Make Sure Don't Miss These Upcoming Experiences.
            </p>

            {/* Search Bar matching Ticketer style */}
            <form
              onSubmit={handleSearch}
              style={{
                display: 'flex', flexWrap: 'wrap', gap: '10px',
                background: '#ffffff', padding: '10px', borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
                <Search size={18} color="#64748b" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Type Event Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#0f172a', fontSize: '14px' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
                <Calendar size={18} color="#64748b" style={{ marginRight: '8px' }} />
                <select style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#0f172a', fontSize: '14px', cursor: 'pointer' }}>
                  <option value="">Any Date</option>
                  <option value="today">Today</option>
                  <option value="weekend">This Weekend</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
                <MapPin size={18} color="#64748b" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#0f172a', fontSize: '14px' }}
                />
              </div>
              <button type="submit" style={{
                background: 'linear-gradient(135deg, #000000, #111111)', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '0 32px', fontWeight: 600, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                Find Ticket
              </button>
            </form>

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              {['All', 'Technology', 'Music', 'Sports', 'Business'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    background: category === cat ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    color: category === cat ? '#fff' : '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BookMyShow Style Carousel Sections ───────────────────────────────────── */}
        <div style={{ maxWidth: '1200px', margin: '-140px auto 0', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
          
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '16px', color: '#f87171', marginBottom: '24px', textAlign: 'center' }}>
              ⚠️ {error} - Please try logging in or refreshing.
            </div>
          )}

          {!loading && events.length === 0 && !error ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No events found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria or changing the category filter.</p>
            </div>
          ) : (
            <>
              <EventCarousel title="Recommended Events" items={recommendedEvents} fallbackTitle="All Events" />
              
              {(category === 'All' || category === 'Music') && <EventCarousel title="Upcoming Music Concerts" items={musicEvents} />}
              
              {(category === 'All' || category === 'Technology') && <EventCarousel title="Top Technology Summits" items={techEvents} />}
              
              {category === 'All' && <EventCarousel title="Other Experiences" items={otherEvents} />}
            </>
          )}
        </div>

        {/* ── Our Benefits Section ───────────────────────────────────── */}
        <div style={{ maxWidth: '1200px', margin: '40px auto 80px', padding: '0 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Our Benefits</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            we promise users with the standard of these 4 services
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
            {[
              { icon: <CreditCard size={32} color="#111111" />, title: 'Instalment Payment!', desc: 'You can pay is install in 3 portions throughout a final period of time.' },
              { icon: <ShieldCheck size={32} color="#10b981" />, title: 'Online Booking!', desc: 'Securely book your tickets online instantly through our platform.' },
              { icon: <RotateCcw size={32} color="#f59e0b" />, title: 'Refundable Tickets!', desc: 'Easy cancellation and refunds standard with all flexible tickets.' },
              { icon: <Ticket size={32} color="#111111" />, title: 'Cheapest Tickets!', desc: 'We guarantee the lowest transaction fees in the market.' },
            ].map((benefit, i) => (
              <div key={i} style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--bg-card)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                  {benefit.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{benefit.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
