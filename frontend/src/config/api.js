export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://career-station-backend.onrender.com/api'

export const API_ENDPOINTS = {
  // Exam endpoints
  exams: '/exams',
  // Student endpoints
  students: '/students',
  // Results endpoints
  results: '/results',
  // Analytics endpoints
  analytics: '/analytics',
}
