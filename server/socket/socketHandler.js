const Room = require('../models/Room');
const User = require('../models/User');
const { calculatePoints, calculateFinalRankings } = require('../utils/roomUtils');

const roomTimers = new Map();

const initializeSocket = (io) => {

  io.use(async (socket, next) => {
    try {
      const { token, userId } = socket.handshake.auth;
      if (token && userId) {
        const user = await User.findById(userId);
        if (user) {
          socket.user = user;
          return next();
        }
      }
      socket.user = null;
      next();
    } catch (err) {
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} | User: ${socket.user?.name || 'anonymous'}`);

    socket.on('join-room', async ({ roomCode }, callback) => {
      try {
        if (!socket.user) return callback?.({ error: 'Authentication required' });

        const room = await Room.findOne({ code: roomCode.toUpperCase() });
        if (!room) return callback?.({ error: 'Room not found. Check the code.' });
        if (room.status === 'finished') return callback?.({ error: 'This game has already ended.' });

        const isExistingPlayer = room.players.some(p => p.userId?.toString() === socket.user._id.toString());
        if (room.status === 'playing' && !isExistingPlayer) return callback?.({ error: 'Game already in progress. Wait for next round.' });

        const existingIndex = room.players.findIndex(
          p => p.userId?.toString() === socket.user._id.toString()
        );

        if (existingIndex >= 0) {
          room.players[existingIndex].socketId = socket.id;
          room.players[existingIndex].isConnected = true;
        } else {
          if (room.players.length >= room.settings.maxPlayers) {
            return callback?.({ error: `Room is full (max ${room.settings.maxPlayers} players)` });
          }

          const isHost = room.hostId.toString() === socket.user._id.toString();
          room.players.push({
            userId: socket.user._id,
            socketId: socket.id,
            name: socket.user.name,
            avatar: socket.user.avatar,
            score: 0,
            answers: [],
            isHost,
            isConnected: true,
          });
        }

        await room.save();

        socket.join(roomCode.toUpperCase());
        socket.roomCode = roomCode.toUpperCase();

        const roomData = sanitizeRoom(room, socket.user._id);
        callback?.({ success: true, room: roomData });

        socket.to(roomCode.toUpperCase()).emit('player-joined', {
          player: {
            name: socket.user.name,
            avatar: socket.user.avatar,
            userId: socket.user._id,
          },
          room: roomData,
        });

      } catch (err) {
        console.error('join-room error:', err);
        callback?.({ error: 'Failed to join room' });
      }
    });

    socket.on('start-game', async ({ roomCode }, callback) => {
      try {
        const room = await Room.findOne({ code: roomCode.toUpperCase() });
        if (!room) return callback?.({ error: 'Room not found' });

        if (room.hostId.toString() !== socket.user?._id.toString()) {
          return callback?.({ error: 'Only the host can start the game' });
        }
        if (room.questions.length === 0) {
          return callback?.({ error: 'No questions generated yet. Generate questions first.' });
        }
        if (room.players.filter(p => p.isConnected).length < 1) {
          return callback?.({ error: 'Need at least 1 player to start' });
        }

        room.status = 'playing';
        room.currentQuestion = 0;
        room.startedAt = new Date();

        room.players.forEach(p => {
          p.score = 0;
          p.answers = [];
        });

        await room.save();

        callback?.({ success: true });

        io.to(roomCode.toUpperCase()).emit('game-started', {
          totalQuestions: room.questions.length,
          settings: room.settings,
        });

        setTimeout(() => sendQuestion(io, room, roomCode.toUpperCase()), 3000);

      } catch (err) {
        console.error('start-game error:', err);
        callback?.({ error: 'Failed to start game' });
      }
    });

    socket.on('submit-answer', async ({ roomCode, questionIndex, selectedOption, timeTaken }, callback) => {
      try {
        const room = await Room.findOne({ code: roomCode.toUpperCase() });
        if (!room || room.status !== 'playing') return;

        const playerIndex = room.players.findIndex(
          p => p.socketId === socket.id
        );
        if (playerIndex === -1) return;

        const player = room.players[playerIndex];

        const alreadyAnswered = player.answers.some(a => a.questionIndex === questionIndex);
        if (alreadyAnswered) return callback?.({ error: 'Already answered' });

        const question = room.questions[questionIndex];
        if (!question) return callback?.({ error: 'Invalid question' });

        const isCorrect = selectedOption === question.correctAnswer;
        const pointsEarned = calculatePoints({
          isCorrect,
          timeTaken: timeTaken || room.settings.timePerQuestion,
          timeLimit: room.settings.timePerQuestion,
          difficulty: question.difficulty,
        });

        room.players[playerIndex].answers.push({
          questionIndex,
          selectedOption,
          isCorrect,
          timeTaken,
          pointsEarned,
        });
        room.players[playerIndex].score += pointsEarned;

        await room.save();

        callback?.({
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          pointsEarned,
          totalScore: room.players[playerIndex].score,
        });

        const scores = room.players.map(p => ({
          name: p.name,
          avatar: p.avatar,
          score: p.score,
          userId: p.userId,
        }));
        io.to(roomCode.toUpperCase()).emit('score-update', { scores });

        const connectedPlayers = room.players.filter(p => p.isConnected);
        const answeredCount = room.players.filter(
          p => p.answers.some(a => a.questionIndex === questionIndex)
        ).length;

        if (answeredCount >= connectedPlayers.length) {
          const timer = roomTimers.get(roomCode.toUpperCase());
          if (timer) {
            clearTimeout(timer);
            roomTimers.delete(roomCode.toUpperCase());
          }
          moveToNextQuestion(io, room, roomCode.toUpperCase());
        }

      } catch (err) {
        console.error('submit-answer error:', err);
        callback?.({ error: 'Failed to submit answer' });
      }
    });

    socket.on('skip-question', async ({ roomCode }) => {
      try {
        const room = await Room.findOne({ code: roomCode.toUpperCase() });
        if (!room || room.hostId.toString() !== socket.user?._id.toString()) return;

        const timer = roomTimers.get(roomCode.toUpperCase());
        if (timer) {
          clearTimeout(timer);
          roomTimers.delete(roomCode.toUpperCase());
        }
        moveToNextQuestion(io, room, roomCode.toUpperCase());
      } catch (err) {
        console.error('skip-question error:', err);
      }
    });

    socket.on('end-game', async ({ roomCode }) => {
      try {
        const room = await Room.findOne({ code: roomCode.toUpperCase() });
        if (!room || room.hostId.toString() !== socket.user?._id.toString()) return;

        const timer = roomTimers.get(roomCode.toUpperCase());
        if (timer) {
          clearTimeout(timer);
          roomTimers.delete(roomCode.toUpperCase());
        }

        await finishGame(io, room, roomCode.toUpperCase());
      } catch (err) {
        console.error('end-game error:', err);
      }
    });

    socket.on('chat-message', ({ roomCode, message }) => {
      if (!socket.user || !message || message.trim().length === 0) return;
      const clean = message.trim().substring(0, 200);

      io.to(roomCode.toUpperCase()).emit('chat-message', {
        name: socket.user.name,
        avatar: socket.user.avatar,
        message: clean,
        timestamp: Date.now(),
      });
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      try {
        if (!socket.roomCode) return;

        const room = await Room.findOne({ code: socket.roomCode });
        if (!room) return;

        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex === -1) return;

        room.players[playerIndex].isConnected = false;

        const isHost = room.players[playerIndex].isHost;

        await room.save();

        io.to(socket.roomCode).emit('player-left', {
          name: room.players[playerIndex].name,
          userId: room.players[playerIndex].userId,
          isHost,
          room: sanitizeRoom(room),
        });

        if (room.status === 'playing') {
          const connectedPlayers = room.players.filter(p => p.isConnected);
          if (connectedPlayers.length === 0) {
            const timer = roomTimers.get(socket.roomCode);
            if (timer) {
              clearTimeout(timer);
              roomTimers.delete(socket.roomCode);
            }
            room.status = 'finished';
            room.finishedAt = new Date();
            await room.save();
          }
        }
      } catch (err) {
        console.error('disconnect error:', err);
      }
    });
  });
};

const sendQuestion = (io, room, roomCode) => {
  const qIndex = room.currentQuestion;
  const question = room.questions[qIndex];
  if (!question) return;

  io.to(roomCode).emit('question-start', {
    index: qIndex,
    total: room.questions.length,
    question: question.question,
    options: question.options,
    difficulty: question.difficulty,
    timeLimit: room.settings.timePerQuestion,
    currentTurnPlayer: room.settings.gameMode === 'turn-based'
      ? room.players[room.currentTurnPlayer % room.players.length]?.name
      : null,
  });

  const timer = setTimeout(async () => {
    try {
      const freshRoom = await Room.findOne({ code: roomCode });
      if (freshRoom && freshRoom.status === 'playing') {
        io.to(roomCode).emit('question-timeout', {
          index: qIndex,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        });

        setTimeout(() => moveToNextQuestion(io, freshRoom, roomCode), 2000);
      }
    } catch (err) {
      console.error('Timer error:', err);
    }
  }, (room.settings.timePerQuestion + 1) * 1000);

  roomTimers.set(roomCode, timer);
};

const moveToNextQuestion = async (io, room, roomCode) => {
  try {
    const freshRoom = await Room.findOne({ code: roomCode });
    if (!freshRoom || freshRoom.status !== 'playing') return;

    const nextIndex = freshRoom.currentQuestion + 1;

    if (nextIndex >= freshRoom.questions.length) {
      await finishGame(io, freshRoom, roomCode);
    } else {
      freshRoom.currentQuestion = nextIndex;
      freshRoom.currentTurnPlayer = (freshRoom.currentTurnPlayer + 1) % freshRoom.players.length;
      await freshRoom.save();

      setTimeout(() => sendQuestion(io, freshRoom, roomCode), 2000);
    }
  } catch (err) {
    console.error('moveToNextQuestion error:', err);
  }
};

const finishGame = async (io, room, roomCode) => {
  try {
    const rankings = calculateFinalRankings(room.players);

    room.status = 'finished';
    room.finishedAt = new Date();

    rankings.forEach((r) => {
      const playerIndex = room.players.findIndex(
        p => p.userId?.toString() === r.userId?.toString()
      );
      if (playerIndex >= 0) {
        room.players[playerIndex].rank = r.rank;
        room.players[playerIndex].accuracy = r.accuracy;
      }
    });

    await room.save();

    for (const player of rankings) {
      if (!player.userId) continue;
      try {
        const user = await User.findById(player.userId);
        if (!user) continue;

        user.stats.totalGames += 1;
        if (player.rank === 1) user.stats.totalWins += 1;
        user.stats.totalScore += player.score;

        const prev = user.stats.avgAccuracy * (user.stats.totalGames - 1);
        user.stats.avgAccuracy = Math.round((prev + player.accuracy) / user.stats.totalGames);

        user.quizHistory.push({
          roomId: room.code,
          topic: room.settings.topic || 'PDF Quiz',
          score: player.score,
          totalQuestions: room.questions.length,
          accuracy: player.accuracy,
          rank: player.rank,
        });

        if (user.quizHistory.length > 50) {
          user.quizHistory = user.quizHistory.slice(-50);
        }

        await user.save();
      } catch (e) {
        console.error('Stats update error:', e);
      }
    }

    io.to(roomCode).emit('game-finished', {
      rankings: rankings.map(r => ({
        name: r.name,
        avatar: r.avatar,
        score: r.score,
        rank: r.rank,
        accuracy: r.accuracy,
        correctAnswers: r.correctAnswers,
        totalQuestions: room.questions.length,
      })),
      questions: room.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
      topic: room.settings.topic,
    });
  } catch (err) {
    console.error('finishGame error:', err);
  }
};

const sanitizeRoom = (room, currentUserId) => ({
  id: room._id,
  code: room.code,
  status: room.status,
  settings: room.settings,
  currentQuestion: room.currentQuestion,
  players: room.players.map(p => ({
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    isHost: p.isHost,
    isConnected: p.isConnected,
    userId: p.userId,
    rank: p.rank,
    accuracy: p.accuracy,
  })),
  questionCount: room.questions.length,
  startedAt: room.startedAt,
});

module.exports = { initializeSocket };