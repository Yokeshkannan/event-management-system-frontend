/**
 * src/routes/tickets.js
 * Ticket Type & Payment Routes
 */

const express = require('express');
const router = express.Router();
const {
  createTicketType,
  getTicketTypesByEvent,
  updateTicketType,
  chargePayment,
} = require('../controllers/ticketController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

// GET /api/tickets/event/:eventId — Get ticket types for an event (public)
router.get('/event/:eventId', getTicketTypesByEvent);

// POST /api/tickets/types — Add ticket type to event (organizer only)
router.post('/types', authenticate, authorizeRole('organizer'), createTicketType);

// PUT /api/tickets/types/:id — Update ticket type (organizer only)
router.put('/types/:id', authenticate, authorizeRole('organizer'), updateTicketType);

// POST /api/tickets/charge — Process a payment directly (demo, requires auth)
router.post('/charge', authenticate, chargePayment);

module.exports = router;
