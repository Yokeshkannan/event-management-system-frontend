/**
 * src/controllers/eventController.js
 * Event CRUD Controller
 *
 * Pattern: MVC - Controller layer
 * Organizers can create/update/delete events
 * Anyone can read/list events
 */

const { query } = require('../config/supabase');

/**
 * GET /api/events
 * List all events (with optional filters: category, date, search)
 * Public route
 */
const getAllEvents = async (req, res) => {
  try {
    const { category, search, upcoming } = req.query;

    let sql = `
      SELECT
        e.id, e.title, e.description, e.date, e.location, e.category, e.image_url,
        e.organizer_id, e.created_at,
        u.name AS organizer_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', tt.id,
              'type_name', tt.type_name,
              'price', tt.price,
              'capacity', tt.capacity,
              'booked_count', tt.booked_count,
              'available', tt.capacity - tt.booked_count
            )
          ) FILTER (WHERE tt.id IS NOT NULL),
          '[]'
        ) AS ticket_types
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN ticket_types tt ON tt.event_id = e.id
    `;

    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`e.category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(e.title ILIKE $${params.length} OR e.description ILIKE $${params.length})`);
    }

    if (upcoming === 'true') {
      conditions.push(`e.date >= NOW()`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY e.id, u.name ORDER BY e.date ASC';

    const result = await query(sql, params);
    return res.status(200).json({ events: result.rows, count: result.rows.length });

  } catch (err) {
    console.error('getAllEvents error:', err);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/**
 * GET /api/events/:id
 * Get single event by ID with full ticket type details
 * Public route
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        e.id, e.title, e.description, e.date, e.location, e.category, e.image_url,
        e.organizer_id, e.created_at,
        u.name AS organizer_name, u.email AS organizer_email,
        COALESCE(
          json_agg(
            json_build_object(
              'id', tt.id,
              'type_name', tt.type_name,
              'price', tt.price,
              'capacity', tt.capacity,
              'booked_count', tt.booked_count,
              'available', tt.capacity - tt.booked_count
            )
          ) FILTER (WHERE tt.id IS NOT NULL),
          '[]'
        ) AS ticket_types
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN ticket_types tt ON tt.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, u.name, u.email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ event: result.rows[0] });

  } catch (err) {
    console.error('getEventById error:', err);
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
};

/**
 * POST /api/events
 * Create a new event (organizer only)
 *
 * Body: { title, description, date, location, category, ticket_types[] }
 * ticket_types: [{ type_name, price, capacity }]
 */
const createEvent = async (req, res) => {
  const client = require('../config/supabase').getClient
    ? null
    : null;

  try {
    const { title, description, date, location, category, image_url, ticket_types } = req.body;
    const organizer_id = req.user.id;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!title || !date || !location || !category) {
      return res.status(400).json({ error: 'title, date, location, and category are required' });
    }

    // ── Insert event ─────────────────────────────────────────────────────────
    const eventResult = await query(
      `INSERT INTO events (title, description, date, location, category, image_url, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description || '', date, location, category, image_url || null, organizer_id]
    );

    const newEvent = eventResult.rows[0];

    // ── Insert ticket types if provided ──────────────────────────────────────
    if (ticket_types && Array.isArray(ticket_types) && ticket_types.length > 0) {
      for (const tt of ticket_types) {
        if (!tt.type_name || tt.price === undefined || !tt.capacity) {
          continue; // Skip invalid ticket types
        }
        await query(
          `INSERT INTO ticket_types (event_id, type_name, price, capacity, booked_count)
           VALUES ($1, $2, $3, $4, 0)`,
          [newEvent.id, tt.type_name, tt.price, tt.capacity]
        );
      }
    }

    // ── Return event with ticket types ───────────────────────────────────────
    const fullEvent = await query(
      `SELECT e.*, u.name AS organizer_name,
        COALESCE(
          json_agg(
            json_build_object('id', tt.id, 'type_name', tt.type_name,
              'price', tt.price, 'capacity', tt.capacity, 'booked_count', tt.booked_count)
          ) FILTER (WHERE tt.id IS NOT NULL), '[]'
        ) AS ticket_types
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       LEFT JOIN ticket_types tt ON tt.event_id = e.id
       WHERE e.id = $1
       GROUP BY e.id, u.name`,
      [newEvent.id]
    );

    return res.status(201).json({
      message: 'Event created successfully',
      event: fullEvent.rows[0],
    });

  } catch (err) {
    console.error('createEvent error:', err);
    return res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
};

/**
 * PUT /api/events/:id
 * Update an event (organizer only — must own the event)
 *
 * Body: { title, description, date, location, category }
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, category, image_url } = req.body;
    const organizer_id = req.user.id;

    // ── Check ownership ──────────────────────────────────────────────────────
    const ownership = await query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [id, organizer_id]
    );

    if (ownership.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden. You can only update your own events.' });
    }

    // ── Update event ─────────────────────────────────────────────────────────
    const result = await query(
      `UPDATE events
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           date = COALESCE($3, date),
           location = COALESCE($4, location),
           category = COALESCE($5, category),
           image_url = COALESCE($6, image_url)
       WHERE id = $7
       RETURNING *`,
      [title, description, date, location, category, image_url, id]
    );

    return res.status(200).json({
      message: 'Event updated successfully',
      event: result.rows[0],
    });

  } catch (err) {
    console.error('updateEvent error:', err);
    return res.status(500).json({ error: 'Failed to update event' });
  }
};

/**
 * DELETE /api/events/:id
 * Delete an event (organizer only — must own the event)
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const organizer_id = req.user.id;

    // ── Check ownership ──────────────────────────────────────────────────────
    const ownership = await query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [id, organizer_id]
    );

    if (ownership.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden. You can only delete your own events.' });
    }

    // Delete cascades to ticket_types and bookings via FK constraints
    await query('DELETE FROM events WHERE id = $1', [id]);

    return res.status(200).json({ message: 'Event deleted successfully' });

  } catch (err) {
    console.error('deleteEvent error:', err);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
};

/**
 * GET /api/events/organizer/my-events
 * Get all events created by the logged-in organizer
 */
const getMyEvents = async (req, res) => {
  try {
    const organizer_id = req.user.id;

    const result = await query(
      `SELECT
        e.*, u.name AS organizer_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', tt.id, 'type_name', tt.type_name,
              'price', tt.price, 'capacity', tt.capacity,
              'booked_count', tt.booked_count
            )
          ) FILTER (WHERE tt.id IS NOT NULL), '[]'
        ) AS ticket_types,
        COUNT(DISTINCT b.id) AS total_bookings
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       LEFT JOIN ticket_types tt ON tt.event_id = e.id
       LEFT JOIN bookings b ON b.event_id = e.id AND b.status = 'confirmed'
       WHERE e.organizer_id = $1
       GROUP BY e.id, u.name
       ORDER BY e.created_at DESC`,
      [organizer_id]
    );

    return res.status(200).json({ events: result.rows });

  } catch (err) {
    console.error('getMyEvents error:', err);
    return res.status(500).json({ error: 'Failed to fetch your events' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
};
