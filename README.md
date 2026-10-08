# AI Student Assistant

An AI-powered web app that helps college students study more effectively. Built with React + Vite + TypeScript (frontend), Node.js + Express + TypeScript (backend), SQLite + Prisma (database), and OpenAI GPT-4o.

## Features

| Feature | Description |
|---|---|
| 🎓 Academic Assistant | Multi-turn AI chat tutor — ask any study question |
| 📅 Study Plan Generator | Generates a week-by-week study plan from your subject, exam date, and prep level |
| 📝 Quiz Generator | Creates MCQ quizzes, scores your attempt, and saves attempt history |
| 📄 Notes Summarizer | Paste text or upload a PDF/TXT — get concise bullet-point summaries |
| 📊 Dashboard | Stats overview, recent plans, recent quizzes with best scores, and a task checklist |

## Prerequisites

- **Node.js** ≥ 18 (no external database server needed — SQLite is file-based)
- An **OpenAI API key**

## Setup

### 1. Clone & install root dependencies

```bash
git clone <repo-url>
cd ai-student-assistant
npm install        # installs concurrently for the root dev script
```

### 2. Install client dependencies

```bash
cd client
npm install
cd ..
```

### 3. Install server dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure environment variables

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in your OpenAI key:

```
OPENAI_API_KEY=sk-...
DATABASE_URL=file:./prisma/dev.db
PORT=3001
```

### 5. Set up the database

```bash
cd server
npx prisma migrate dev --name init   # creates server/prisma/dev.db
npx prisma generate                  # generates the Prisma Client
cd ..
```

## Running the app

```bash
npm run dev          # starts both client (:5173) and server (:3001) concurrently
```

Or start them separately:

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

## Project structure

```
ai-student-assistant/
├── client/                  # Vite + React + TypeScript frontend
│   └── src/
│       ├── api/             # Axios wrappers for each backend route group
│       ├── components/      # Layout, Navbar, Sidebar
│       ├── pages/           # One file per page/feature
│       └── types/           # Shared TypeScript interfaces
└── server/                  # Express + TypeScript backend
    ├── prisma/
│   │   ├── schema.prisma    # SQLite schema
│   │   └── dev.db           # SQLite database file (git-ignored)
    └── src/
        ├── controllers/     # Request handlers
        ├── routes/          # Express routers
        └── services/        # OpenAI client + file parser
```

## Building for production

```bash
# build the frontend
cd client && npm run build

# build the server
cd server && npm run build

# start the server (serves API only; host client/dist with a static server)
cd server && npm start
```
