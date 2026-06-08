'use client';

import Link from 'next/link';

const categoryColors = {
  Technology: { bg: 'rgba(17,17,17,0.15)', color: '#111111', emoji: '💻' },
  Music:      { bg: 'rgba(51,51,51,0.15)', color: '#333333', emoji: '🎵' },
  Sports:     { bg: 'rgba(16,185,129,0.15)', color: '#10b981', emoji: '⚽' },
  Business:   { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', emoji: '💼' },
  Art:        { bg: 'rgba(68,68,68,0.15)', color: '#444444', emoji: '🎨' },
  Education:  { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', emoji: '📚' },
  Food:       { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', emoji: '🍕' },
  Default:    { bg: 'rgba(17,17,17,0.15)', color: '#111111', emoji: '🎪' },
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return {
    day:   d.toLocaleString('en-IN', { weekday: 'short' }),
    date:  d.getDate(),
    month: d.toLocaleString('en-IN', { month: 'short' }),
    year:  d.getFullYear(),
    time:  d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
};

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EventCard({ event }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const cat = categoryColors[event.category] || categoryColors.Default;
  const dt = formatDate(event.date);
  const isPast = new Date(event.date) < new Date();

  const minPrice = event.ticket_types && event.ticket_types.length > 0
    ? Math.min(...event.ticket_types.map(t => parseFloat(t.price)))
    : null;

  const totalAvailable = event.ticket_types
    ? event.ticket_types.reduce((sum, t) => sum + (t.available || 0), 0)
    : null;

  const isSoldOut = totalAvailable !== null && totalAvailable === 0;
  const showImage = event.image_url && !imgError;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => router.push(`/events/${event.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Card Header with gradient or image */}
      <div
        style={{
          height: showImage ? '180px' : '140px',
          background: showImage ? '#111' : `linear-gradient(135deg, ${cat.bg.replace('0.15)', '0.5)')}, var(--bg-card))`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {showImage && (
          <img
            src={event.image_url}
            alt={event.title}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              objectFit: 'cover', zIndex: 0
            }}
          />
        )}
        
        {/* Big emoji (only if no image or image failed) */}
        {!showImage && (
          <div style={{ fontSize: '56px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))', position: 'relative', zIndex: 1 }}>
            {cat.emoji}
          </div>
        )}

        {/* Date badge */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '6px 12px',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {dt.date}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {dt.month}
          </div>
        </div>

        {/* Status badge */}
        {isPast ? (
          <span
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(239,68,68,0.1)', color: 'var(--error)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700,
            }}
          >ENDED</span>
        ) : isSoldOut ? (
          <span
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(239,68,68,0.1)', color: 'var(--error)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700,
            }}
          >SOLD OUT</span>
        ) : (
          <span
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(16,185,129,0.1)', color: 'var(--success)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700,
            }}
          >AVAILABLE</span>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Category */}
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: cat.bg, color: cat.color,
            borderRadius: '6px', padding: '4px 10px',
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            alignSelf: 'flex-start',
          }}
        >
          {event.category}
        </span>

        {/* Title */}
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, margin: 0 }}>
          {event.title}
        </h3>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
            <span>📍</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.location}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
            <span>🕐</span>
            <span>{dt.day}, {dt.time}</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '16px', borderTop: '1px solid var(--border)',
            marginTop: '8px',
          }}
        >
          <div>
            {minPrice !== null ? (
              <>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{minPrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No tickets</span>
            )}
          </div>
          <Link
            href={`/events/${event.id}`}
            style={{ 
              backgroundColor: 'var(--primary)', color: '#fff', 
              textDecoration: 'none', padding: '8px 16px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            onClick={(e) => e.stopPropagation()}
          >
            Buy Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
