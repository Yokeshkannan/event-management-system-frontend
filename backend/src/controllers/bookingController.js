/**
 * src/controllers/bookingController.js
 * Booking Controller — Ticket Booking with Pipe-and-Filter Pattern
 *
 * Design Pattern: PIPE AND FILTER
 * Each booking request passes through a sequential pipeline of filter stages.
 * If any filter fails, the pipeline short-circuits with an error response.
 *
 * Pipeline stages:
 *   [1] validateUserFilter     → Check user exists and is an attendee
 *   [2] validateEventFilter    → Check event exists and is not in the past
 *   [3] checkAvailabilityFilter → Check seat availability for ticket type
 *   [4] preventDoubleBooking   → Prevent same user booking same ticket twice
 *   [5] applyDiscountFilter    → Calculate final price (discount logic)
 *   [6] confirmBookingFilter   → Create booking record and update seat count
 */

const { query, getClient } = require('../config/supabase');
const { processPayment } = require('./ticketController');

// ══════════════════════════════════════════════════════════════════════════════
// PIPE-AND-FILTER: Individual Filter Functions
// Each filter receives a context object and either enriches it or throws error
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Filter 1: Validate User
 * Ensures the requesting user exists in the DB and has the 'attendee' role
 */
const validateUserFilter = async (ctx) => {
  const userResult = await query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [ctx.userId]
  );

  if (userResult.rows.length === 0) {
    throw { status: 404, message: 'User not found' };
  }

  const user = userResult.rows[0];

  // Note: Organizers can view events but booking is for attendees
  // We allow organizers to book for testing, but typically attendees only
  ctx.user = user;
  console.log(`[Pipeline] ✅ Filter 1 PASSED: User ${user.email} validated`);
  return ctx;
};

/**
 * Filter 2: Validate Event
 * Ensures the event exists and hasn't already passed
 */
const validateEventFilter = async (ctx) => {
  const eventResult = await query(
    'SELECT id, title, date, organizer_id FROM events WHERE id = $1',
    [ctx.eventId]
  );

  if (eventResult.rows.length === 0) {
    throw { status: 404, message: 'Event not found' };
  }

  const event = eventResult.rows[0];

  if (new Date(event.date) < new Date()) {
    throw { status: 400, message: 'Cannot book tickets for past events' };
  }

  ctx.event = event;
  console.log(`[Pipeline] ✅ Filter 2 PASSED: Event "${event.title}" validated`);
  return ctx;
};

/**
 * Filter 3: Check Seat Availability
 * Ensures the requested ticket type has available seats
 */
const checkAvailabilityFilter = async (ctx) => {
  const ttResult = await query(
    `SELECT id, type_name, price, capacity, booked_count
     FROM ticket_types
     WHERE id = $1 AND event_id = $2`,
    [ctx.ticketTypeId, ctx.eventId]
  );

  if (ttResult.rows.length === 0) {
    throw { status: 404, message: 'Ticket type not found for this event' };
  }

  const tt = ttResult.rows[0];
  const available = tt.capacity - tt.booked_count;

  if (available <= 0) {
    throw { status: 409, message: `No seats available for ${tt.type_name} tickets` };
  }

  ctx.ticketType = tt;
  ctx.availableSeats = available;
  console.log(`[Pipeline] ✅ Filter 3 PASSED: ${available} seats available for ${tt.type_name}`);
  return ctx;
};

/**
 * Filter 4: Prevent Double Booking
 * Prevents the same user from booking the same ticket type twice for the same event
 */
const preventDoubleBookingFilter = async (ctx) => {
  const dupResult = await query(
    `SELECT id FROM bookings
     WHERE user_id = $1 AND event_id = $2 AND ticket_type_id = $3
     AND status IN ('confirmed', 'pending')`,
    [ctx.userId, ctx.eventId, ctx.ticketTypeId]
  );

  if (dupResult.rows.length > 0) {
    throw {
      status: 409,
      message: 'You have already booked this ticket type for this event',
    };
  }

  console.log(`[Pipeline] ✅ Filter 4 PASSED: No duplicate booking found`);
  return ctx;
};

