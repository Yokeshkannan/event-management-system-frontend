/**
 * src/controllers/ticketController.js
 * Ticket & Payment Controller — Adapter Design Pattern
 *
 * Design Pattern: ADAPTER PATTERN
 * Problem: Razorpay and Stripe have completely different APIs.
 *          The booking system shouldn't care which gateway is used.
 *
 * Solution: Define a PaymentGateway interface (abstract contract).
 *           RazorpayAdapter and StripeAdapter implement the same interface.
 *           The booking system calls the interface — not the vendor SDK directly.
 *
 * Structure:
 *   <<interface>> PaymentGateway
 *       + initiatePayment(amount, currency, metadata) → { transactionId, status }
 *       + verifyPayment(transactionId) → boolean
 *       + refundPayment(transactionId, amount) → boolean
 *
 *   RazorpayAdapter implements PaymentGateway
 *   StripeAdapter  implements PaymentGateway
 *   PaymentGatewayFactory.getAdapter(gateway) → PaymentGateway
 */

const { query } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// ══════════════════════════════════════════════════════════════════════════════
// ADAPTER PATTERN: Payment Gateway Abstractions
// ══════════════════════════════════════════════════════════════════════════════

/**
 * RazorpayAdapter
 * Adapts the Razorpay payment API to our standard PaymentGateway interface
 * Using sandbox/mock implementation — no real money is moved
 */
class RazorpayAdapter {
  constructor() {
    this.name = 'razorpay';
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';
    console.log('[Adapter] RazorpayAdapter initialized');
  }

  /**
   * Simulate Razorpay order creation
   * Real implementation: razorpay.orders.create({ amount, currency, receipt })
   */
  async initiatePayment(amount, currency = 'INR', metadata = {}) {
    console.log(`[Razorpay] Creating order for ₹${amount} ${currency}`);

    // Mock: simulate a Razorpay order response
    await new Promise(r => setTimeout(r, 100)); // Simulate network delay

    const transactionId = `pay_rzp_${uuidv4().replace(/-/g, '').substring(0, 14)}`;
    const orderId = `order_rzp_${uuidv4().replace(/-/g, '').substring(0, 14)}`;

    return {
      transactionId,
      orderId,
      status: 'captured',        // Razorpay: captured = success
      amount,
      currency,
      gateway: 'razorpay',
      gatewayResponse: {
        razorpay_payment_id: transactionId,
        razorpay_order_id: orderId,
        razorpay_signature: `mock_sig_${Date.now()}`,
      },
    };
  }

  /**
   * Verify Razorpay payment (mock: always returns true in sandbox)
   * Real implementation: verify HMAC signature
   */
  async verifyPayment(transactionId) {
    console.log(`[Razorpay] Verifying payment: ${transactionId}`);
    return transactionId.startsWith('pay_rzp_'); // Mock verification
  }

  /**
   * Razorpay refund (mock)
   * Real implementation: razorpay.payments.refund(paymentId, { amount })
   */
  async refundPayment(transactionId, amount) {
    console.log(`[Razorpay] Processing refund for ${transactionId}: ₹${amount}`);
    return { success: true, refundId: `rfnd_${uuidv4().substring(0, 10)}` };
  }
}

/**
 * StripeAdapter
 * Adapts the Stripe payment API to the same PaymentGateway interface
 * Using sandbox/mock implementation
 */
class StripeAdapter {
  constructor() {
    this.name = 'stripe';
    this.secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
    console.log('[Adapter] StripeAdapter initialized');
  }

  /**
   * Simulate Stripe PaymentIntent creation
   * Real implementation: stripe.paymentIntents.create({ amount, currency })
   * Note: Stripe amounts are in smallest currency unit (paise/cents)
   */
  async initiatePayment(amount, currency = 'inr', metadata = {}) {
    console.log(`[Stripe] Creating PaymentIntent for ${amount} ${currency}`);

    await new Promise(r => setTimeout(r, 120)); // Simulate network delay

    const transactionId = `pi_stripe_${uuidv4().replace(/-/g, '').substring(0, 14)}`;

    return {
      transactionId,
      clientSecret: `${transactionId}_secret_mock`,
      status: 'succeeded',       // Stripe: succeeded = success
      amount,
      currency: currency.toLowerCase(),
      gateway: 'stripe',
      gatewayResponse: {
        id: transactionId,
        object: 'payment_intent',
        status: 'succeeded',
        amount: amount * 100,    // Stripe uses cents/paise
        currency: currency.toLowerCase(),
      },
    };
  }

  /**
   * Verify Stripe payment intent (mock)
   * Real implementation: stripe.paymentIntents.retrieve(paymentIntentId)
   */
  async verifyPayment(transactionId) {
    console.log(`[Stripe] Verifying payment: ${transactionId}`);
    return transactionId.startsWith('pi_stripe_');
  }

