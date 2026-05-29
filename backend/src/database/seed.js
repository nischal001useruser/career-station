/**
 * Database Seeding Script
 * Seeds initial data including admin user
 */

import { initDatabase, closeDatabase } from './connection.js'
import { runQuery, getQuery } from './helpers.js'
import crypto from 'crypto'

const seedAdminUser = async () => {
  try {
    const defaultUsername = 'admin'
    const defaultPassword = 'admin123'

    // Check if admin exists
    const adminExists = await getQuery(
      'SELECT id FROM admin_users WHERE username = ?',
      [defaultUsername]
    )

    if (adminExists) {
      console.log('✓ Admin user already exists')
      return
    }

    // Hash password (simple hash for now - use bcrypt in production)
    const hashedPassword = crypto
      .createHash('sha256')
      .update(defaultPassword)
      .digest('hex')

    await runQuery(
      'INSERT INTO admin_users (username, password) VALUES (?, ?)',
      [defaultUsername, hashedPassword]
    )

    console.log('✓ Admin user seeded successfully')
    console.log(`  Username: ${defaultUsername}`)
    console.log(`  Password: ${defaultPassword}`)
    console.log('  ⚠️  Change password in production!')
  } catch (error) {
    console.error('Error seeding admin user:', error)
  }
}

const seedSampleData = async () => {
  try {
    // Check if data exists
    const studentCount = await getQuery('SELECT COUNT(*) as count FROM students')
    if (studentCount.count > 0) {
      console.log('✓ Sample data already exists')
      return
    }

    console.log('Seeding sample data...')

    // Sample students
    const students = [
      {
        full_name: 'राज कुमार',
        symbol_number: 'STU001',
        course: 'Class 12',
        shift: 'A',
        batch: '2023-2024'
      },
      {
        full_name: 'प्रिया शर्मा',
        symbol_number: 'STU002',
        course: 'Class 12',
        shift: 'A',
        batch: '2023-2024'
      },
      {
        full_name: 'सुनील पाण्डे',
        symbol_number: 'STU003',
        course: 'Class 12',
        shift: 'B',
        batch: '2023-2024'
      },
    ]

    for (const student of students) {
      await runQuery(
        `INSERT INTO students (full_name, symbol_number, course, shift, batch)
         VALUES (?, ?, ?, ?, ?)`,
        [student.full_name, student.symbol_number, student.course, student.shift, student.batch]
      )
    }
    console.log(`✓ ${students.length} sample students seeded`)

  } catch (error) {
    console.error('Error seeding sample data:', error)
  }
}

const seed = async () => {
  try {
    await initDatabase()
    console.log('\nStarting database seeding...\n')

    await seedAdminUser()
    await seedSampleData()

    console.log('\n✓ Database seeding completed!\n')
    closeDatabase()
    process.exit(0)
  } catch (error) {
    console.error('Fatal error during seeding:', error)
    process.exit(1)
  }
}

seed()
