/**
 * Leaderboard Routes
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Global leaderboard - top players by total score
router.get('/global', async (req, res) => {
  try {
    const users = await User.find({ 'stats.totalGames': { $gt: 0 } })
      .sort({ 'stats.totalScore': -1 })
      .limit(50)
      .select('name avatar stats');

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      avatar: u.avatar,
      totalScore: u.stats.totalScore,
      gamesPlayed: u.stats.totalGames,
      wins: u.stats.totalWins,
      avgAccuracy: u.stats.avgAccuracy,
    }));

    res.json({ leaderboard });
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Weekly leaderboard
router.get('/weekly', async (req, res) => {
  try {
    // Get start of current week
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    // For simplicity, we query recent quiz history and aggregate
    const users = await User.find({
      'quizHistory.playedAt': { $gte: weekStart },
    }).select('name avatar quizHistory stats');

    const weeklyData = users.map(u => {
      const weeklyEntries = u.quizHistory.filter(h => new Date(h.playedAt) >= weekStart);
      const weeklyScore = weeklyEntries.reduce((sum, h) => sum + h.score, 0);
      return { user: u, weeklyScore };
    }).filter(d => d.weeklyScore > 0)
      .sort((a, b) => b.weeklyScore - a.weeklyScore)
      .slice(0, 50);

    const leaderboard = weeklyData.map((d, i) => ({
      rank: i + 1,
      name: d.user.name,
      avatar: d.user.avatar,
      weeklyScore: d.weeklyScore,
      gamesPlayed: d.user.stats.totalGames,
    }));

    res.json({ leaderboard, weekStart });
  } catch {
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

module.exports = router;
