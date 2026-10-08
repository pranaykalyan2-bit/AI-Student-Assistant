# AI Student Assistant — Implementation Plan

## Overview

Build a full-stack AI-powered web application that helps college students with studying and productivity.
The app has five feature areas: AI Academic Assistant, Study Plan Generator, Quiz Generator,
Notes Summarizer, and a Student Dashboard.

**Stack:** React + Vite + TypeScript (frontend) · Node.js + Express + TypeScript (backend) ·
SQLite + Prisma (database) · OpenAI gpt-4o (AI) · Tailwind CSS (styling)

**Design:** Blue-and-white theme · responsive sidebar layout · rounded cards · clear icons ·
professional yet beginner-friendly college student aesthetic

**Constraints:**
- No user authentication — single-user app
- OpenAI API key lives in server/.env only
- All AI calls go through the backend (never from the browser)
- File uploads (PDF + TXT) handled server-side with Multer + pdf-parse
- SQLite database file stored at `server/prisma/dev.db` — no external DB server required

---

## Sub-Task 1 — Project Scaffolding & Monorepo Setup

**Intent:** Create the root folder structure, initialise both the `client` and `server` packages,
install all dependencies, and wire up shared TypeScript configuration. This establishes the
foundation every later sub-task builds on.

**Expected Outcomes:**
- Root `package.json` with scripts to run both client and server concurrently
- `client/` is a working Vite + React + TypeScript app with Tailwind CSS configured
- `server/` is a working Express + TypeScript app with ts-node-dev for hot reload
- `server/.env.example` documents required environment variables
- Both apps start without errors (frontend on :5173, backend on :3001)

**Todo List:**
- [ ] Create root `package.json` with `dev` script using `concurrently`
- [ ] Scaffold `client/` with `npm create vite@latest` (React + TypeScript template)
- [ ] Install and configure Tailwind CSS in `client/`
- [ ] Install client dependencies: `axios`, `react-router-dom`, `react-markdown`
- [ ] Scaffold `server/` with `npm init`, install `express`, `typescript`, `ts-node-dev`, `cors`, `dotenv`, `multer`, `pdf-parse`, `openai`, `@prisma/client`, `prisma`
- [ ] Create `server/tsconfig.json`
- [ ] Create `server/src/index.ts` with a basic Express app listening on port 3001
- [ ] Create `server/.env.example` with `OPENAI_API_KEY=` and `DATABASE_URL=`
- [ ] Verify both apps start cleanly

**Relevant Context:** Greenfield project — no existing files.

**Status:** [x] done

---

## Sub-Task 2 — Database Schema & Prisma Setup

**Intent:** Define the SQLite schema for StudyPlan, Quiz, QuizAttempt, and Task tables using Prisma,
run the initial migration, and confirm the Prisma client generates without errors. SQLite requires no
external database server — the DB file lives inside the repo at `server/prisma/dev.db`.

**Expected Outcomes:**
- `server/prisma/schema.prisma` uses `provider = "sqlite"` and defines all four models
- `npx prisma migrate dev` creates `server/prisma/dev.db` automatically
- Prisma Client is generated and importable in server code
- Quiz model supports re-attempt history via a separate `QuizAttempt` table

**Todo List:**
- [ ] Write `server/prisma/schema.prisma` with `datasource db { provider = "sqlite" }` and models:
  - `StudyPlan` — id, subject, examDate, hoursPerDay, prepLevel, planContent, createdAt
  - `Quiz` — id, topic, difficulty, questions (String/JSON-encoded), createdAt; has many QuizAttempts
  - `QuizAttempt` — id, quizId (FK), score, totalQuestions, attemptedAt; belongs to Quiz
  - `Task` — id, title, done, studyPlanId (optional FK to StudyPlan), createdAt
- [ ] Run `npx prisma migrate dev --name init` to create dev.db and tables
- [ ] Run `npx prisma generate` to generate the typed Prisma Client
- [ ] Import PrismaClient in a shared `server/src/prisma.ts` singleton file
- [ ] Add `server/prisma/dev.db` to `.gitignore`

**Relevant Context:** `DATABASE_URL="file:./dev.db"` is the SQLite connection string for Prisma.
No PostgreSQL or other external service required.

**Status:** [x] done

---

## Sub-Task 3 — Backend API Routes (All Features)

**Intent:** Implement all five Express route groups that the frontend will call.
Each route group handles one feature: AI chat, study plan, quiz, summarizer, and dashboard.

