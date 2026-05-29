import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { createTables } from './schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../../database/exams.db')

let db = null

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err)
      } else {
        console.log('Connected to SQLite database at:', dbPath)
        createTables(db)
        resolve(db)
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
