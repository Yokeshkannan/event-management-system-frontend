'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventsAPI } from '@/lib/api';
import BookingForm from '@/components/BookingForm';
import { getUser, isAuthenticated } from '@/lib/auth';
import Link from 'next/link';
import { Calendar, MapPin, User, ArrowLeft, Clock, Tag } from 'lucide-react';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const user = typeof window !== 'undefined' ? getUser() : null;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventsAPI.getById(id);
        setEvent(data.event);
      } catch (err) {
        setError('Event not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('book') === 'true' && isAuthenticated()) {
        setShowModal(true);
      }
    }
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-dark)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>🎪</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-dark)' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
        <h2 style={{ color: '#f87171', marginBottom: '8px' }}>{error || 'Event not found'}</h2>
        <Link href="/" className="btn-primary" style={{ marginTop: '16px' }}>Back to Events</Link>
      </div>
    );
  }

  const isPast = new Date(event.date) < new Date();
  const canBook = isAuthenticated() && user?.role === 'attendee' && !isPast;
  const showImage = event.image_url && !imgError;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Hero Banner */}
      <div
        style={{
          position: 'relative',
          background: showImage ? '#111' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: showImage ? '340px' : '200px',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {showImage ? (
          <>
            <img
              src={event.image_url}
              alt={event.title}
              onError={() => setImgError(true)}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                objectFit: 'cover', zIndex: 0,
              }}
            />
            {/* Dark overlay for readability */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              zIndex: 1,
            }} />
          </>
        ) : (
          /* No image — show a clean light header */
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)',
            zIndex: 0,
          }} />
        )}

        <div style={{
          maxWidth: '1100px', width: '100%', margin: '0 auto',
          padding: '24px 2rem 32px', position: 'relative', zIndex: 2,
        }}>
          <Link href="/events" style={{
            color: showImage ? 'rgba(255,255,255,0.8)' : '#64748b',
            textDecoration: 'none', fontSize: '14px',
            display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px',
            background: showImage ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
            padding: '6px 14px', borderRadius: '8px',
            transition: 'all 0.2s',
          }}>
            <ArrowLeft size={14} /> Back to Events
          </Link>

          {/* Category + Status badges */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{
              background: showImage ? 'rgba(255,255,255,0.15)' : '#111111',
              color: showImage ? '#fff' : '#fff',
              borderRadius: '8px', padding: '5px 14px', fontSize: '12px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.5px',
              backdropFilter: showImage ? 'blur(8px)' : 'none',
            }}>
              <Tag size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {event.category}
            </span>
            {isPast ? (
              <span style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', fontWeight: 700 }}>
                ENDED
              </span>
            ) : (
              <span style={{ background: 'rgba(16,185,129,0.9)', color: '#fff', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', fontWeight: 700 }}>
                UPCOMING
              </span>
            )}
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900,
            color: showImage ? '#fff' : '#0f172a',
            lineHeight: 1.15, marginBottom: '0',
            textShadow: showImage ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
          }}>
            {event.title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '40px 2rem 80px',
        display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start',
      }}>
        {/* Left Column — Details */}
        <div>
          {/* Event Meta Cards */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px',
            marginBottom: '28px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: <Calendar size={20} />, label: 'Date & Time', text: formatDate(event.date) },
                { icon: <MapPin size={20} />, label: 'Venue', text: event.location },
                { icon: <User size={20} />, label: 'Organized by', text: event.organizer_name },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'var(--bg-card2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Type Summary */}
          {event.ticket_types && event.ticket_types.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px', padding: '24px',
              marginBottom: '28px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                🎟️ Ticket Options
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {event.ticket_types.map((tt) => (
                  <div
                    key={tt.id}
                    style={{
                      background: 'var(--bg-card2)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px', padding: '16px 20px',
                      flex: '1 1 140px', minWidth: '140px',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px', marginBottom: '6px' }}>{tt.type_name}</div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '22px', marginBottom: '4px' }}>₹{parseFloat(tt.price).toLocaleString()}</div>
                    <div style={{
                      color: (tt.available ?? 0) > 0 ? '#10b981' : '#ef4444',
                      fontSize: '12px', fontWeight: 600,
                    }}>
                      {(tt.available ?? 0) > 0 ? `✅ ${tt.available} left` : '❌ Sold Out'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Section */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              About This Event
            </h2>
            <div style={{
              color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.8,
            }}>
              {event.description || 'No description provided for this event.'}
            </div>
          </div>
        </div>

        {/* Right Column — Booking Panel */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '28px',
            position: 'sticky',
            top: '90px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px', marginBottom: '4px' }}>
            🎟️ Ready to join?
          </h3>

          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            Reserve your tickets safely online.
          </div>

          {/* Price preview */}
          {event.ticket_types && event.ticket_types.length > 0 && (
            <div style={{
              background: 'var(--bg-card2)',
              borderRadius: '12px', padding: '14px 18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Starting from</span>
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '22px' }}>
                ₹{Math.min(...event.ticket_types.map(t => parseFloat(t.price))).toLocaleString()}
              </span>
            </div>
          )}

          {!isAuthenticated() ? (
            <div style={{ textAlign: 'center' }}>
              <Link href={`/login?redirect=${encodeURIComponent('/events/' + event.id + '?book=true')}`} className="btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', padding: '14px' }}>
                Login to Buy
              </Link>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px' }}>
                No account? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register free</Link>
              </p>
            </div>
          ) : user?.role === 'organizer' ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '12px', background: 'var(--bg-card2)', borderRadius: '10px' }}>
              Organizers cannot book tickets. Use an attendee account.
            </p>
          ) : isPast ? (
            <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px', padding: '12px', background: 'rgba(239,68,68,0.06)', borderRadius: '10px' }}>
              This event has ended. Bookings are closed.
            </p>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 700 }}
            >
              Buy Ticket
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px', width: '100%', maxWidth: '500px',
            maxHeight: '90vh', overflowY: 'auto',
            padding: '30px', position: 'relative'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                fontSize: '24px', cursor: 'pointer'
              }}
            >
              &times;
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Complete your Booking
            </h2>
            <BookingForm event={event} />
          </div>
        </div>
      )}
    </div>
  );
}