**Expected Outcomes:**
- `POST /api/ai/chat` — accepts `{messages}`, returns OpenAI streaming or full response
- `POST /api/study-plan/generate` — accepts form fields, calls OpenAI, saves to DB, returns plan
- `GET  /api/study-plan` — returns all saved study plans
- `POST /api/quiz/generate` — accepts topic/difficulty/count, calls OpenAI, saves Quiz to DB, returns quiz
- `GET  /api/quiz` — returns all saved quizzes (with attempt history included)
- `GET  /api/quiz/:id` — returns a single quiz with its questions and full attempt history
- `POST /api/quiz/:id/attempt` — records a new attempt (score + totalQuestions) for an existing quiz
- `POST /api/summarizer/summarize` — accepts text or file upload, calls OpenAI, returns summary
- `GET  /api/dashboard` — returns aggregated stats: recent plans, recent quizzes, tasks
- `POST /api/tasks` — create a task
- `PATCH /api/tasks/:id` — toggle task done status
- `DELETE /api/tasks/:id` — delete a task

**Todo List:**
- [ ] Create `server/src/services/openai.ts` — initialise OpenAI client, export helper `chatCompletion(messages, systemPrompt)`
- [ ] Create `server/src/services/fileParser.ts` — extract text from PDF (pdf-parse) and TXT buffers
- [ ] Create `server/src/routes/ai.ts` and controller — multi-turn chat endpoint
- [ ] Create `server/src/routes/studyPlan.ts` and controller — generate + list study plans
- [ ] Create `server/src/routes/quiz.ts` and controller — generate + list quizzes + record attempts + fetch single quiz
- [ ] Create `server/src/routes/summarizer.ts` and controller — file upload with Multer + text extraction + summarize
- [ ] Create `server/src/routes/dashboard.ts` — aggregate query across StudyPlan, Quiz, Task
- [ ] Create `server/src/routes/tasks.ts` and controller — CRUD for tasks
- [ ] Register all routes in `server/src/index.ts`
- [ ] Test each endpoint with a REST client (curl or Postman)

**Relevant Context:**
- OpenAI service lives in `server/src/services/openai.ts`
- Prisma singleton in `server/src/prisma.ts`
- Multer config: memory storage, accept `application/pdf` and `text/plain`, max 5 MB

**Status:** [x] done

---

## Sub-Task 4 — Frontend Shell: Layout, Routing & Navigation

**Intent:** Build the React app shell — sidebar navigation, top navbar, page routing —
so all feature pages have a consistent layout to be dropped into.

**Expected Outcomes:**
- `React Router` routes defined for `/`, `/assistant`, `/study-plan`, `/quiz`, `/summarizer`
- `Sidebar` component with nav links to all five sections, active link highlighted
- `Navbar` (top bar) with app name/logo
- `Layout` wrapper component that renders Sidebar + Navbar + `<Outlet />`
- Dashboard page (`/`) shows placeholder content
- App is visually clean, uses Tailwind, and is responsive (collapses sidebar on mobile)

**Todo List:**
- [ ] Create `client/src/components/Layout.tsx` with Sidebar + Navbar structure
- [ ] Create `client/src/components/Sidebar.tsx` with nav links and active state
- [ ] Create `client/src/components/Navbar.tsx`
- [ ] Create stub page files for all five pages
- [ ] Set up React Router in `client/src/main.tsx` with the Layout wrapping all routes
- [ ] Style with Tailwind — clean white/blue student-friendly theme
- [ ] Verify routing and navigation works correctly

**Relevant Context:** Client runs on Vite `:5173`, proxies `/api/*` to `:3001` via `vite.config.ts`.

**Status:** [x] done

---

## Sub-Task 5 — Feature: AI Academic Assistant Page

**Intent:** Build the chat UI where students type questions and receive AI explanations.
Conversation history is kept in component state for multi-turn context.

**Expected Outcomes:**
- Chat bubble UI (student messages right-aligned, AI messages left-aligned)
- Input box with Send button (supports Enter key)
- Loading indicator while AI responds
- Markdown rendering in AI responses (`react-markdown`)
- Conversation clears on "New Chat" button

**Todo List:**
- [ ] Create `client/src/api/aiApi.ts` — wraps `POST /api/ai/chat`
- [ ] Build `client/src/pages/AcademicAssistant.tsx` with full chat UI
- [ ] Implement message history state and scroll-to-bottom behaviour
- [ ] Add loading spinner and error handling
- [ ] Render AI responses with `react-markdown`

**Relevant Context:** Multi-turn chat — entire `messages` array is sent to the backend on each request.

**Status:** [x] done

---

## Sub-Task 6 — Feature: Study Plan Generator Page

**Intent:** Build the form-based page where students generate and save personalised study plans.

**Expected Outcomes:**
- Form with fields: Subject, Exam Date (date picker), Hours per Day (number), Preparation Level (select: Beginner/Intermediate/Advanced)
- Submit calls backend, displays the generated plan (formatted text)
- "Save Plan" button persists it to the database
- Success confirmation shown after save

