'use client';

import { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import Sidebar from '@/components/Sidebar';
import { eventsAPI } from '@/lib/api';
import Link from 'next/link';
import {
  Cpu, Music, Trophy, Briefcase, Palette, BookOpen, UtensilsCrossed,
  Sparkles, ChevronRight, TrendingUp
} from 'lucide-react';

const categoryData = [
  { name: 'Technology', icon: <Cpu size={28} />, gradient: 'linear-gradient(135deg, #111111, #333333)', bg: 'rgba(17,17,17,0.12)', color: '#333333', desc: 'Conferences, hackathons & tech summits' },
  { name: 'Music', icon: <Music size={28} />, gradient: 'linear-gradient(135deg, #333333, #555555)', bg: 'rgba(51,51,51,0.12)', color: '#555555', desc: 'Concerts, festivals & live performances' },
  { name: 'Sports', icon: <Trophy size={28} />, gradient: 'linear-gradient(135deg, #10b981, #34d399)', bg: 'rgba(16,185,129,0.12)', color: '#34d399', desc: 'Tournaments, matches & sports events' },
  { name: 'Business', icon: <Briefcase size={28} />, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', desc: 'Workshops, networking & seminars' },
  { name: 'Art', icon: <Palette size={28} />, gradient: 'linear-gradient(135deg, #444444, #666666)', bg: 'rgba(68,68,68,0.12)', color: '#666666', desc: 'Exhibitions, galleries & creative shows' },
  { name: 'Education', icon: <BookOpen size={28} />, gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', desc: 'Lectures, courses & educational events' },
  { name: 'Food', icon: <UtensilsCrossed size={28} />, gradient: 'linear-gradient(135deg, #ef4444, #f87171)', bg: 'rgba(239,68,68,0.12)', color: '#f87171', desc: 'Food festivals, tastings & culinary events' },
];

export default function CategoriesPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryEvents, setCategoryEvents] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Fetch all events to calculate counts
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await eventsAPI.getAll();
        setEvents(data.events || []);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getCount = (cat) => events.filter(e => e.category === cat).length;

  const handleCategoryClick = async (cat) => {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      setCategoryEvents([]);
      return;
    }
    setSelectedCategory(cat);
    setCategoryLoading(true);
    try {
      const data = await eventsAPI.getAll({ category: cat });
      setCategoryEvents(data.events || []);
    } catch (err) {
      setCategoryEvents([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const uniqueLocations = new Set(events.map(e => e.location)).size;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />
      <main style={{ flex: 1, width: '100%' }}>
        {/* Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, #090914 0%, #111118 50%, #0a0a12 100%)',
            padding: '60px 2rem 50px',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: '-40%', left: '-5%', width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(51,51,51,0.06) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30%', right: '-5%', width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(17,17,17,0.06) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Sparkles size={24} color="#444444" />
              <span style={{ color: '#444444', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Browse by Interest
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900,
              color: '#f8fafc', marginBottom: '8px',
            }}>
              Event Categories
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '600px' }}>
              Find events that match your interests. From tech conferences to music festivals, we've got you covered.
            </p>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '32px', flexWrap: 'wrap' }}>
              {[
                { label: 'Total Events', value: loading ? '—' : totalEvents, icon: <Sparkles size={16} /> },
                { label: 'Upcoming', value: loading ? '—' : upcomingEvents, icon: <TrendingUp size={16} /> },
                { label: 'Locations', value: loading ? '—' : uniqueLocations, icon: <ChevronRight size={16} /> },
              ].map((stat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(17,17,17,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#444444',
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 2rem 80px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '48px',
          }}>
            {categoryData.map((cat) => {
              const count = getCount(cat.name);
              const isSelected = selectedCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  style={{
                    background: isSelected ? cat.bg : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? cat.color + '40' : 'var(--border)'}`,
                    borderRadius: '18px',
                    padding: '28px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 30px ${cat.color}15`;
                    e.currentTarget.style.borderColor = cat.color + '40';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  {/* Decorative corner glow */}
                  <div style={{
                    position: 'absolute', top: '-30px', right: '-30px',
                    width: '100px', height: '100px',
                    background: `radial-gradient(circle, ${cat.color}08, transparent)`,
                    borderRadius: '50%', pointerEvents: 'none',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                    <div>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: cat.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', marginBottom: '16px',
                        boxShadow: `0 4px 12px ${cat.color}30`,
                      }}>
                        {cat.icon}
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {cat.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {cat.desc}
                      </p>
                    </div>
                    <div style={{
                      background: cat.bg, borderRadius: '10px',
                      padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: cat.color }}>
                        {loading ? '—' : count}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      marginTop: '16px', paddingTop: '16px',
                      borderTop: `1px solid ${cat.color}20`,
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: cat.color, fontSize: '13px', fontWeight: 600,
                    }}>
                      Showing events below <ChevronRight size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Category Events */}
          {selectedCategory && (
            <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '24px',
              }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedCategory} Events
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                    {categoryEvents.length} event{categoryEvents.length !== 1 ? 's' : ''} in this category
                  </p>
                </div>
                <Link
                  href={`/events?category=${selectedCategory}`}
                  style={{
                    color: 'var(--primary)', fontSize: '14px', fontWeight: 600,
                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              {categoryLoading ? (
                <div className="events-grid">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
                  ))}
                </div>
              ) : categoryEvents.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '60px 20px',
                  background: 'var(--bg-card)', borderRadius: '16px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    No {selectedCategory} events yet
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Check back soon for new events in this category.
                  </p>
                </div>
              ) : (
                <div className="events-grid">
                  {categoryEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
