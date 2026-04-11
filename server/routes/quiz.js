/**
 * Quiz Routes - AI Question Generation + PDF Upload
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { generateFromTopic, generateFromPDF } = require('../services/aiService');
const { extractTextFromPDF } = require('../services/pdfService');
const Room = require('../models/Room');

// ─── Multer PDF Upload Config ────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `${unique}.pdf`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/quiz/generate/topic
 * Generate MCQs from a topic
 */
router.post('/generate/topic', authenticate, async (req, res) => {
  const { topic, numQuestions = 10, difficulty = 'medium', roomCode } = req.body;

  if (!topic || topic.trim().length < 2) {
    return res.status(400).json({ error: 'Topic is required (min 2 characters)' });
  }
  if (numQuestions < 5 || numQuestions > 30) {
    return res.status(400).json({ error: 'Number of questions must be 5-30' });
  }
  if (!['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty level' });
  }

  try {
    const questions = await generateFromTopic({
      topic: topic.trim(),
      numQuestions: parseInt(numQuestions),
      difficulty,
    });

    // Update room with questions if roomCode provided
    if (roomCode) {
      const room = await Room.findOne({ code: roomCode.toUpperCase() });
      if (room && room.hostId.toString() === req.user._id.toString()) {
        room.questions = questions;
        room.settings.topic = topic.trim();
        room.settings.difficulty = difficulty;
        room.status = 'waiting';
        await room.save();
      }
    }

    res.json({
      success: true,
      questions,
      count: questions.length,
      topic: topic.trim(),
    });
  } catch (err) {
    console.error('Topic generation error:', err);
    if (err.message.includes('API key')) {
      return res.status(503).json({ error: 'AI service not configured. Please set OPENAI_API_KEY.' });
    }
    res.status(500).json({ error: err.message || 'Failed to generate questions' });
  }
});

/**
 * POST /api/quiz/generate/pdf
 * Upload PDF and generate MCQs
 */
router.post('/generate/pdf', authenticate, upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'PDF file is required' });
  }

  const { numQuestions = 10, difficulty = 'medium', roomCode } = req.body;

  try {
    // Extract text from PDF
    const { text, pages, wordCount } = await extractTextFromPDF(req.file.path);

    // Generate questions
    const questions = await generateFromPDF({
      pdfText: text,
      numQuestions: parseInt(numQuestions),
      difficulty,
    });

    // Clean up uploaded file
    fs.unlink(req.file.path, () => {});

    // Update room if provided
    if (roomCode) {
      const room = await Room.findOne({ code: roomCode.toUpperCase() });
      if (room && room.hostId.toString() === req.user._id.toString()) {
        room.questions = questions;
        room.settings.mode = 'pdf';
        room.settings.topic = req.file.originalname.replace('.pdf', '');
        room.settings.difficulty = difficulty;
        room.pdfContent = text.substring(0, 2000); // Store snippet
        room.status = 'waiting';
        await room.save();
      }
    }

    res.json({
      success: true,
      questions,
      count: questions.length,
      pdfInfo: { pages, wordCount, filename: req.file.originalname },
    });
  } catch (err) {
    // Clean up on error
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to process PDF' });
  }
});

/**
 * GET /api/quiz/room/:code
 * Get questions for a room (sanitized - no correct answers for players)
 */
router.get('/room/:code', authenticate, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const isHost = room.hostId.toString() === req.user._id.toString();

    // Return questions without correct answers for non-hosts
    const questions = room.questions.map(q => ({
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      ...(isHost && { correctAnswer: q.correctAnswer, explanation: q.explanation }),
    }));

    res.json({ questions, total: questions.length, isHost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

module.exports = router;
