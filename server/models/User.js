/**
 * User Model
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  stats: {
    totalGames: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    avgAccuracy: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
  },
  quizHistory: [{
    roomId: String,
    topic: String,
    score: Number,
    totalQuestions: Number,
    accuracy: Number,
    rank: Number,
    playedAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

// Virtual: win rate
userSchema.virtual('winRate').get(function () {
  if (this.stats.totalGames === 0) return 0;
  return Math.round((this.stats.totalWins / this.stats.totalGames) * 100);
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
