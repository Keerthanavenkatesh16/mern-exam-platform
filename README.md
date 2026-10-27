# Secure Digital Assessment Platform (MERN Stack)

A full-stack online examination platform built with **MongoDB, Express.js, React.js, and Node.js**, implementing the requirements from the SRS: role-based access (Admin / Faculty / Student), exam creation and scheduling, a question bank with multiple question types, an online exam-taking interface with autosave and a countdown timer, automated evaluation for objective questions, basic academic-integrity/proctoring event logging, performance analytics, and result publication workflow.

## Project structure

```
mern-exam-platform/
├── backend/          Express + MongoDB API (JWT auth, exams, questions, attempts, analytics)
└── frontend/          React SPA (student/faculty/admin dashboards, exam-taking UI)
```

## Features implemented

- **Auth & Authorization**: JWT access + refresh tokens (refresh token in httpOnly cookie), bcrypt password hashing, role-based route guards, password reset flow, logout/session invalidation.
- **User roles**: Admin, Faculty, Student — each with a distinct dashboard and permitted actions.
- **Exam management**: create/edit/delete exams, question selection, scheduling window, negative marking, question randomization, full status lifecycle (draft → scheduled → active → completed → published → archived).
- **Question bank**: reusable question banks; question types — MCQ, Multiple Select, True/False, Fill in the Blank, Short Answer, Descriptive, Coding (coding execution is stubbed — see note below).
- **Online exam interface**: countdown timer with auto-submit on expiry, question navigator grid (answered / marked for review / unvisited), debounced autosave per answer, submit confirmation.
- **Proctoring / integrity signals**: tab-switch and window-blur detection, fullscreen-exit detection, per-attempt activity log, automatic "flagged suspicious" marking past a configurable threshold, a faculty/admin suspicious-activity report.
- **Automated evaluation**: objective question types are auto-graded on submission (with negative marking support); descriptive answers are queued for manual faculty grading; result totals, percentage, and pass/fail are computed automatically and recomputed after manual grading.
- **Results**: student result dashboard (visible only after faculty publishes), detailed per-question breakdown, faculty "publish results" action that also fires notifications.
- **Analytics**: exam-level stats (average/high/low score, pass rate, question-wise correct/incorrect/unanswered chart), student-level subject-wise performance and score trend, admin platform-wide overview (user counts, exam counts, flagged attempts).
- **Notifications**: in-app notifications for scheduled exams and published results, plus a generic announcement endpoint for faculty/admin.

### Note on coding-question execution
The SRS calls for running submitted code against test cases in a sandboxed environment. Actually executing arbitrary user code requires an isolated runtime (e.g., Docker containers, a service like Judge0, or a serverless sandbox) that is outside the scope of what can run in this repo as-is. The data model, submission flow, and marks-aggregation logic for coding questions are fully wired up in `backend/utils/evaluateAnswer.js` (`runCodeTestCases`) — swap the stub implementation there for a call to your chosen sandboxed execution service to make coding questions auto-gradable end-to-end.

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB (local instance or Atlas connection string)

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then edit .env with your own JWT secrets and MONGO_URI
npm run seed            # optional: creates sample admin/faculty/student + a demo exam
npm run dev              # starts the API on http://localhost:5000
```

Seeded accounts (from `npm run seed`):
| Role    | Email                | Password     |
|---------|-----------------------|--------------|
| Admin   | admin@example.com     | Admin@123    |
| Faculty | faculty@example.com   | Faculty@123  |
| Student | student@example.com   | Student@123  |

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # set REACT_APP_API_URL if not using the default
npm start                # starts the React app on http://localhost:3000
```

### 3. Log in
Visit `http://localhost:3000`, log in with one of the seeded accounts (or register a new student/faculty account), and:
- **Faculty**: go to *Question Banks* to add questions, then *+ New Exam* to build and schedule an exam.
- **Student**: once an exam is `scheduled` or `active` and within its time window, it appears on the student dashboard with a **Start / Resume Exam** button.
- **Admin**: view platform-wide stats and manage user accounts from the Admin Dashboard.

## Environment variables

**backend/.env**
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Long random secrets — generate with `openssl rand -hex 32` |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | Token lifetimes (defaults: 15m / 7d) |
| `CLIENT_URL` | Frontend origin, used for CORS and cookie settings |

**frontend/.env**
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Base URL of the backend API (default `http://localhost:5000/api`) |

## Security notes
- Passwords are hashed with bcrypt; JWT secrets and DB credentials are read only from environment variables, never hard-coded.
- Refresh tokens are stored in an httpOnly cookie and tracked server-side per user so they can be revoked (logout, password reset).
- Rate limiting is applied globally and more tightly on `/api/auth/login` and `/api/auth/register`.
- `helmet` is enabled for standard security headers; all mutating endpoints require an authenticated, role-checked request.

## Extending this further
- Plug in a real sandboxed code-execution service for coding questions.
- Add camera/microphone-based proctoring capture (this scaffold only tracks tab/fullscreen/window events, per the SRS's note that proctoring alerts should be treated as indicators for human review).
- Add email delivery for notifications and password resets (currently notifications are in-app only; password reset returns a dev-only token when `NODE_ENV !== 'production'`).
- Add Socket.IO-driven live exam monitoring on the faculty dashboard (the server already sets up a `join_exam_room` socket event you can build on).
