import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { createTables } from './schema.js'
import { migrateStudentAnswersSelectedOptionNullable } from './migrateStudentAnswersSelectedOptionNullable.js'


const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPathFromEnv = process.env.DB_PATH || './database/exams.db'
const dbPath = path.isAbsolute(dbPathFromEnv)
  ? dbPathFromEnv
  : path.resolve(__dirname, '../../', dbPathFromEnv)

let db = null

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err)
      } else {
        console.log('Connected to SQLite database at:', dbPath)
        createTables(db)
        // Migration: selected_option must allow NULL for skipped/unanswered questions.
        migrateStudentAnswersSelectedOptionNullable()
          .catch((e) => console.error('Migration failed:', e))
          .finally(() => resolve(db))

      }
    })
  })
}

export const getDatabase = () => db

export const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err)
      } else {
        console.log('Database connection closed')
      }
    })
  }
}