  /**
   * Stripe refund (mock)
   * Real implementation: stripe.refunds.create({ payment_intent })
   */
  async refundPayment(transactionId, amount) {
    console.log(`[Stripe] Processing refund for ${transactionId}: ${amount}`);
    return { success: true, refundId: `re_stripe_${uuidv4().substring(0, 10)}` };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// FACTORY: Returns the appropriate adapter based on gateway name
// Usage: PaymentGatewayFactory.getAdapter('razorpay') → RazorpayAdapter
// ══════════════════════════════════════════════════════════════════════════════
class PaymentGatewayFactory {
  static getAdapter(gateway) {
    switch (gateway.toLowerCase()) {
      case 'razorpay':
        return new RazorpayAdapter();
      case 'stripe':
        return new StripeAdapter();
      default:
        throw new Error(`Unknown payment gateway: ${gateway}. Use 'razorpay' or 'stripe'`);
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Shared processPayment — used by bookingController
// ══════════════════════════════════════════════════════════════════════════════

/**
 * processPayment — called by the booking pipeline
 * Uses the Adapter to charge and records the payment in DB
 */
const processPayment = async ({ bookingId, amount, gateway, userId }) => {
  try {
    // Get the correct adapter (Adapter Pattern in action)
    const adapter = PaymentGatewayFactory.getAdapter(gateway || 'razorpay');

    // Initiate payment via adapter's unified interface
    const paymentResult = await adapter.initiatePayment(amount, 'INR', {
      bookingId,
      userId,
    });

    // Save payment record to database
    await query(
      `INSERT INTO payments (booking_id, amount, gateway, status, transaction_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [bookingId, amount, gateway, paymentResult.status, paymentResult.transactionId]
    );

    return {
      transactionId: paymentResult.transactionId,
      gateway: paymentResult.gateway,
      status: paymentResult.status,
      amount,
    };

  } catch (err) {
    console.error('processPayment error:', err);
    throw { status: 500, message: `Payment processing failed: ${err.message}` };
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// HTTP Controllers for ticket type management
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/tickets/types
 * Add a ticket type to an event (organizer only)
 *
 * Body: { event_id, type_name, price, capacity }
 */
const createTicketType = async (req, res) => {
  try {
    const { event_id, type_name, price, capacity } = req.body;

    if (!event_id || !type_name || price === undefined || !capacity) {
      return res.status(400).json({
        error: 'event_id, type_name, price, and capacity are required',
      });
    }

    // Verify organizer owns this event
    const ownerCheck = await query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [event_id, req.user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not own this event' });
    }

    const result = await query(
      `INSERT INTO ticket_types (event_id, type_name, price, capacity, booked_count)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING *`,
      [event_id, type_name, price, capacity]
    );

    return res.status(201).json({
      message: 'Ticket type created',
      ticketType: result.rows[0],
    });

  } catch (err) {
    console.error('createTicketType error:', err);
    return res.status(500).json({ error: 'Failed to create ticket type' });
  }
};

/**
 * GET /api/tickets/event/:eventId
 * Get all ticket types for an event
 */
const getTicketTypesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await query(
      `SELECT *, (capacity - booked_count) AS available
       FROM ticket_types
       WHERE event_id = $1
       ORDER BY price ASC`,
      [eventId]
    );

    return res.status(200).json({ ticketTypes: result.rows });

  } catch (err) {
    console.error('getTicketTypesByEvent error:', err);
    return res.status(500).json({ error: 'Failed to fetch ticket types' });
  }
};

/**
 * PUT /api/tickets/types/:id
 * Update a ticket type (organizer only)
 */
const updateTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_name, price, capacity } = req.body;

    // Verify organizer owns the event this ticket type belongs to
    const ownerCheck = await query(
      `SELECT tt.id FROM ticket_types tt
       JOIN events e ON tt.event_id = e.id
       WHERE tt.id = $1 AND e.organizer_id = $2`,
      [id, req.user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await query(
      `UPDATE ticket_types
       SET type_name = COALESCE($1, type_name),
           price = COALESCE($2, price),
           capacity = COALESCE($3, capacity)
       WHERE id = $4
       RETURNING *, (capacity - booked_count) AS available`,
      [type_name, price, capacity, id]
    );

    return res.status(200).json({
      message: 'Ticket type updated',
      ticketType: result.rows[0],
    });

  } catch (err) {
    console.error('updateTicketType error:', err);
    return res.status(500).json({ error: 'Failed to update ticket type' });
  }
};

/**
 * POST /api/tickets/charge
 * Directly charge a payment via chosen gateway (demo endpoint)
 * Body: { booking_id, amount, gateway }
 */
const chargePayment = async (req, res) => {
  try {
    const { booking_id, amount, gateway } = req.body;

    if (!booking_id || !amount || !gateway) {
      return res.status(400).json({ error: 'booking_id, amount, and gateway are required' });
    }

    const result = await processPayment({
      bookingId: booking_id,
      amount: parseFloat(amount),
      gateway,
      userId: req.user.id,
    });

    return res.status(200).json({
      message: 'Payment processed successfully',
      payment: result,
    });

  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Payment failed' });
  }
};

module.exports = {
  createTicketType,
  getTicketTypesByEvent,
  updateTicketType,
  chargePayment,
  processPayment, // exported for bookingController
  RazorpayAdapter,
  StripeAdapter,
  PaymentGatewayFactory,
};
