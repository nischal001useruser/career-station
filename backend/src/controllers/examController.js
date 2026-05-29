import { allQuery, getQuery, runQuery } from '../utils/queryHelpers.js'
import { sendSuccess, handleError } from '../utils/responseHelpers.js'

const SECTION_ORDER = ['A', 'B', 'C']

const SECTION_CONFIG = {
  A: { difficulty: 'Easy', count: 10 },
  B: { difficulty: 'Understanding', count: 10 },
  C: { difficulty: 'Hard', count: 5 },
}

export const getAllExams = async (req, res) => {
  try {
    const exams = await allQuery('SELECT * FROM exams ORDER BY created_at DESC')
    sendSuccess(res, exams, 'Exams retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getExamById = async (req, res) => {
  try {
    const { id } = req.params
    const exam = await getQuery('SELECT * FROM exams WHERE id = ?', [id])
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }
    sendSuccess(res, exam, 'Exam retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getExamQuestions = async (req, res) => {
  try {
    const { id } = req.params
    const exam = await getQuery('SELECT id FROM exams WHERE id = ?', [id])
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    const questions = await allQuery(
      'SELECT question_number, section, difficulty, correct_option FROM questions WHERE exam_id = ? ORDER BY question_number',
      [id]
    )

    sendSuccess(res, questions, 'Exam questions retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const createExam = async (req, res) => {
  try {
    const {
      exam_name,
      course,
      topic_name,
      nepali_date,
      shift,
      total_questions = 25,
      questions = [],
    } = req.body

    if (!course || !topic_name || !nepali_date || !shift) {
      return res.status(400).json({
        success: false,
        message: 'Course, topic name, nepali date, and shift are required',
      })
    }

    if (!Array.isArray(questions) || questions.length !== 25) {
      return res.status(400).json({
        success: false,
        message: 'Exactly 25 questions are required',
      })
    }

    const generatedExamName = exam_name || `${course} - ${topic_name}`

    const questionRows = []
    for (const question of questions) {
      const { question_number, section, difficulty, correct_option } = question

      if (!SECTION_ORDER.includes(section)) {
        return res.status(400).json({
          success: false,
          message: `Invalid section: ${section}`,
        })
      }

      const expectedDifficulty = SECTION_CONFIG[section].difficulty
      if (difficulty !== expectedDifficulty) {
        return res.status(400).json({
          success: false,
          message: `Question ${question_number} difficulty must be ${expectedDifficulty}`,
        })
      }

      if (!['A', 'B', 'C', 'D'].includes(correct_option)) {
        return res.status(400).json({
          success: false,
          message: `Question ${question_number} must have a valid correct option`,
        })
      }

      questionRows.push({
        question_number,
        section,
        difficulty,
        correct_option,
      })
    }

    const questionsWithCounts = questionRows.reduce((acc, row) => {
      acc[row.section] = (acc[row.section] || 0) + 1
      return acc
    }, {})

    for (const section of SECTION_ORDER) {
      const expectedCount = SECTION_CONFIG[section].count
      if ((questionsWithCounts[section] || 0) !== expectedCount) {
        return res.status(400).json({
          success: false,
          message: `Section ${section} must contain ${expectedCount} questions`,
        })
      }
    }

    const examResult = await runQuery(
      'INSERT INTO exams (exam_name, course, topic_name, nepali_date, shift, total_questions) VALUES (?, ?, ?, ?, ?, ?)',
      [generatedExamName, course, topic_name, nepali_date, shift, total_questions]
    )

    const examId = examResult.lastID

    for (const row of questionRows) {
      await runQuery(
        'INSERT INTO questions (exam_id, question_number, section, difficulty, correct_option) VALUES (?, ?, ?, ?, ?)',
        [examId, row.question_number, row.section, row.difficulty, row.correct_option]
      )
    }

    sendSuccess(
      res,
      {
        exam_id: examId,
        total_questions: total_questions,
        questions_saved: questionRows.length,
      },
      'Exam and answer key saved successfully',
      201
    )
  } catch (error) {
    handleError(res, error)
  }
}

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params
    const { exam_name, course, topic_name, nepali_date, shift, total_questions } = req.body

    const existingExam = await getQuery('SELECT * FROM exams WHERE id = ?', [id])
    if (!existingExam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    await runQuery(
      'UPDATE exams SET exam_name = ?, course = ?, topic_name = ?, nepali_date = ?, shift = ?, total_questions = ? WHERE id = ?',
      [
        exam_name || existingExam.exam_name,
        course || existingExam.course,
        topic_name || existingExam.topic_name,
        nepali_date || existingExam.nepali_date,
        shift || existingExam.shift,
        total_questions || existingExam.total_questions,
        id,
      ]
    )

    sendSuccess(res, { id }, 'Exam updated successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params

    const exam = await getQuery('SELECT * FROM exams WHERE id = ?', [id])
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    await runQuery('DELETE FROM exams WHERE id = ?', [id])
    sendSuccess(res, { id }, 'Exam deleted successfully')
  } catch (error) {
    handleError(res, error)
  }
}
