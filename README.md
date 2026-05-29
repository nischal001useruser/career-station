# Career Station - Exam Analytics Platform

A zero-cost educational exam analytics web application built with React, Express, and SQLite.

## 📋 Project Structure

### Frontend (`/frontend`)
```
src/
  ├── components/      # Reusable UI components
  ├── pages/          # Page components
  ├── layouts/        # Layout wrappers
  ├── services/       # API service layer
  ├── utils/          # Utility functions
  ├── charts/         # Chart configurations
  └── config/         # Configuration files
```

**Key Files:**
- `vite.config.js` - Vite configuration with proxy to backend
- `tailwind.config.js` - Tailwind CSS configuration
- `package.json` - Frontend dependencies

### Backend (`/backend`)
```
src/
  ├── routes/         # API route definitions
  ├── controllers/    # Route controllers
  ├── models/         # Data models
  ├── database/       # Database connection & setup
  ├── middleware/     # Express middleware
  └── utils/          # Utility functions
database/
  └── exams.db        # SQLite database file
```

**Key Files:**
- `server.js` - Express server entry point
- `database/connection.js` - SQLite connection & initialization
- `package.json` - Backend dependencies

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
copy .env.example .env

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
copy .env.example .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🛠️ Development

### Frontend Development
- **Hot reload:** Changes are automatically reflected
- **Tailwind CSS:** All utility classes available
- **Vite:** Fast build and dev server
- **Proxy:** API requests to `/api/*` forward to backend

### Backend Development
- **File watching:** Changes auto-restart server with `npm run dev`
- **SQLite:** Database auto-initialized on startup
- **CORS:** Enabled for frontend communication
- **Error handling:** Centralized middleware

## 📚 API Endpoints

### Health Check
- `GET /health` - API status

### Exams
- `GET /exams` - Get all exams
- `GET /exams/:id` - Get exam by ID
- `POST /exams` - Create exam
- `PUT /exams/:id` - Update exam
- `DELETE /exams/:id` - Delete exam

### Students
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Create student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

### Results
- `GET /results` - Get all results
- `GET /results/:id` - Get result by ID
- `POST /results` - Create result
- `PUT /results/:id` - Update result
- `DELETE /results/:id` - Delete result

## 📊 Database Schema

### Exams Table
- `id` - Primary key
- `name` - Exam name
- `description` - Exam description
- `total_marks` - Total marks for exam
- `passing_marks` - Passing threshold
- `duration_minutes` - Exam duration

### Students Table
- `id` - Primary key
- `name` - Student name
- `email` - Student email (unique)
- `phone` - Contact number
- `enrollment_number` - Student ID (unique)

### Results Table
- `id` - Primary key
- `exam_id` - Foreign key to exams
- `student_id` - Foreign key to students
- `marks_obtained` - Marks scored
- `status` - Pass/Fail status
- `duration_taken_minutes` - Time taken

## 📦 Installed Dependencies

### Frontend
- **React** (18.2.0) - UI library
- **Vite** (5.0.0) - Build tool
- **Tailwind CSS** (3.3.0) - Utility CSS
- **Chart.js** (4.4.0) - Charting library
- **Axios** (1.6.0) - HTTP client

### Backend
- **Express** (4.18.2) - Web framework
- **SQLite3** (5.1.6) - Database
- **CORS** (2.8.5) - Cross-origin support
- **dotenv** (16.3.1) - Environment variables

## 🎯 Next Steps

1. **Add more components** - Build out additional UI components
2. **Connect dashboard** - Integrate frontend with backend APIs
3. **Add chart visualizations** - Implement Chart.js charts
4. **Add authentication** - User login/registration
5. **Add data import** - CSV upload for bulk data
6. **Add reporting** - Generate analytics reports

## 📝 Notes

- Database file: `backend/database/exams.db`
- Environment files: Copy `.env.example` to `.env` in both frontend and backend
- All API responses use consistent format: `{ success, message, data }`
- Frontend proxies API calls through Vite dev server

## 🤝 Contributing

Follow the existing code structure and naming conventions.

## 📄 License

This project is created for educational purposes.
