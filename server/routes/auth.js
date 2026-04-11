/**
 * Auth Routes - Google OAuth 2.0 + Session Management
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

// ─── Google OAuth ────────────────────────────────────────────────────────────

// Initiate Google OAuth flow
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
}));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    // Generate a simple token for the client
    const token = Buffer.from(JSON.stringify({ userId: req.user._id })).toString('base64');
    const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientURL}/auth/callback?token=${token}&userId=${req.user._id}`);
  }
);

// ─── Session Management ───────────────────────────────────────────────────────

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Verify token (for client-side auth checks)
router.post('/verify', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ valid: false });

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const user = await User.findById(decoded.userId).select('-__v');
    if (!user) return res.json({ valid: false });
    res.json({ valid: true, user });
  } catch {
    res.json({ valid: false });
  }
});

module.exports = router;
