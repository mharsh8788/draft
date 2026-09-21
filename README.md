# ⚽ Bayern Draft

An interactive FC Bayern Munich football draft game where you build your ultimate 4-3-3 Bayern XI by choosing between a revealed Bayern legend and an enticing mystery player across 11 position-specific rounds.

---

## 🎮 Game Concept & Rules

1. **Format**: Standard 4-3-3 formation (GK, RB, CB, CB, LB, CM/CDM, CM/CDM, CAM/CM, RW, LW, ST).
2. **The Dilemma**: In each round, you are presented with:
   - **Player A (Revealed)**: Full identity, photo/flag, OVR rating, and career statistics.
   - **Player B (Mystery Player)**: Position, nationality, era, overall rating, goals, assists, appearances, trophies, and achievements are visible, but the name and photo are concealed.
3. **Draft Fate**:
   - The player you select joins **YOUR BAYERN XI**.
   - The player you decline joins the opponent's **MYSTERY XI**.
   - The mystery player's identity is revealed immediately after selection with a reveal animation.
4. **Duplicate Prevention**: No player can appear twice across either squad or in multiple rounds.
5. **Position Compatibility**: Only players who historically played the active round's position are eligible.
6. **Objective Final Comparison**: At the conclusion of round 11, the game presents a direct head-to-head comparison of both squads:
   - Average Overall Rating (OVR)
   - Total Goals
   - Total Assists
   - Appearances
   - Total Trophies (Bundesliga, Champions League, DFB-Pokal)
   - *"Compare the numbers and decide."*

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti, Web Audio API (zero external audio asset dependencies).
- **Backend**: Node.js, Express, CORS.
- **Database**: PostgreSQL support via `pg` pool (`schema.sql` and `seed.sql` provided) with an automatic built-in memory/dataset store for immediate out-of-the-box local execution.

### Directory Structure
```text
bayern-draft/
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Header, brand, sound toggle, reset
│   │   │   ├── Hero.jsx         # Bayern-inspired landing screen
│   │   │   ├── ProgressBar.jsx  # Round 1-11 position tracker
│   │   │   ├── DraftCard.jsx    # Revealed Player A card
│   │   │   ├── MysteryCard.jsx  # Concealed Mystery Player B card
│   │   │   ├── RevealModal.jsx  # Dramatic mystery reveal screen
│   │   │   ├── PitchView.jsx    # Interactive 4-3-3 visual pitch
│   │   │   └── ComparisonView.jsx # Side-by-side stats comparison
│   │   ├── data/players.js      # 51 verified FC Bayern players
│   │   ├── hooks/useDraftGame.js# Game engine state machine
│   │   ├── services/api.js      # Backend REST client
│   │   ├── utils/audio.js       # Web Audio API sound synthesizer
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
│
├── server/                      # Express Backend
│   ├── src/
│   │   ├── controllers/         # draftController, playerController
│   │   ├── routes/              # draftRoutes, playerRoutes
│   │   ├── services/            # draftService, playerService
│   │   ├── db/
│   │   │   ├── schema.sql       # PostgreSQL table schema
│   │   │   ├── seed.sql         # SQL seed statements
│   │   │   └── database.js      # PostgreSQL client + resilient store
│   │   ├── data/players.js
│   │   ├── server.js            # Express server entry point
│   │   └── test-draft.js        # Automated end-to-end test suite
│   └── package.json
└── package.json
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+) and npm

### 1. Start the Backend Server (Port 5000)
```powershell
cd server
npm install
node src/server.js
```
The server will start at `http://localhost:5000`.

### 2. Start the Frontend Client (Port 5173)
In a separate terminal:
```powershell
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```powershell
cd server
node src/test-draft.js
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/players` | List all 51 FC Bayern players (supports `?position=GK` query) |
| `GET` | `/api/players/:id` | Fetch single player details |
| `POST` | `/api/drafts` | Initialize a new 11-round draft session |
| `GET` | `/api/drafts/:id` | Retrieve draft state |
| `POST` | `/api/drafts/:id/choose` | Make selection (`choice: "revealed" \| "mystery"`), validates rules, unmasks mystery player, and advances to next round |
| `POST` | `/api/drafts/:id/finish` | Compute objective statistical comparison of final squads |

---

## 🗄️ Optional PostgreSQL Setup

If you have PostgreSQL running locally:
1. Create database: `CREATE DATABASE bayern_draft;`
2. Set environment variables in `server/.env`:
   ```env
   DATABASE_URL=postgres://postgres:password@localhost:5432/bayern_draft
   ```
3. Run the schema & seed scripts:
   ```bash
   psql -d bayern_draft -f src/db/schema.sql
   psql -d bayern_draft -f src/db/seed.sql
   ```
*(If PostgreSQL is not running, the server automatically uses its internal verified store seamlessly!)*
