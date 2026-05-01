/**
 * Room Model - Represents a quiz game room
 */
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  socketId: String,
  name: String,
  avatar: String,
  score: { type: Number, default: 0 },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean,
    timeTaken: Number, // seconds
    pointsEarned: Number,
  }],
  isHost: { type: Boolean, default: false },
  isConnected: { type: Boolean, default: true },
  rank: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index 0-3
  explanation: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
}, { _id: false });

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6,
  },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostSocketId: String,
  settings: {
    topic: { type: String, default: '' },
    numQuestions: { type: Number, default: 10, min: 5, max: 30 },
    timePerQuestion: { type: Number, default: 30, min: 10, max: 120 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' },
    mode: { type: String, enum: ['topic', 'pdf'], default: 'topic' },
    gameMode: { type: String, enum: ['all-answer', 'turn-based'], default: 'all-answer' },
    maxPlayers: { type: Number, default: 4, min: 1, max: 50 },
   
  },
  status: {
    type: String,
    enum: ['waiting', 'generating', 'playing', 'finished'],
    default: 'waiting',
  },
  players: [playerSchema],
  questions: [questionSchema],
  currentQuestion: { type: Number, default: 0 },
  currentTurnPlayer: { type: Number, default: 0 }, // index in players array
  startedAt: Date,
  finishedAt: Date,
  pdfContent: { type: String, default: '' }, // extracted PDF text
}, { timestamps: true });

// Auto-expire rooms after 2 hours
roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

module.exports = mongoose.model('Room', roomSchema);
