-- ──────────────────────────────────────────────────────────────────────────────
-- Event Management Platform — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ──────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Table 1: users ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('organizer', 'attendee')),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Table 2: events ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  date          TIMESTAMP WITH TIME ZONE NOT NULL,
  location      VARCHAR(255) NOT NULL,
  category      VARCHAR(100) NOT NULL,
  image_url     VARCHAR(1024),
  organizer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Table 3: ticket_types ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_types (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type_name     VARCHAR(100) NOT NULL,     -- e.g., 'VIP', 'General', 'Early Bird'
  price         NUMERIC(10, 2) NOT NULL,
  capacity      INTEGER NOT NULL,
  booked_count  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT booked_not_exceed_capacity CHECK (booked_count <= capacity)
);

-- ─── Table 4: bookings ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id  UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  quantity        INTEGER NOT NULL DEFAULT 1,
  total_amount    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Table 5: payments ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL,
  gateway         VARCHAR(50) NOT NULL CHECK (gateway IN ('razorpay', 'stripe')),
  status          VARCHAR(50) NOT NULL,     -- 'captured', 'succeeded', 'failed'
  transaction_id  VARCHAR(255) UNIQUE NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

-- ─── Sample Data (optional, for testing) ─────────────────────────────────────
-- Run separately after setup if you want demo data

/*
-- Sample organizer (password: "password123", hashed below is a bcrypt hash)
INSERT INTO users (name, email, password, role) VALUES
  ('Alice Organizer', 'alice@example.com', '$2a$12$examplehashedpasswordx', 'organizer'),
  ('Bob Attendee', 'bob@example.com', '$2a$12$examplehashedpasswordy', 'attendee');

-- Sample event
INSERT INTO events (title, description, date, location, category, organizer_id)
VALUES (
  'Tech Summit 2025',
  'Annual technology conference with industry leaders',
  '2025-12-15 09:00:00+05:30',
  'Bangalore International Convention Centre',
  'Technology',
  (SELECT id FROM users WHERE email = 'alice@example.com')
);

-- Sample ticket types
INSERT INTO ticket_types (event_id, type_name, price, capacity) VALUES
  ((SELECT id FROM events WHERE title = 'Tech Summit 2025'), 'General', 999.00, 500),
  ((SELECT id FROM events WHERE title = 'Tech Summit 2025'), 'VIP', 2999.00, 50);
*/
