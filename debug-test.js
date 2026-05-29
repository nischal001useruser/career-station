const base = 'http://localhost:5000'

async function main() {
  const loginResponse = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  })

  const loginData = await loginResponse.json()
  console.log('LOGIN', loginResponse.status, JSON.stringify(loginData))

  const token = loginData.data.token
  const questions = []
  for (let i = 1; i <= 25; i++) {
    let section = 'A'
    let difficulty = 'Easy'

    if (i >= 11 && i <= 20) {
      section = 'B'
      difficulty = 'Understanding'
    } else if (i >= 21 && i <= 25) {
      section = 'C'
      difficulty = 'Hard'
    }

    questions.push({
      question_number: i,
      section,
      difficulty,
      correct_option: ['A', 'B', 'C', 'D'][i % 4],
    })
  }

  const examResponse = await fetch(base + '/exams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({
      exam_name: 'Test Exam',
      course: 'Class 12',
      topic_name: 'Algebra',
      nepali_date: '2082-01-01',
      shift: 'A',
      total_questions: 25,
      questions,
    }),
  })

  console.log('CREATE_EXAM', examResponse.status, await examResponse.text())
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
