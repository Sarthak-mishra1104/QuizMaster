/**
 * Global Leaderboard Entry
 */
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  avatar: String,
  totalScore: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  avgAccuracy: { type: Number, default: 0 },
  weeklyScore: { type: Number, default: 0 },
  weekStart: { type: Date, default: () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
  }},
}, { timestamps: true });

leaderboardSchema.index({ totalScore: -1 });
leaderboardSchema.index({ weeklyScore: -1, weekStart: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
