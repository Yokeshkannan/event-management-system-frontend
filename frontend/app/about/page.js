  'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
  Shield, Zap, Users, Globe, Heart, Award, ArrowRight,
  Ticket, CreditCard, Clock, Star, CheckCircle, Mail
} from 'lucide-react';

const teamMembers = [
  { name: 'Ticketer Team', role: 'Engineering', initials: 'TT', gradient: 'linear-gradient(135deg, #111111, #333333)' },
  { name: 'Design Studio', role: 'UI/UX Design', initials: 'DS', gradient: 'linear-gradient(135deg, #333333, #555555)' },
  { name: 'Support Crew', role: 'Customer Success', initials: 'SC', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
];

const stats = [
  { value: '10K+', label: 'Events Hosted', icon: <Ticket size={20} /> },
  { value: '50K+', label: 'Tickets Sold', icon: <CreditCard size={20} /> },
  { value: '99.9%', label: 'Uptime', icon: <Clock size={20} /> },
  { value: '4.9★', label: 'User Rating', icon: <Star size={20} /> },
];

const values = [
  { icon: <Shield size={24} />, title: 'Security First', desc: 'Enterprise-grade encryption protects every transaction and personal data on our platform.', color: '#111111' },
  { icon: <Zap size={24} />, title: 'Lightning Fast', desc: 'Optimized infrastructure ensures sub-second booking confirmations every time.', color: '#f59e0b' },
  { icon: <Users size={24} />, title: 'Community Driven', desc: 'Built by event lovers, for event lovers. Your feedback shapes every feature we build.', color: '#10b981' },
  { icon: <Globe size={24} />, title: 'Global Reach', desc: 'Connect with audiences worldwide. Multi-currency support and localized experiences.', color: '#333333' },
  { icon: <Heart size={24} />, title: 'Passion for Events', desc: 'We believe every event deserves a great platform. From small meetups to massive festivals.', color: '#ef4444' },
  { icon: <Award size={24} />, title: 'Quality Assured', desc: 'Rigorous testing and monitoring ensure a flawless experience for organizers and attendees.', color: '#3b82f6' },
];

const faqs = [
  { q: 'How do I create an event?', a: 'Sign up as an organizer, go to your dashboard, and click "Create Event". Fill in the details, add ticket types, and publish!' },
  { q: 'Are refunds available?', a: 'Yes! Flexible tickets include full refund support up to 24 hours before the event. Check each event\'s refund policy.' },
  { q: 'What payment methods are supported?', a: 'We support all major credit/debit cards, UPI, and net banking through our secure payment partners.' },
  { q: 'How do I contact support?', a: 'Reach out through our help center or email us at support@ticketer.com. We typically respond within 2 hours.' },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />
      <main style={{ flex: 1, width: '100%' }}>
        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #090914 0%, #111118 50%, #0a0a12 100%)',
            padding: '80px 2rem 60px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative orbs */}
          <div style={{
            position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(17,17,17,0.08), transparent)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(51,51,51,0.06), transparent)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(17,17,17,0.12)', border: '1px solid rgba(17,17,17,0.25)',
              borderRadius: '20px', padding: '6px 16px', marginBottom: '24px',
              color: '#444444', fontSize: '13px', fontWeight: 600,
            }}>
              <Ticket size={14} /> About Ticketer
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900,
              color: '#f8fafc', lineHeight: 1.2, marginBottom: '16px',
            }}>
              Making Events{' '}
              <span style={{
                background: 'linear-gradient(135deg, #111111, #333333, #555555)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Unforgettable
              </span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '17px', lineHeight: 1.7, marginBottom: '32px' }}>
              Ticketer is the modern event management platform that connects event organizers with passionate attendees.
              We handle the tech so you can focus on creating amazing experiences.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/events" className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
                Explore Events <ArrowRight size={16} />
              </Link>
              <Link href="/register" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '15px' }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{
          maxWidth: '1100px', margin: '-30px auto 0', padding: '0 2rem',
          position: 'relative', zIndex: 10,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '16px', padding: '24px', textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)', marginBottom: '12px',
                }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Values */}
        <div style={{ maxWidth: '1100px', margin: '64px auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              What We Stand For
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
              Our core values guide everything we build and every interaction we have.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {values.map((value, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '18px', padding: '28px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = value.color + '40';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: value.color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: value.color, marginBottom: '16px',
                }}>
                  {value.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {value.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div style={{
          background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)', padding: '64px 2rem',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Our Team
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '40px' }}>
              Passionate people building the future of events
            </p>

            <div style={{
              display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap',
            }}>
              {teamMembers.map((member, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg-dark)', border: '1px solid var(--border)',
                    borderRadius: '18px', padding: '32px', width: '250px',
                    textAlign: 'center', transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: member.gradient, margin: '0 auto 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: 800, color: '#fff',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  }}>
                    {member.initials}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {member.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ maxWidth: '800px', margin: '64px auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Got questions? We've got answers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '14px', overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '20px 24px',
                    background: 'transparent', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', color: 'var(--text-primary)',
                    fontSize: '15px', fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    textAlign: 'left',
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{
                    transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease',
                    color: 'var(--primary)', fontSize: '18px',
                  }}>
                    ▾
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: '0 24px 20px',
                    color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7,
                    animation: 'fadeInUp 0.2s ease forwards',
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          maxWidth: '1100px', margin: '0 auto 80px', padding: '0 2rem',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #000000, #111111, #222222)',
            borderRadius: '24px', padding: '48px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-50px', right: '-50px',
              width: '200px', height: '200px',
              background: 'rgba(255,255,255,0.1)', borderRadius: '50%',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-30px', left: '-30px',
              width: '150px', height: '150px',
              background: 'rgba(255,255,255,0.06)', borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                Ready to Get Started?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '28px', maxWidth: '500px', margin: '0 auto 28px' }}>
                Join thousands of organizers and attendees already using Ticketer to create memorable experiences.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  href="/register"
                  style={{
                    background: '#fff', color: '#111111',
                    padding: '14px 32px', borderRadius: '12px',
                    fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  Create Account <ArrowRight size={16} />
                </Link>
                <Link
                  href="/events"
                  style={{
                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                    padding: '14px 32px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.25)',
                    fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  Browse Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
