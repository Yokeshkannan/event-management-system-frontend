'use client';

import { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import Sidebar from '@/components/Sidebar';
import { eventsAPI } from '@/lib/api';
import { Search, SlidersHorizontal, MapPin, Calendar, X } from 'lucide-react';

const categories = ['All', 'Technology', 'Music', 'Sports', 'Business', 'Art', 'Education', 'Food'];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('date');
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
      setError('Failed to load events. Please try again.');
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

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('');
    setSortBy('date');
    fetchEvents();
  };

  // Client-side filtering for location
  const filteredEvents = events.filter(e => {
    if (location && !e.location?.toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });

  // Client-side sorting
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'price') {
      const minA = a.ticket_types?.length ? Math.min(...a.ticket_types.map(t => parseFloat(t.price))) : Infinity;
      const minB = b.ticket_types?.length ? Math.min(...b.ticket_types.map(t => parseFloat(t.price))) : Infinity;
      return minA - minB;
    }
    if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  const activeFilters = (category !== 'All' ? 1 : 0) + (location ? 1 : 0) + (search ? 1 : 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />
      <main style={{ flex: 1, width: '100%' }}>
        {/* Hero Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #090914 0%, #111118 50%, #0a0a12 100%)',
            padding: '60px 2rem 40px',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: '-50%', right: '-10%', width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(17,17,17,0.08) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900,
              color: '#f8fafc', marginBottom: '8px',
            }}>
              Explore Events
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px' }}>
              Discover amazing events happening around you
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              style={{
                display: 'flex', flexWrap: 'wrap', gap: '10px',
                background: 'var(--bg-card)', padding: '10px',
                borderRadius: '14px', border: '1px solid var(--border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{
                flex: 2, minWidth: '200px', display: 'flex', alignItems: 'center',
                background: 'var(--bg-dark)', padding: '12px 16px', borderRadius: '10px',
              }}>
                <Search size={18} color="var(--text-secondary)" style={{ marginRight: '10px', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search events by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    width: '100%', color: 'var(--text-primary)', fontSize: '14px',
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
              <div style={{
                flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center',
                background: 'var(--bg-dark)', padding: '12px 16px', borderRadius: '10px',
              }}>
                <MapPin size={18} color="var(--text-secondary)" style={{ marginRight: '10px', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    width: '100%', color: 'var(--text-primary)', fontSize: '14px',
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
              <button type="submit" style={{
                background: 'linear-gradient(135deg, #000000, #111111)', color: '#fff',
                border: 'none', borderRadius: '10px', padding: '0 28px',
                fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s',
              }}>
                <Search size={16} /> Search
              </button>
            </form>
          </div>
        </div>

        {/* Filters + Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 2rem 80px' }}>

          {/* Category Tabs & Sort */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    background: category === cat
                      ? 'linear-gradient(135deg, #000000, #111111)'
                      : 'var(--bg-card)',
                    color: category === cat ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${category === cat ? 'transparent' : 'var(--border)'}`,
                    padding: '8px 18px', borderRadius: '10px',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(239,68,68,0.1)', color: 'var(--error)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    padding: '6px 14px', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <X size={14} /> Clear ({activeFilters})
                </button>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '6px 14px',
              }}>
                <SlidersHorizontal size={14} color="var(--text-secondary)" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <option value="date">Date</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {loading ? 'Loading...' : `${sortedEvents.length} event${sortedEvents.length !== 1 ? 's' : ''} found`}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '12px', padding: '16px', color: '#f87171',
              marginBottom: '24px', textAlign: 'center',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading Skeletons */}
          {loading ? (
            <div className="events-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
              ))}
            </div>
          ) : sortedEvents.length === 0 ? (
            /* Empty State */
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: 'var(--bg-card)', borderRadius: '20px',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
              <h3 style={{
                fontSize: '22px', fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: '10px',
              }}>
                No events found
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
                Try adjusting your filters or search criteria.
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary"
                style={{ padding: '12px 32px' }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Events Grid */
            <div className="events-grid">
              {sortedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
