/**
 * src/routes/events.js
 * Event Routes
 *
 * Public: GET /api/events, GET /api/events/:id
 * Protected (organizer): POST, PUT, DELETE
 */

const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} = require('../controllers/eventController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllEvents);
router.get('/organizer/my-events', authenticate, authorizeRole('organizer'), getMyEvents);
router.get('/:id', getEventById);

// Protected routes — organizer only
router.post('/', authenticate, authorizeRole('organizer'), createEvent);
router.put('/:id', authenticate, authorizeRole('organizer'), updateEvent);
router.delete('/:id', authenticate, authorizeRole('organizer'), deleteEvent);

module.exports = router;
