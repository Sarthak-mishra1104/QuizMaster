# 🧠 QuizMaster AI — Real-Time Multiplayer MCQ Platform

> AI-powered quiz platform with real-time multiplayer, Google OAuth, PDF upload, and live scoreboards — built on the MERN stack.

![Stack](https://img.shields.io/badge/Stack-MERN-blue) ![AI](https://img.shields.io/badge/AI-OpenAI-green) ![Realtime](https://img.shields.io/badge/Realtime-Socket.io-orange)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 AI Question Generation | OpenAI generates MCQs on any topic |
| 📄 PDF Upload | Extract and quiz from uploaded PDFs |
| 🎮 Multiplayer Rooms | 2–4 players, real-time via Socket.io |
| 👑 Host Controls | Set questions, time, difficulty, game mode |
| ⚡ Speed Bonus Scoring | Faster answers = more points |
| 📊 Live Leaderboard | Scores update in real-time during game |
| 🏆 Global Rankings | All-time and weekly leaderboard |
| 📈 Player History | Track accuracy, wins, and scores |
| 🔐 Google OAuth | Secure sign-in, no passwords needed |
| 🎉 Win Effects | Confetti + sound effects |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Google OAuth credentials

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/quizmaster-ai.git
cd quizmaster-ai
npm run install-all
```

### 2. Configure Backend

```bash
cd server
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://...          # MongoDB Atlas connection string
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your-random-secret

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

### 3. Configure Frontend

```bash
cd client
cp .env.example .env
```

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Run Locally

```bash
# From root (runs both server + client)
npm run dev

# Or separately:
npm run dev:server   # Backend on :5000
npm run dev:client   # Frontend on :3000
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Getting API Keys

### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → Enable "Google+ API"
3. Go to **Credentials** → **Create OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
6. Copy **Client ID** and **Client Secret** to `.env`

### OpenAI API
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Set `OPENAI_API_KEY` in `.env`
4. Recommended model: `gpt-4o-mini` (cheap + fast)

### MongoDB Atlas
1. Create free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Get connection string → Set as `MONGO_URI`

---

## 🗂️ Project Structure

```
quizmaster-ai/
├── server/                    # Backend
│   ├── index.js               # Express + Socket.io entry
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Room.js            # Game room schema
│   │   └── Leaderboard.js     # Rankings
│   ├── routes/
│   │   ├── auth.js            # Google OAuth
│   │   ├── quiz.js            # AI generation + PDF
│   │   ├── room.js            # Room CRUD
│   │   ├── user.js            # Profile
│   │   └── leaderboard.js     # Rankings API
│   ├── services/
│   │   ├── aiService.js       # OpenAI integration
│   │   └── pdfService.js      # PDF text extraction
│   ├── socket/
│   │   └── socketHandler.js   # Real-time game engine
│   ├── middleware/
│   │   ├── auth.js            # JWT/session auth
│   │   └── passport.js        # Google OAuth strategy
│   └── utils/
│       └── roomUtils.js       # Room code, scoring
│
└── client/                    # Frontend
    └── src/
        ├── App.jsx            # Router
        ├── index.css          # Global design system
        ├── context/
        │   ├── AuthContext.jsx    # Auth state
        │   └── SocketContext.jsx  # Socket connection
        ├── services/
        │   └── api.js         # Axios instance
        ├── pages/
        │   ├── Login.jsx      # Google sign-in
        │   ├── Dashboard.jsx  # Home hub
        │   ├── Lobby.jsx      # Pre-game room
        │   ├── Game.jsx       # Live gameplay
        │   ├── Results.jsx    # Scoreboard
        │   ├── Leaderboard.jsx
        │   ├── Profile.jsx
        │   └── About.jsx
        └── components/
            ├── ui/Navbar.jsx
            └── game/
                ├── CreateRoomModal.jsx
                └── JoinRoomModal.jsx
```

---

## 🎮 How to Play

### As Host
1. Sign in with Google
2. Click **Create Room** → configure settings
3. Share the 6-character room code with friends
4. On the Lobby page: choose topic or upload PDF
5. Click **Generate Questions** (AI generates MCQs)
6. Click **Start Game** when ready

### As Player
1. Sign in with Google
2. Click **Join Room** → enter the 6-character code
3. Wait in the lobby for the host to start
4. Answer questions before the timer runs out
5. Faster correct answers = more points!

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd client && npm run build
# Push to GitHub → Connect repo to Vercel
# Set env: REACT_APP_API_URL=https://your-backend.render.com
```

### Backend → Render
1. Connect your GitHub repo
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add all environment variables from `.env`

### Database → MongoDB Atlas
- Already cloud-hosted, just use your Atlas connection string

### Update CORS after deployment
In `server/.env` (production):
```env
CLIENT_URL=https://your-app.vercel.app
GOOGLE_CALLBACK_URL=https://your-backend.render.com/api/auth/google/callback
NODE_ENV=production
```

---

## ⚙️ Scoring System

| Action | Points |
|---|---|
| Correct answer (Easy) | 100 pts |
| Correct answer (Medium) | 150 pts |
| Correct answer (Hard) | 200 pts |
| Speed bonus (max) | +50 pts |
| Wrong answer | 0 pts |

Speed bonus = `(timeRemaining / timeLimit) × 50`

---

## 🧪 Edge Cases Handled

- Player disconnects mid-game → marked offline, game continues
- All players disconnect → game auto-ends
- Host leaves → other players notified
- Timer runs out → answer revealed automatically
- Duplicate questions → AI prompt enforces uniqueness
- PDF too large → truncated to 8000 chars for AI processing
- Room expired → TTL index auto-deletes after 2 hours

---

## 👨‍💻 Developer

Built by **[Your Name]** — see the [About page](/about) in the app.

---

## 📄 License

MIT — free to use and modify.
