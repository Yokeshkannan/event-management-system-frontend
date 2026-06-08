/**
 * src/routes/auth.js
 * Authentication Routes
 *
 * Pattern: MVC - Router maps HTTP methods to Controller functions
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updatePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// POST /api/auth/register — Create new user account
router.post('/register', register);

// POST /api/auth/login — Login and receive JWT token
router.post('/login', login);

// GET /api/auth/me — Get current user profile (protected)
router.get('/me', authenticate, getMe);

// PUT /api/auth/profile — Update current user profile
router.put('/profile', authenticate, updateProfile);

// PUT /api/auth/password — Update current user password
router.put('/password', authenticate, updatePassword);

module.exports = router;
