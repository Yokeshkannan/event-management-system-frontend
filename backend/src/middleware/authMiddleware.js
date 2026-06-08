/**
 * src/middleware/authMiddleware.js
 * JWT Authentication Middleware
 *
 * Design Pattern: PROXY PATTERN
 * This middleware acts as a "protection proxy" — it intercepts every
 * protected route request and validates the JWT token before forwarding
 * the request to the actual controller (the real subject).
 *
 * Flow: Client → [AuthProxy Middleware] → Controller
 *       Client → [AuthProxy rejects] → 401 Unauthorized
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * authenticate - Verifies Bearer JWT token from Authorization header
 * Attaches decoded user payload to req.user for downstream handlers
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
        hint: 'Include Authorization: Bearer <token> header',
      });
    }

    const token = authHeader.split(' ')[1];

    // Proxy verifies the token — blocks if invalid/expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request (available in all downstream controllers)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next(); // Forward to real handler

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    return res.status(500).json({ error: 'Authentication error.' });
  }
};

/**
 * authorizeRole - Role-based access control guard
 * Usage: authorizeRole('organizer') or authorizeRole('attendee', 'organizer')
 *
 * Extends the Proxy pattern with role-level authorization
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden. Required role: ${roles.join(' or ')}`,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = { authenticate, authorizeRole };
