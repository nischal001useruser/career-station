import { allQuery, getQuery, runQuery } from '../utils/queryHelpers.js'
import { sendSuccess, handleError } from '../utils/responseHelpers.js'

const recalculateExamRanks = async (examId) => {
  const leaderboard = await allQuery(`
    SELECT r.id, r.score, r.percentage, s.full_name, s.symbol_number
    FROM results r
    JOIN students s ON s.id = r.student_id
    WHERE r.exam_id = ?
    ORDER BY r.score DESC, r.percentage DESC, s.full_name ASC, r.id ASC
  `, [examId])

  let currentRank = 0
  let previousScore = null
  let rankCounter = 0

  for (let index = 0; index < leaderboard.length; index++) {
    const row = leaderboard[index]
    rankCounter += 1

    if (previousScore === null || row.score !== previousScore) {
      currentRank = rankCounter
      previousScore = row.score
    }

    await runQuery('UPDATE results SET rank = ? WHERE id = ?', [currentRank, row.id])
  }

  return leaderboard
}

export const getAllResults = async (req, res) => {
  try {
    const results = await allQuery(`
      SELECT r.*, e.exam_name, e.course, e.nepali_date, s.full_name, s.symbol_number
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN students s ON r.student_id = s.id
      ORDER BY r.created_at DESC
    `)
    sendSuccess(res, results, 'Results retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getResultById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await getQuery(`
      SELECT r.*, e.exam_name, e.course, e.nepali_date, s.full_name, s.symbol_number
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN students s ON r.student_id = s.id
      WHERE r.id = ?
    `, [id])
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' })
    }
    sendSuccess(res, result, 'Result retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getLeaderboardByExam = async (req, res) => {
  try {
    const { examId } = req.params

    const leaderboard = await allQuery(`
      SELECT r.id, r.score, r.percentage, r.rank, r.section_a_score, r.section_b_score, r.section_c_score,
             s.id as student_id, s.full_name, s.symbol_number, s.course, s.batch
      FROM results r
      JOIN students s ON s.id = r.student_id
      WHERE r.exam_id = ?
      ORDER BY r.rank ASC, r.score DESC, r.percentage DESC, s.full_name ASC
    `, [examId])

    sendSuccess(res, leaderboard, 'Leaderboard retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getStudentResultBySymbolAndDate = async (req, res) => {
  try {
    const { symbol_number, exam_date } = req.query

    if (!symbol_number || !exam_date) {
      return res.status(400).json({ success: false, message: 'Symbol number and exam date are required' })
    }

    const result = await getQuery(`
      SELECT r.id, r.score, r.percentage, r.rank, r.section_a_score, r.section_b_score, r.section_c_score,
             s.id as student_id, s.full_name, s.symbol_number, s.course, s.batch,
             e.id as exam_id, e.exam_name, e.course as exam_course, e.topic_name, e.nepali_date, e.shift, e.total_questions
      FROM results r
      JOIN students s ON s.id = r.student_id
      JOIN exams e ON e.id = r.exam_id
      WHERE s.symbol_number = ? AND e.nepali_date = ?
    `, [symbol_number.trim(), exam_date.trim()])

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found for the provided symbol number and exam date' })
    }

    const questionReviews = await allQuery(`
      SELECT sa.question_number,
             q.section,
             q.correct_option,
             sa.selected_option,
             sa.is_correct,
             CASE WHEN sa.is_correct = 1 THEN 'Correct' ELSE 'Wrong' END as status
      FROM student_answers sa
      JOIN questions q
        ON q.exam_id = sa.exam_id
       AND q.question_number = sa.question_number
      WHERE sa.student_id = ? AND sa.exam_id = ?
      ORDER BY sa.question_number ASC
    `, [result.student_id, result.exam_id])

    sendSuccess(res, {
      student: {
        id: result.student_id,
        full_name: result.full_name,
        symbol_number: result.symbol_number,
        course: result.course,
        batch: result.batch,
      },
      exam: {
        id: result.exam_id,
        exam_name: result.exam_name,
        course: result.exam_course,
        topic_name: result.topic_name,
        nepali_date: result.nepali_date,
        shift: result.shift,
        total_questions: result.total_questions,
      },
      summary: {
        marks: result.score,
        percentage: Number(result.percentage),
        rank: result.rank,
        section_scores: {
          A: result.section_a_score,
          B: result.section_b_score,
          C: result.section_c_score,
        },
      },
      question_reviews: questionReviews.map((review) => ({
        question_number: review.question_number,
        correct_option: review.correct_option,
        selected_option: review.selected_option,
        status: review.status,
        section: review.section,
      })),
    }, 'Student result retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getStudentResultDetails = async (req, res) => {
  try {
    const { studentId, examId } = req.params

    const result = await getQuery(`
      SELECT r.id, r.score, r.percentage, r.rank, r.section_a_score, r.section_b_score, r.section_c_score,
             s.id as student_id, s.full_name, s.symbol_number, s.course, s.batch,
             e.id as exam_id, e.exam_name, e.course as exam_course, e.topic_name, e.nepali_date, e.shift, e.total_questions
      FROM results r
      JOIN students s ON s.id = r.student_id
      JOIN exams e ON e.id = r.exam_id
      WHERE r.student_id = ? AND r.exam_id = ?
    `, [studentId, examId])

    if (!result) {
      return res.status(404).json({ success: false, message: 'Student result not found' })
    }

    const questionReviews = await allQuery(`
      SELECT sa.question_number,
             q.section,
             q.correct_option,
             sa.selected_option,
             sa.is_correct,
             CASE WHEN sa.is_correct = 1 THEN 'Correct' ELSE 'Wrong' END as status
      FROM student_answers sa
      JOIN questions q
        ON q.exam_id = sa.exam_id
       AND q.question_number = sa.question_number
      WHERE sa.student_id = ? AND sa.exam_id = ?
      ORDER BY sa.question_number ASC
    `, [studentId, examId])

    sendSuccess(res, {
      student: {
        id: result.student_id,
        full_name: result.full_name,
        symbol_number: result.symbol_number,
        course: result.course,
        batch: result.batch,
      },
      exam: {
        id: result.exam_id,
        exam_name: result.exam_name,
        course: result.exam_course,
        topic_name: result.topic_name,
        nepali_date: result.nepali_date,
        shift: result.shift,
        total_questions: result.total_questions,
      },
      summary: {
        marks: result.score,
        percentage: Number(result.percentage),
        rank: result.rank,
        section_scores: {
          A: result.section_a_score,
          B: result.section_b_score,
          C: result.section_c_score,
        },
      },
      question_reviews: questionReviews.map((review) => ({
        question_number: review.question_number,
        correct_option: review.correct_option,
        selected_option: review.selected_option,
        status: review.status,
        section: review.section,
      })),
    }, 'Student result details retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params

    const student = await getQuery('SELECT * FROM students WHERE id = ?', [studentId])
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    const topicPerformance = await allQuery(`
      SELECT e.topic_name as topic,
             AVG(r.percentage) as avg_percentage,
             COUNT(*) as attempts
      FROM results r
      JOIN exams e ON e.id = r.exam_id
      WHERE r.student_id = ?
      GROUP BY e.topic_name
      ORDER BY avg_percentage DESC, attempts DESC
    `, [studentId])

    const weeklyAverage = await allQuery(`
      SELECT strftime('%Y-W%W', e.nepali_date) as week_key,
             MIN(e.nepali_date) as week_start,
             AVG(r.percentage) as avg_percentage
      FROM results r
      JOIN exams e ON e.id = r.exam_id
      WHERE r.student_id = ?
      GROUP BY week_key
      ORDER BY week_start ASC
    `, [studentId])

    const examHistory = await allQuery(`
      SELECT e.id as exam_id,
             e.exam_name,
             e.topic_name,
             e.nepali_date,
             r.score,
             r.percentage,
             r.rank,
             r.section_a_score,
             r.section_b_score,
             r.section_c_score
      FROM results r
      JOIN exams e ON e.id = r.exam_id
      WHERE r.student_id = ?
      ORDER BY e.nepali_date ASC, e.id ASC
    `, [studentId])

    const repeatedMistakes = await allQuery(`
      SELECT q.question_number,
             q.section,
             q.correct_option,
             SUM(CASE WHEN sa.is_correct = 0 THEN 1 ELSE 0 END) as wrong_attempts,
             GROUP_CONCAT(DISTINCT sa.selected_option) as wrong_options
      FROM student_answers sa
      JOIN questions q
        ON q.exam_id = sa.exam_id
       AND q.question_number = sa.question_number
      WHERE sa.student_id = ?
      GROUP BY q.question_number, q.section, q.correct_option
      HAVING wrong_attempts > 1
      ORDER BY wrong_attempts DESC, q.question_number ASC
      LIMIT 10
    `, [studentId])

    if (repeatedMistakes.length === 0) {
      const fallbackRepeatedMistakes = await allQuery(`
        SELECT q.question_number,
               q.section,
               q.correct_option,
               SUM(CASE WHEN sa.is_correct = 0 THEN 1 ELSE 0 END) as wrong_attempts,
               GROUP_CONCAT(DISTINCT sa.selected_option) as wrong_options
        FROM student_answers sa
        JOIN questions q
          ON q.exam_id = sa.exam_id
         AND q.question_number = sa.question_number
        WHERE sa.student_id = ?
        GROUP BY q.question_number, q.section, q.correct_option
        ORDER BY wrong_attempts DESC, q.question_number ASC
        LIMIT 10
      `, [studentId])

      repeatedMistakes.push(...fallbackRepeatedMistakes)
    }

    const sectionPerformance = await getQuery(`
      SELECT AVG(r.section_a_score) as avg_section_a,
             AVG(r.section_b_score) as avg_section_b,
             AVG(r.section_c_score) as avg_section_c,
             AVG(r.percentage) as overall_average
      FROM results r
      WHERE r.student_id = ?
    `, [studentId])

    const strongestTopic = topicPerformance[0] || null
    const weakestTopic = topicPerformance[topicPerformance.length - 1] || null
    const overallAverage = Number(sectionPerformance?.overall_average || 0)

    const classTopics = await allQuery(`
      SELECT e.topic_name as topic,
             AVG(r.percentage) as avg_percentage
      FROM results r
      JOIN exams e ON e.id = r.exam_id
      GROUP BY e.topic_name
      ORDER BY avg_percentage DESC
    `)

    const classStats = await getQuery(`
      SELECT AVG(r.percentage) as class_average,
             MAX(r.score) as topper_marks,
             MIN(r.score) as lowest_marks
      FROM results r
    `)

    const hardestTopic = classTopics[classTopics.length - 1] || null
    const classStrongestTopic = classTopics[0] || null

    sendSuccess(res, {
      student: {
        id: student.id,
        full_name: student.full_name,
        symbol_number: student.symbol_number,
        course: student.course,
        shift: student.shift,
        batch: student.batch,
      },
      student_analytics: {
        topic_performance: topicPerformance.map((row) => ({
          topic: row.topic,
          avg_percentage: Number(Number(row.avg_percentage).toFixed(2)),
          attempts: row.attempts,
        })),
        weekly_average: weeklyAverage.map((row) => ({
          week_key: row.week_key,
          week_start: row.week_start,
          avg_percentage: Number(Number(row.avg_percentage).toFixed(2)),
        })),
        exam_history: examHistory.map((row) => ({
          exam_id: row.exam_id,
          exam_name: row.exam_name,
          topic_name: row.topic_name,
          nepali_date: row.nepali_date,
          score: row.score,
          percentage: Number(Number(row.percentage).toFixed(2)),
          rank: row.rank,
        })),
        repeated_mistakes: repeatedMistakes.map((row) => ({
          question_number: row.question_number,
          section: row.section,
          correct_option: row.correct_option,
          wrong_attempts: Number(row.wrong_attempts),
          wrong_options: (row.wrong_options || '').split(',').filter(Boolean),
        })),
        strongest_topic: strongestTopic ? {
          topic: strongestTopic.topic,
          avg_percentage: Number(Number(strongestTopic.avg_percentage).toFixed(2)),
        } : null,
        weakest_topic: weakestTopic ? {
          topic: weakestTopic.topic,
          avg_percentage: Number(Number(weakestTopic.avg_percentage).toFixed(2)),
        } : null,
        section_performance: {
          A: Number((Number(sectionPerformance?.avg_section_a || 0) / 10 * 100).toFixed(2)),
          B: Number((Number(sectionPerformance?.avg_section_b || 0) / 10 * 100).toFixed(2)),
          C: Number((Number(sectionPerformance?.avg_section_c || 0) / 5 * 100).toFixed(2)),
        },
        overall_average: Number(overallAverage.toFixed(2)),
      },
      class_insights: {
        class_average: Number(Number(classStats?.class_average || 0).toFixed(2)),
        topper_marks: Number(classStats?.topper_marks || 0),
        lowest_marks: Number(classStats?.lowest_marks || 0),
        strongest_topic: classStrongestTopic ? {
          topic: classStrongestTopic.topic,
          avg_percentage: Number(Number(classStrongestTopic.avg_percentage).toFixed(2)),
        } : null,
        hardest_topic: hardestTopic ? {
          topic: hardestTopic.topic,
          avg_percentage: Number(Number(hardestTopic.avg_percentage).toFixed(2)),
        } : null,
      },
    }, 'Student analytics retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const generateExamRanks = async (req, res) => {
  try {
    const { examId } = req.params

    const exam = await getQuery('SELECT id FROM exams WHERE id = ?', [examId])
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    await recalculateExamRanks(examId)

    const updatedLeaderboard = await allQuery(`
      SELECT r.id, r.score, r.percentage, r.rank, s.full_name, s.symbol_number, s.course, s.batch
      FROM results r
      JOIN students s ON s.id = r.student_id
      WHERE r.exam_id = ?
      ORDER BY r.rank ASC, r.score DESC, r.percentage DESC, s.full_name ASC
    `, [examId])

    sendSuccess(
      res,
      {
        exam_id: Number(examId),
        updated_count: updatedLeaderboard.length,
        leaderboard: updatedLeaderboard,
      },
      'Ranks generated successfully'
    )
  } catch (error) {
    handleError(res, error)
  }
}

export const createResult = async (req, res) => {
  try {
    const { exam_id, student_id, answers } = req.body

    if (!exam_id || !student_id) {
      return res.status(400).json({ success: false, message: 'Exam and student are required' })
    }

    const exam = await getQuery('SELECT id, total_questions FROM exams WHERE id = ?', [exam_id])
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    const student = await getQuery('SELECT id FROM students WHERE id = ?', [student_id])
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    if (!Array.isArray(answers) || answers.length !== exam.total_questions) {
      return res.status(400).json({ success: false, message: `Exactly ${exam.total_questions} answers are required` })
    }

    const questionRows = await allQuery(
      'SELECT question_number, section, correct_option FROM questions WHERE exam_id = ? ORDER BY question_number',
      [exam_id]
    )

    if (questionRows.length !== exam.total_questions) {
      return res.status(400).json({ success: false, message: 'Exam answer key is incomplete' })
    }

    const answerMap = new Map(questionRows.map((question) => [question.question_number, question]))
    let totalCorrect = 0
    let sectionAScore = 0
    let sectionBScore = 0
    let sectionCScore = 0

    const studentAnswers = []

    for (const answer of answers) {
      const { question_number, selected_option } = answer
      const question = answerMap.get(Number(question_number))

      if (!question) {
        return res.status(400).json({ success: false, message: `Invalid question number: ${question_number}` })
      }

      if (!['A', 'B', 'C', 'D'].includes(selected_option)) {
        return res.status(400).json({ success: false, message: `Invalid selected option for question ${question_number}` })
      }

      const isCorrect = selected_option === question.correct_option
      if (isCorrect) {
        totalCorrect += 1
        if (question.section === 'A') sectionAScore += 1
        if (question.section === 'B') sectionBScore += 1
        if (question.section === 'C') sectionCScore += 1
      }

      studentAnswers.push({
        student_id,
        exam_id,
        question_number: Number(question_number),
        selected_option,
        is_correct: isCorrect ? 1 : 0,
      })
    }

    await runQuery('DELETE FROM student_answers WHERE student_id = ? AND exam_id = ?', [student_id, exam_id])
    await runQuery('DELETE FROM results WHERE student_id = ? AND exam_id = ?', [student_id, exam_id])

    for (const answer of studentAnswers) {
      await runQuery(
        'INSERT INTO student_answers (student_id, exam_id, question_number, selected_option, is_correct) VALUES (?, ?, ?, ?, ?)',
        [answer.student_id, answer.exam_id, answer.question_number, answer.selected_option, answer.is_correct]
      )
    }

    const percentage = Number(((totalCorrect / exam.total_questions) * 100).toFixed(2))

    const result = await runQuery(
      'INSERT INTO results (student_id, exam_id, score, percentage, section_a_score, section_b_score, section_c_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [student_id, exam_id, totalCorrect, percentage, sectionAScore, sectionBScore, sectionCScore]
    )

    await recalculateExamRanks(exam_id)

    const savedResult = await getQuery(
      'SELECT rank FROM results WHERE id = ?',
      [result.lastID]
    )

    sendSuccess(
      res,
      {
        id: result.lastID,
        student_id,
        exam_id,
        score: totalCorrect,
        percentage,
        rank: savedResult?.rank ?? null,
        section_a_score: sectionAScore,
        section_b_score: sectionBScore,
        section_c_score: sectionCScore,
      },
      'Result created successfully',
      201
    )
  } catch (error) {
    handleError(res, error)
  }
}

export const updateResult = async (req, res) => {
  try {
    const { id } = req.params
    const { score, percentage, section_a_score, section_b_score, section_c_score } = req.body

    const existingResult = await getQuery('SELECT * FROM results WHERE id = ?', [id])
    if (!existingResult) {
      return res.status(404).json({ success: false, message: 'Result not found' })
    }

    await runQuery(
      'UPDATE results SET score = ?, percentage = ?, section_a_score = ?, section_b_score = ?, section_c_score = ? WHERE id = ?',
      [score ?? existingResult.score, percentage ?? existingResult.percentage, section_a_score ?? existingResult.section_a_score, section_b_score ?? existingResult.section_b_score, section_c_score ?? existingResult.section_c_score, id]
    )

    sendSuccess(res, { id }, 'Result updated successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params

    const result = await getQuery('SELECT * FROM results WHERE id = ?', [id])
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' })
    }

    await runQuery('DELETE FROM results WHERE id = ?', [id])
    sendSuccess(res, { id }, 'Result deleted successfully')
  } catch (error) {
    handleError(res, error)
  }
}
