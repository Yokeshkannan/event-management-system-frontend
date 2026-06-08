/**
 * src/controllers/authController.js
 * Authentication Controller - Register & Login
 *
 * Pattern: MVC - Controller layer handles HTTP request/response
 * Uses bcryptjs for password hashing, JWT for session tokens
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/supabase');
require('dotenv').config();

/**
 * Helper: Generate JWT token for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * POST /api/auth/register
 * Register a new user (organizer or attendee)
 *
 * Body: { name, email, password, role }
 * role: 'organizer' | 'attendee'
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required: name, email, password, role' });
    }

    if (!['organizer', 'attendee'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either organizer or attendee' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // ── Check duplicate email ────────────────────────────────────────────────
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // ── Hash password ────────────────────────────────────────────────────────
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ── Insert user ──────────────────────────────────────────────────────────
    const result = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at,
      },
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 *
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ── Find user ────────────────────────────────────────────────────────────
    const result = await query(
      'SELECT id, name, email, password, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // ── Verify password ──────────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 * Protected route — requires Bearer token
 */
const getMe = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user: result.rows[0] });

  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const result = await query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role, created_at',
      [name, req.user.id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    return res.status(200).json({ message: 'Profile updated', user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const result = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect current password' });

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    return res.status(500).json({ error: 'Failed to update password' });
  }
};

module.exports = { register, login, getMe, updateProfile, updatePassword };