**Todo List:**
- [ ] Create `client/src/api/studyPlanApi.ts`
- [ ] Build `client/src/pages/StudyPlanGenerator.tsx` with controlled form
- [ ] Display AI-generated plan as formatted text/markdown
- [ ] Implement save-to-DB flow and success feedback

**Status:** [x] done

---

## Sub-Task 7 — Feature: Quiz Generator Page

**Intent:** Build the quiz page where students can generate new quizzes, attempt them, and
re-attempt any previously saved quiz from the Dashboard. Each attempt is recorded with its score.

**Expected Outcomes:**
- Form with: Topic, Difficulty (Easy/Medium/Hard), Number of questions (5/10/15)
- Generated quiz renders as interactive MCQ cards
- Student selects answers, submits, sees score and correct answers highlighted
- Attempt is saved via `POST /api/quiz/:id/attempt` (score + total stored in QuizAttempt)
- "Saved Quizzes" section (or a separate route `/quiz/:id`) allows re-attempting any stored quiz
- Attempt history (date + score) visible per quiz so the student can track improvement

**Todo List:**
- [ ] Create `client/src/api/quizApi.ts` — wraps generate, list, get-by-id, and submit-attempt endpoints
- [ ] Build `client/src/pages/QuizGenerator.tsx` with form + MCQ rendering
- [ ] Implement answer selection state and submit/score logic
- [ ] Highlight correct/incorrect answers after submission
- [ ] Call `POST /api/quiz/:id/attempt` to persist each attempt
- [ ] Build `client/src/pages/QuizDetail.tsx` (or modal) to load a saved quiz for re-attempt
- [ ] Display attempt history (list of past scores with dates) on the quiz detail view

**Status:** [x] done

---

## Sub-Task 8 — Feature: Notes Summarizer Page

**Intent:** Build the summarizer page supporting both text paste and file upload (PDF/TXT).

**Expected Outcomes:**
- Textarea for pasting notes
- File upload input accepting `.pdf` and `.txt`
- Submitting either source calls backend and displays the bullet-point summary
- Clear/reset button

**Todo List:**
- [ ] Create `client/src/api/summarizerApi.ts` — uses `FormData` for file upload
- [ ] Build `client/src/pages/NotesSummarizer.tsx`
- [ ] Toggle between text input and file upload modes
- [ ] Display summary as markdown bullet points
- [ ] Handle file size/type validation on client side

**Status:** [x] done

---

## Sub-Task 9 — Feature: Student Dashboard Page

**Intent:** Build the dashboard that surfaces the student's saved plans, quizzes, tasks, and
progress at a glance. Quizzes link through to their detail/re-attempt view.

**Expected Outcomes:**
- Summary stats cards: total study plans saved, quizzes taken, average quiz score, tasks completed
- Recent study plans list (last 5)
- Recent quizzes list with best score badge and a "Re-attempt" button per quiz
- Task list with checkboxes to toggle done, add new task, delete task
- All data fetched from `GET /api/dashboard` and task CRUD endpoints
- "Re-attempt" button navigates to `/quiz/:id` to reload the saved quiz for another attempt

**Todo List:**
- [ ] Create `client/src/api/dashboardApi.ts` and `tasksApi.ts`
- [ ] Build `client/src/pages/Dashboard.tsx` with stats, plans, quizzes, and tasks sections
- [ ] Add "Re-attempt" button to each quiz row linking to `/quiz/:id`
- [ ] Implement task add/toggle/delete interactions
- [ ] Style with Tailwind rounded cards, blue accent colours, clear section headings, and consistent spacing

**Status:** [x] done

---

## Sub-Task 10 — Polish, Validation & Environment Setup Docs

**Intent:** Add final polish — form validation, error states, empty states, loading skeletons —
and write a clear README so the project is easy to run locally with SQLite.

**Expected Outcomes:**
- All forms show inline validation errors for empty/invalid fields
- All pages show a friendly empty state when no data exists yet
- API errors surface as dismissible alert banners (not silent failures)
- `README.md` documents prerequisites (Node.js only — no DB server needed), env setup, and how to run
- Blue-and-white design is consistent across all pages: sidebar, cards, buttons, badges

**Todo List:**
- [ ] Add client-side form validation to all four feature forms
- [ ] Add empty-state messages to Dashboard sections
- [ ] Centralise API error handling in Axios interceptor
- [ ] Write `README.md` — note SQLite requires no setup beyond `npm install` and adding `.env`
- [ ] Final responsive-design check at mobile and tablet breakpoints
- [ ] Verify sidebar collapses correctly on narrow screens

**Status:** [x] done
