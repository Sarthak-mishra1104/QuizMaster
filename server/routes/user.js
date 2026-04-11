/**
 * User Routes
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v -googleId');
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  const { name, bio, socialLinks } = req.body;
  try {
    const update = {};
    if (name) update.name = name.trim().substring(0, 50);
    if (bio !== undefined) update.bio = bio.substring(0, 300);
    if (socialLinks) update.socialLinks = socialLinks;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-__v -googleId');
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user history
router.get('/history', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('quizHistory stats');
    res.json({
      history: user.quizHistory.reverse().slice(0, 20),
      stats: user.stats,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
