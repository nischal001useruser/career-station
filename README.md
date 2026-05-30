# Career Station Exam Analytics

A zero-cost exam analytics platform for institutes, built with React, Vite, Tailwind CSS, Express, and SQLite. The system is designed for local deployment, stable classroom usage, and easy day-to-day institute operations.

---

## 🚀 Project Overview

Career Station Exam Analytics provides:
- exam answer-key management
- student records and result entry
- leaderboard and student performance analytics
- printable weekly report generation
- admin authentication and protected workflows

The solution is optimized for local use with SQLite and can be deployed with low operational overhead.

---

## 🧱 Tech Stack

- Frontend: React, Vite, Tailwind CSS, Chart.js
- Backend: Express, SQLite, dotenv, CORS
- Database: SQLite file-based storage
- Authentication: admin token-based session

---

## 📁 Project Structure

### Root
- `package.json` — project orchestration scripts
- `README.md` — deployment and usage documentation

### Backend (`/backend`)
- `src/server.js` — Express server entry point
- `src/routes/` — API route definitions
- `src/controllers/` — controller logic for exams, students, results, auth
- `src/database/` — SQLite connection, schema, migrations, and seed scripts
- `src/middleware/` — auth, error handling
- `src/utils/` — helpers and token utilities
- `database/exams.db` — persisted SQLite data file

### Frontend (`/frontend`)
- `src/App.jsx` — React router and main application shell
- `src/pages/` — admin pages, student portal, analytics pages
- `src/components/` — reusable UI components
- `src/layouts/` — layout wrappers
- `src/services/` — API client configuration
- `src/config/` — environment-aware API base URL

---

## 📦 Installation

### Prerequisites
- Node.js v18+ (preferred)
- npm v9+
- Git (optional)

### Install dependencies

From repository root:

```bash
npm run install
```

This installs backend and frontend dependencies.

---

## 🛠 Backend Setup

### 1. Create environment file

```bash
cd backend
copy .env.example .env
```

### 2. Seed initial data

```bash
cd backend
npm run seed
```

This creates the default admin user and sample students.

### 3. Start backend

```bash
cd backend
npm run dev
```

The backend listens on `http://localhost:5000` by default.

---

## 💻 Frontend Setup

### 1. Create environment file

```bash
cd frontend
copy .env.example .env
```

### 2. Start frontend

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and forwards API calls to the backend.

---

## 📌 Environment Variables

### Backend (`backend/.env.example`)

```text
PORT=5000
NODE_ENV=development
DB_PATH=./database/exams.db
TOKEN_EXPIRE_HOURS=24
```

### Frontend (`frontend/.env.example`)

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

> Note: If you deploy the frontend separately, update `VITE_API_BASE_URL` to your backend API host.

---

## ⚙️ Run Locally

### Root-level commands

```bash
npm run dev      # shows instructions for running both frontend and backend
npm run build    # builds frontend production assets
npm run clean    # removes frontend dist folder
```

### Backend commands

```bash
cd backend
npm run dev      # run backend in watch mode
npm start         # run backend in production mode
npm run seed      # initialize default admin and sample records
```

### Frontend commands

```bash
cd frontend
npm run dev      # development server with fast refresh
npm run build    # production build
npm run preview  # preview production output
npm run clean    # remove dist folder
```

---

## 🔐 Admin Login Instructions

The backend seed script creates a default admin user.

- Username: `admin`
- Password: `admin123`

For real institute use, change the password after deployment or create a new admin record directly in the database.

---

## 🧾 SQLite Backup System

SQLite stores all data in a single file:

- `backend/database/exams.db`

### Backup recommendations

- Stop the backend server before copying the file for a clean backup.
- Copy the file to a safe location, e.g. `backups/exams-YYYYMMDD.db`.
- Keep at least one recent backup before making bulk changes.

### Example backup command (Windows PowerShell)

```powershell
Stop-Process -Name node
Copy-Item backend\database\exams.db backups\exams-$(Get-Date -Format yyyyMMdd).db
```

### Safe recovery

- Restore by replacing `backend/database/exams.db` with a backup copy
- Start the backend again after restoring

> SQLite is ideal for low-cost local deployment, but it is not intended for highly concurrent or multi-node production.

---

## 🚀 Deployment Suggestions

### Frontend (Free Static Hosts)

The frontend is a static React app and can be published with:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

Set `VITE_API_BASE_URL` to your backend base URL when deploying.

### Backend (Local / Simple Hosting)

The backend is an Express API with SQLite. For a stable institute setup, preferred options are:
- local institute server or classroom PC
- small VM/container on Fly.io, Railway, or Render

> Since SQLite is file-based, local hosting is the safest and simplest deployment option.

---

## ✅ Production Workflow

1. Install dependencies
2. Configure `.env` files in `backend` and `frontend`
3. Seed backend data once with `npm run seed`
4. Build frontend with `npm run build`
5. Start backend in production mode: `cd backend && npm start`
6. Serve frontend `dist` from a static host or from the `frontend` directory

For local institute use, launch backend first and then open the frontend at `http://localhost:5173`.

---

## 📅 Daily Institute Usage

- Add or edit student records in the admin panel
- Create new exams and save answer keys
- Enter student answers and generate result summaries
- Review leaderboards and past exam performance
- Create weekly report summaries for individual students
- Backup `backend/database/exams.db` at the end of each day

---

## 📝 Notes for Administrators

- Keep the backend server running while teachers enter results
- Use `npm run build` before publishing the frontend
- Keep regular backups of the SQLite file
- Change the default admin password immediately after first use

---

## 📄 License

This repository is provided as a zero-cost institute-grade analytics system and may be adapted for educational deployment.
