/**
 * Database Schema Definitions
 * Creates all tables for Career Station Exam Analytics System
 */

export const createTables = (db) => {
  db.serialize(() => {
    // Students table
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        symbol_number TEXT UNIQUE NOT NULL,
        course TEXT NOT NULL,
        shift TEXT NOT NULL,
        batch TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating students table:', err)
      else console.log('✓ students table initialized')
    })

    // Exams table
    db.run(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_name TEXT NOT NULL,
        course TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        nepali_date TEXT NOT NULL,
        shift TEXT NOT NULL,
        total_questions INTEGER DEFAULT 25,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating exams table:', err)
      else console.log('✓ exams table initialized')
    })

    // Questions table
    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL,
        question_number INTEGER NOT NULL,
        section TEXT NOT NULL CHECK(section IN ('A', 'B', 'C')),
        difficulty TEXT NOT NULL,
        correct_option TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        UNIQUE(exam_id, question_number)
      )
    `, (err) => {
      if (err) console.error('Error creating questions table:', err)
      else console.log('✓ questions table initialized')
    })

    // Student Answers table
    db.run(`
      CREATE TABLE IF NOT EXISTS student_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        question_number INTEGER NOT NULL,
        selected_option TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        UNIQUE(student_id, exam_id, question_number)
      )
    `, (err) => {
      if (err) console.error('Error creating student_answers table:', err)
      else console.log('✓ student_answers table initialized')
    })

    // Results table
    db.run(`
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        percentage REAL NOT NULL,
        rank INTEGER,
        section_a_score INTEGER DEFAULT 0,
        section_b_score INTEGER DEFAULT 0,
        section_c_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        UNIQUE(student_id, exam_id)
      )
    `, (err) => {
      if (err) console.error('Error creating results table:', err)
      else console.log('✓ results table initialized')
    })

    // Weekly Reports table
    db.run(`
      CREATE TABLE IF NOT EXISTS weekly_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        week_start TEXT NOT NULL,
        week_end TEXT NOT NULL,
        ai_feedback TEXT,
        teacher_remark TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating weekly_reports table:', err)
      else console.log('✓ weekly_reports table initialized')
    })

    // Admin Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating admin_users table:', err)
      else console.log('✓ admin_users table initialized')
    })

    // Create indexes for performance
    db.run('CREATE INDEX IF NOT EXISTS idx_students_course ON students(course)')
    db.run('CREATE INDEX IF NOT EXISTS idx_students_shift ON students(shift)')
    db.run('CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course)')
    db.run('CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id)')
    db.run('CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section)')
    db.run('CREATE INDEX IF NOT EXISTS idx_student_answers_exam_id ON student_answers(exam_id)')
    db.run('CREATE INDEX IF NOT EXISTS idx_student_answers_student_id ON student_answers(student_id)')
    db.run('CREATE INDEX IF NOT EXISTS idx_results_exam_id ON results(exam_id)')
    db.run('CREATE INDEX IF NOT EXISTS idx_results_student_id ON results(student_id)')
    db.run('CREATE INDEX IF NOT EXISTS idx_weekly_reports_student_id ON weekly_reports(student_id)')
  })
}
