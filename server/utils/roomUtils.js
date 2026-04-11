const Room = require('../models/Room');

const generateRoomCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let attempts = 0;

  do {
    code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    attempts++;
    if (attempts > 100) throw new Error('Failed to generate unique room code');
    const existing = await Room.findOne({ code });
    if (!existing) break;
  } while (true);

  return code;
};

const calculateFinalRankings = (players) => {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aAcc = a.answers.length > 0
      ? a.answers.filter(x => x.isCorrect).length / a.answers.length
      : 0;
    const bAcc = b.answers.length > 0
      ? b.answers.filter(x => x.isCorrect).length / b.answers.length
      : 0;
    return bAcc - aAcc;
  });

  return sorted.map((player, index) => {
    const totalAnswers = player.answers.length;
    const correctAnswers = player.answers.filter(a => a.isCorrect).length;
    const accuracy = totalAnswers > 0
      ? Math.round((correctAnswers / totalAnswers) * 100)
      : 0;

    return {
      ...player,
      rank: index + 1,
      accuracy,
      correctAnswers,
      totalAnswers,
    };
  });
};

const calculatePoints = ({ isCorrect, timeTaken, timeLimit }) => {
  if (!isCorrect) return 0;
  const basePoints = 10;
  const safeTimeTaken = timeTaken || 0;
  const safeTimeLimit = timeLimit || 30;
  const timeRatio = Math.max(0, (safeTimeLimit - safeTimeTaken) / safeTimeLimit);
  const speedBonus = Math.round(timeRatio * 5);
  return basePoints + speedBonus;
};

module.exports = { generateRoomCode, calculateFinalRankings, calculatePoints };