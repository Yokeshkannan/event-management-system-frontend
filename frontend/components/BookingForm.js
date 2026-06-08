'use client';

import { useState } from 'react';
import { bookingsAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function BookingForm({ event }) {
  const router = useRouter();
  const [selectedTicketType, setSelectedTicketType] = useState(() => {
    const firstAvail = event?.ticket_types?.find(
      (tt) => (tt.available ?? (tt.capacity - (tt.booked_count || 0))) > 0
    );
    return firstAvail ? firstAvail.id : null;
  });
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [gateway, setGateway] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const ticketTypes = event?.ticket_types || [];
  const selected = ticketTypes.find(tt => tt.id === selectedTicketType);
  const baseTotal = selected ? parseFloat(selected.price) * quantity : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!selectedTicketType) {
      setError('Please select a ticket type');
      return;
    }

    setLoading(true);
    try {
      const data = await bookingsAPI.create({
        event_id: event.id,
        ticket_type_id: selectedTicketType,
        quantity,
        promo_code: promoCode || undefined,
        payment_gateway: gateway,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div
        style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '16px',
          padding: '28px',
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
        <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
          Booking Confirmed!
        </h3>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          Your tickets have been booked successfully.
        </p>

        <div
          style={{
            background: 'rgba(15,15,26,0.6)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {[
            ['Event', result.event?.title],
            ['Ticket Type', result.ticket?.type],
            ['Quantity', result.ticket?.quantity],
            ['Total Paid', `₹${result.ticket?.totalAmount}`],
            ['Discount', result.ticket?.discount],
            ['Gateway', result.payment?.gateway?.toUpperCase()],
            ['Transaction ID', result.payment?.transactionId],
            ['Status', result.booking?.status?.toUpperCase()],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>{k}</span>
              <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard/attendee')}
          className="btn-primary"
          style={{ marginTop: '20px', width: '100%' }}
        >
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Ticket Type Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label className="input-label">Select Ticket Type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ticketTypes.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>No ticket types available.</p>
          ) : (
            ticketTypes.map((tt) => {
              const available = tt.available ?? (tt.capacity - tt.booked_count);
              const isSoldOut = available <= 0;
              const isSelected = selectedTicketType === tt.id;

              return (
                <div
                  key={tt.id}
                  onClick={() => !isSoldOut && setSelectedTicketType(tt.id)}
                  style={{
                    border: `2px solid ${isSelected ? '#111111' : 'rgba(17,17,17,0.15)'}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    cursor: isSoldOut ? 'not-allowed' : 'pointer',
                    background: isSelected ? 'rgba(17,17,17,0.1)' : 'rgba(255,255,255,0.02)',
                    opacity: isSoldOut ? 0.5 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '15px' }}>
                      {tt.type_name}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                      {isSoldOut ? '❌ Sold Out' : `✅ ${available} seats left`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#444444' }}>
                      ₹{parseFloat(tt.price).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>per ticket</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: '16px' }}>
        <label className="input-label">Quantity</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            style={{
              width: 38, height: 38, borderRadius: '8px', border: '1px solid rgba(17,17,17,0.3)',
              background: 'rgba(17,17,17,0.1)', color: '#444444', fontSize: '20px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >−</button>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '18px', minWidth: '30px', textAlign: 'center' }}>
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(5, quantity + 1))}
            style={{
              width: 38, height: 38, borderRadius: '8px', border: '1px solid rgba(17,17,17,0.3)',
              background: 'rgba(17,17,17,0.1)', color: '#444444', fontSize: '20px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >+</button>
        </div>
      </div>

      {/* Promo Code */}
      <div style={{ marginBottom: '16px' }}>
        <label className="input-label">Promo Code (optional)</label>
        <input
          type="text"
          className="input-field"
          placeholder="Try SAVE20"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
        />
      </div>

      {/* Payment Gateway */}
      <div style={{ marginBottom: '20px' }}>
        <label className="input-label">Payment Gateway</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['razorpay', 'stripe'].map((gw) => (
            <button
              key={gw}
              type="button"
              onClick={() => setGateway(gw)}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: `2px solid ${gateway === gw ? '#111111' : 'rgba(17,17,17,0.15)'}`,
                background: gateway === gw ? 'rgba(17,17,17,0.1)' : 'transparent',
                color: gateway === gw ? '#444444' : '#64748b',
                fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                transition: 'all 0.2s', textTransform: 'capitalize',
              }}
            >
              {gw === 'razorpay' ? '🇮🇳 Razorpay' : '💳 Stripe'}
            </button>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      {selected && (
        <div
          style={{
            background: 'rgba(17,17,17,0.07)',
            border: '1px solid rgba(17,17,17,0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b', fontSize: '14px' }}>
              {selected.type_name} × {quantity} (Subtotal)
            </span>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>
              ₹{(parseFloat(selected.price) * quantity).toLocaleString()}
            </span>
          </div>
          {promoCode.toUpperCase() === 'SAVE20' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#34d399', fontSize: '14px' }}>Discount (SAVE20)</span>
              <span style={{ color: '#34d399', fontSize: '14px' }}>-20%</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid rgba(17,17,17,0.15)', paddingTop: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>Total (est.)</span>
            <span style={{ color: '#444444', fontWeight: 800, fontSize: '18px' }}>
              ₹{(promoCode.toUpperCase() === 'SAVE20' ? baseTotal * 0.8 : baseTotal).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '12px 16px', color: '#f87171',
            fontSize: '14px', marginBottom: '16px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="btn-primary"
        style={{ width: '100%', padding: '14px' }}
        disabled={loading || !selectedTicketType}
      >
        {loading ? (
          <span>Processing...</span>
        ) : (
          <>🎫 Book Tickets — {gateway.charAt(0).toUpperCase() + gateway.slice(1)}</>
        )}
      </button>

      <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px', marginTop: '12px' }}>
        🔒 Secure payment via {gateway} (sandbox/demo mode)
      </p>
    </form>
  );
}
