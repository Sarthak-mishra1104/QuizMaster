/**
 * Room Routes - Create, Join, Manage game rooms
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Room = require('../models/Room');
const { generateRoomCode } = require('../utils/roomUtils');

/**
 * POST /api/rooms/create
 * Create a new game room
 */
router.post('/create', authenticate, async (req, res) => {
  const {
    numQuestions = 10,
    timePerQuestion = 30,
    difficulty = 'medium',
    gameMode = 'all-answer',
    maxPlayers = 4,
  } = req.body;

  try {
    const code = await generateRoomCode();

    const room = await Room.create({
      code,
      hostId: req.user._id,
      settings: {
        numQuestions: Math.min(Math.max(parseInt(numQuestions), 5), 30),
        timePerQuestion: Math.min(Math.max(parseInt(timePerQuestion), 10), 120),
        difficulty,
        gameMode,
        maxPlayers: Math.min(Math.max(parseInt(maxPlayers), 2), 4),
      },
      players: [{
        userId: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
        isHost: true,
        isConnected: false, // Will be set true when they connect via socket
      }],
    });

    res.status(201).json({
      success: true,
      room: {
        id: room._id,
        code: room.code,
        settings: room.settings,
        status: room.status,
      },
    });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

/**
 * GET /api/rooms/:code
 * Get room details
 */
router.get('/:code', authenticate, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() })
      .populate('hostId', 'name avatar');

    if (!room) return res.status(404).json({ error: 'Room not found' });

    res.json({ room });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

/**
 * GET /api/rooms/:code/results
 * Get final game results
 */
router.get('/:code/results', authenticate, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status !== 'finished') return res.status(400).json({ error: 'Game not finished yet' });

    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    const results = sortedPlayers.map((p, i) => ({
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      rank: i + 1,
      accuracy: p.accuracy || 0,
      correctAnswers: p.answers.filter(a => a.isCorrect).length,
      totalQuestions: room.questions.length,
    }));

    res.json({
      results,
      topic: room.settings.topic,
      totalQuestions: room.questions.length,
      questions: room.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

/**
 * DELETE /api/rooms/:code
 * Delete a room (host only)
 */
router.delete('/:code', authenticate, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the host can delete this room' });
    }

    await room.deleteOne();
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

module.exports = router;
