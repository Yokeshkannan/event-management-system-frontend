/**
 * src/config/supabase.js
 * Database Connection Configuration using node-postgres (pg)
 * Connects to Supabase PostgreSQL via connection string (DATABASE_URL)
 *
 * Pattern: Singleton - single Pool instance reused across the app
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool (Supabase works with standard pg connections)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase cloud connections
  },
  max: 10,              // Maximum pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to Supabase PostgreSQL database');
    release();
  }
});

// Helper: run a query with parameters
const query = (text, params) => pool.query(text, params);

// Helper: get a client for transactions
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
