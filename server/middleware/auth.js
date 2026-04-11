/**
 * Authentication Middleware
 */
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Check session-based auth (Passport/Google OAuth)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      return next();
    }

    // Check Authorization header (simple base64 userId token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
          return next();
        }
      } catch {
        // invalid token
      }
    }

    return res.status(401).json({ error: 'Authentication required' });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      return next();
    }
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        const user = await User.findById(decoded.userId);
        if (user) req.user = user;
      } catch {
        // ok to proceed without user
      }
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, optionalAuth };
