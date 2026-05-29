const base = 'http://localhost:5000'

async function main() {
  const loginResponse = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  })

  const loginData = await loginResponse.json()
  const token = loginData.data.token

  const examId = 4
  const studentId = 1
  const answers = []
  for (let i = 1; i <= 25; i++) {
    answers.push({
      question_number: i,
      selected_option: ['A', 'B', 'C', 'D'][i % 4],
    })
  }

  const resultResponse = await fetch(base + '/results', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({ exam_id: examId, student_id: studentId, answers }),
  })

  console.log('CREATE_RESULT', resultResponse.status, await resultResponse.text())

  const leaderboardResponse = await fetch(base + `/results/leaderboard/${examId}`)
  console.log('LEADERBOARD', leaderboardResponse.status, await leaderboardResponse.text())

  const analyticsResponse = await fetch(base + `/results/analytics/student/${studentId}`)
  console.log('ANALYTICS', analyticsResponse.status, await analyticsResponse.text())
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
