/**
 * src/routes/bookings.js
 * Booking Routes (all protected — authentication required)
 */

const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getEventBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(authenticate);

// POST /api/bookings — Create a new booking (attendee)
router.post('/', createBooking);

// GET /api/bookings/my — Get logged-in user's bookings
router.get('/my', getMyBookings);

// GET /api/bookings/event/:eventId — Get all bookings for an event (organizer)
router.get('/event/:eventId', authorizeRole('organizer'), getEventBookings);

// PATCH /api/bookings/:id/cancel — Cancel a booking
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
