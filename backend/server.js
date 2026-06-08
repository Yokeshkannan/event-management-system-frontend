/**
 * server.js - Main Express Application Entry Point
 * Architecture Pattern: Layered Architecture (Presentation → Business Logic → Data)
 * Pattern: MVC - routes wire HTTP verbs to controllers
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (simple)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Route Imports ───────────────────────────────────────────────────────────
const authRoutes     = require('./src/routes/auth');
const eventRoutes    = require('./src/routes/events');
const bookingRoutes  = require('./src/routes/bookings');
const ticketRoutes   = require('./src/routes/tickets');
const uploadRoutes   = require('./src/routes/upload');

// ─── Route Registration ──────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets',  ticketRoutes);
app.use('/api/upload',   uploadRoutes);

// ─── Serve uploaded images statically ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Event Management API',
    version: '1.0.0',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Event Management API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
