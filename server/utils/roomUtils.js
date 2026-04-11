/**
 * Utility functions for room management
 */

const Room = require('../models/Room');

/**
 * Generate a unique 6-character alphanumeric room code
 */
const generateRoomCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars (0,O,I,1)
  let code;
  let attempts = 0;

  do {
    code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    attempts++;

    if (attempts > 100) {
      throw new Error('Failed to generate unique room code');
    }

    const existing = await Room.findOne({ code });
    if (!existing) break;
  } while (true);

  return code;
};

/**
 * Calculate scores and rankings for a finished game
 */
const calculateFinalRankings = (players) => {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return sorted.map((player, index) => {
    const totalAnswers = player.answers.length;
    const correctAnswers = player.answers.filter(a => a.isCorrect).length;
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    return {
      ...player,
      rank: index + 1,
      accuracy,
      correctAnswers,
      totalAnswers,
    };
  });
};

/**
 * Calculate points earned for a correct answer (speed bonus)
 */
const calculatePoints = ({ isCorrect, timeTaken, timeLimit, difficulty }) => {
  if (!isCorrect) return 0;

  const basePoints = { easy: 100, medium: 150, hard: 200 }[difficulty] || 150;
  const timeRatio = Math.max(0, (timeLimit - timeTaken) / timeLimit);
  const speedBonus = Math.round(timeRatio * 50);

  return basePoints + speedBonus;
};

module.exports = { generateRoomCode, calculateFinalRankings, calculatePoints };