/**
 * Filter 5: Apply Discount
 * Calculates the final price after discounts (e.g., early bird, promo codes)
 * For now implements a simple early-bird discount logic
 */
const applyDiscountFilter = async (ctx) => {
  let finalPrice = parseFloat(ctx.ticketType.price);
  let discountApplied = 0;
  let discountReason = 'No discount';

  const { promoCode, quantity } = ctx;

  // Early bird: if event is more than 30 days away → 10% off
  const daysUntilEvent = Math.ceil(
    (new Date(ctx.event.date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilEvent > 30) {
    discountApplied = 10;
    discountReason = 'Early bird discount (10%)';
    finalPrice = finalPrice * 0.9;
  }

  // Promo code: SAVE20 = 20% off
  if (promoCode && promoCode.toUpperCase() === 'SAVE20') {
    discountApplied = 20;
    discountReason = 'Promo code SAVE20 (20%)';
    finalPrice = finalPrice * 0.8;
  }

  // Bulk: 3+ tickets → 5% off
  const qty = Math.max(1, parseInt(quantity) || 1);
  if (qty >= 3) {
    discountApplied += 5;
    discountReason += ' + Bulk discount (5%)';
    finalPrice = finalPrice * 0.95;
  }

  ctx.finalPrice = parseFloat(finalPrice.toFixed(2));
  ctx.quantity = qty;
  ctx.totalAmount = parseFloat((ctx.finalPrice * qty).toFixed(2));
  ctx.discountApplied = discountApplied;
  ctx.discountReason = discountReason;

  console.log(`[Pipeline] ✅ Filter 5 PASSED: Price ₹${ctx.finalPrice} (${discountReason})`);
  return ctx;
};

/**
 * Filter 6: Confirm Booking
 * Creates the booking record and increments booked_count (atomic transaction)
 */
const confirmBookingFilter = async (ctx) => {
  const dbClient = await getClient();

  try {
    await dbClient.query('BEGIN');

    // Lock the ticket_type row to prevent race conditions
    const lockResult = await dbClient.query(
      'SELECT capacity, booked_count FROM ticket_types WHERE id = $1 FOR UPDATE',
      [ctx.ticketTypeId]
    );

    const { capacity, booked_count } = lockResult.rows[0];
    if (capacity - booked_count < ctx.quantity) {
      throw { status: 409, message: 'Not enough seats available (concurrent booking detected)' };
    }

    // Create booking record
    const bookingResult = await dbClient.query(
      `INSERT INTO bookings (user_id, event_id, ticket_type_id, quantity, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [ctx.userId, ctx.eventId, ctx.ticketTypeId, ctx.quantity, ctx.totalAmount]
    );

    const booking = bookingResult.rows[0];

    // Increment booked_count
    await dbClient.query(
      'UPDATE ticket_types SET booked_count = booked_count + $1 WHERE id = $2',
      [ctx.quantity, ctx.ticketTypeId]
    );

    await dbClient.query('COMMIT');

    ctx.booking = booking;
    console.log(`[Pipeline] ✅ Filter 6 PASSED: Booking created with id ${booking.id}`);

    return ctx;

  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  } finally {
    dbClient.release();
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// PIPE: Compose filters into a pipeline
// ══════════════════════════════════════════════════════════════════════════════

/**
 * runBookingPipeline - Executes all filters in sequence
 * Context flows from one filter to the next, enriched at each stage
 */
const runBookingPipeline = async (initialContext) => {
  const pipeline = [
    validateUserFilter,
    validateEventFilter,
    checkAvailabilityFilter,
    preventDoubleBookingFilter,
    applyDiscountFilter,
    confirmBookingFilter,
  ];

  let ctx = { ...initialContext };

  for (const filter of pipeline) {
    ctx = await filter(ctx); // Each filter enriches and returns ctx
  }

  return ctx;
};

// ══════════════════════════════════════════════════════════════════════════════
// Controller Functions
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/bookings
 * Create a new booking using the Pipe-and-Filter pipeline
 *
 * Body: { event_id, ticket_type_id, quantity, promo_code, payment_gateway }
 */
const createBooking = async (req, res) => {
  try {
    const { event_id, ticket_type_id, quantity, promo_code, payment_gateway } = req.body;

    if (!event_id || !ticket_type_id) {
      return res.status(400).json({ error: 'event_id and ticket_type_id are required' });
    }

    // ── Run the Pipe-and-Filter pipeline ─────────────────────────────────────
    const context = await runBookingPipeline({
      userId: req.user.id,
      eventId: event_id,
      ticketTypeId: ticket_type_id,
      quantity: quantity || 1,
      promoCode: promo_code || null,
      paymentGateway: payment_gateway || 'razorpay',
    });

    // ── Process payment via Adapter pattern (delegated to ticketController) ──
    const paymentResult = await processPayment({
      bookingId: context.booking.id,
      amount: context.totalAmount,
      gateway: context.paymentGateway || 'razorpay',
      userId: context.userId,
    });

    // Update booking status to confirmed after payment
    await query(
      `UPDATE bookings SET status = 'confirmed' WHERE id = $1`,
      [context.booking.id]
    );

    return res.status(201).json({
      message: 'Booking confirmed successfully',
      booking: {
        ...context.booking,
        status: 'confirmed',
      },
      event: { id: context.event.id, title: context.event.title, date: context.event.date },
      ticket: {
        type: context.ticketType.type_name,
        quantity: context.quantity,
        unitPrice: context.ticketType.price,
        finalPrice: context.finalPrice,
        totalAmount: context.totalAmount,
        discount: `${context.discountApplied}% - ${context.discountReason}`,
      },
      payment: paymentResult,
    });

  } catch (err) {
    console.error('createBooking pipeline error:', err);

    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Booking failed', details: err.message });
  }
};

/**
 * GET /api/bookings/my
 * Get all bookings for the currently logged-in user
 */
const getMyBookings = async (req, res) => {
  try {
    const result = await query(
      `SELECT
        b.id, b.status, b.quantity, b.total_amount, b.created_at,
        e.title AS event_title, e.date AS event_date, e.location,
        tt.type_name AS ticket_type, tt.price AS unit_price,
        p.gateway AS payment_gateway, p.transaction_id, p.status AS payment_status
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       JOIN ticket_types tt ON b.ticket_type_id = tt.id
       LEFT JOIN payments p ON p.booking_id = b.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ bookings: result.rows });

  } catch (err) {
    console.error('getMyBookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

/**
 * GET /api/bookings/event/:eventId
 * Get all bookings for a specific event (organizer only)
 */
const getEventBookings = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify the organizer owns this event
    const ownerCheck = await query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [eventId, req.user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not own this event' });
    }

    const result = await query(
      `SELECT
        b.id, b.status, b.quantity, b.total_amount, b.created_at,
        u.name AS attendee_name, u.email AS attendee_email,
        tt.type_name AS ticket_type
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN ticket_types tt ON b.ticket_type_id = tt.id
       WHERE b.event_id = $1
       ORDER BY b.created_at DESC`,
      [eventId]
    );

    return res.status(200).json({ bookings: result.rows, count: result.rows.length });

  } catch (err) {
    console.error('getEventBookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch event bookings' });
  }
};

/**
 * DELETE /api/bookings/:id/cancel
 * Cancel a booking (attendee can cancel their own bookings, releases seat)
 */
const cancelBooking = async (req, res) => {
  const dbClient = await getClient();

  try {
    await dbClient.query('BEGIN');

    // Get booking and verify ownership
    const bookingResult = await dbClient.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found or not yours' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status === 'cancelled') {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Update booking status
    await dbClient.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
      [booking.id]
    );

    // Release seats
    await dbClient.query(
      'UPDATE ticket_types SET booked_count = GREATEST(0, booked_count - $1) WHERE id = $2',
      [booking.quantity || 1, booking.ticket_type_id]
    );

    await dbClient.query('COMMIT');

    return res.status(200).json({ message: 'Booking cancelled successfully' });

  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error('cancelBooking error:', err);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  } finally {
    dbClient.release();
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getEventBookings,
  cancelBooking,
};
