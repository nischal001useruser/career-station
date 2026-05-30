import { useState } from 'react'

export default function StudentResultPortal() {
  const [symbolNumber, setSymbolNumber] = useState('')
  const [examDate, setExamDate] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [reviewQuestions, setReviewQuestions] = useState([])
  const [reviewReason, setReviewReason] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setReviewQuestions([])
    setReviewReason('')
    setReviewMessage('')
    setReviewError('')

    if (!symbolNumber.trim() || !examDate.trim()) {
      setError('Please enter both symbol number and exam date.')
      return
    }

    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        symbol_number: symbolNumber.trim(),
        exam_date: examDate.trim(),
      })

      const response = await fetch(`/api/results/public?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to find that result')
      }

      setResult(data.data)
      setReviewQuestions([])
      setReviewReason('')
      setReviewMessage('')
      setReviewError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleReviewQuestion = (questionNumber) => {
    setReviewQuestions((current) =>
      current.includes(questionNumber)
        ? current.filter((num) => num !== questionNumber)
        : [...current, questionNumber]
    )
  }

  const submitReviewRequest = async () => {
    setReviewError('')
    setReviewMessage('')

    if (!result) {
      setReviewError('Load your result before requesting a review.')
      return
    }

    if (reviewQuestions.length === 0) {
      setReviewError('Select at least one question to review.')
      return
    }

    const wordCount = reviewReason.trim().split(/\s+/).filter(Boolean).length
    if (wordCount < 100) {
      setReviewError('Please write at least 100 words explaining your concern.')
      return
    }

    try {
      setReviewSubmitting(true)
      const response = await fetch('/api/review-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol_number: symbolNumber.trim(),
          exam_date: examDate.trim(),
          question_numbers: reviewQuestions.join(', '),
          reason: reviewReason.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review request')
      }

      setReviewMessage('Your review request has been submitted successfully.')
      setReviewQuestions([])
      setReviewReason('')
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setReviewSubmitting(false)
    }
  }

  const percentage = result ? Number(result.summary.percentage).toFixed(2) : '0.00'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Student Result Portal</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">View your exam result securely</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Enter your symbol number and the exam date to view your personal marks, rank, and question review. Only your own result is shown.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Search your result</h2>
              <p className="mt-1 text-sm text-slate-300">Use the exact symbol number and exam date from your exam slip.</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Symbol Number</label>
                <input
                  type="text"
                  value={symbolNumber}
                  onChange={(e) => setSymbolNumber(e.target.value)}
                  placeholder="SYM001"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Exam Date</label>
                <input
                  type="text"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  placeholder="2082-01-06"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-800/70"
              >
                {isLoading ? 'Checking result…' : 'View Result'}
              </button>
            </form>

            <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-3 text-sm text-cyan-50">
              <p className="font-semibold">Privacy notice</p>
              <p className="mt-1 text-cyan-100/90">Only the selected student's result is displayed. No class analytics, weekly reports, or AI summaries are included.</p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur">
            {!result ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-5 text-center text-sm text-slate-300">
                Search with a valid symbol number and exam date to see your result details.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-3xl bg-slate-900 p-5 ring-1 ring-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Personal Result</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">{result.student.full_name}</h2>
                      <p className="mt-1 text-sm text-slate-300">Symbol No.: {result.student.symbol_number} • {result.exam.exam_name}</p>
                      <p className="mt-1 text-sm text-slate-400">{result.exam.course} • {result.exam.topic_name} • {result.exam.nepali_date}</p>
                    </div>
                    {result.status === 'ABSENT' && (
                      <div className="rounded-full bg-rose-500/15 border border-rose-400/20 px-3 py-1 text-xs font-semibold text-rose-200">
                        You were absent during this examination
                      </div>
                    )}
                    {result.status !== 'ABSENT' && (
                      <div className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-200">Rank #{result.summary.rank || '—'}</div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Marks</p>
                      <p className="mt-2 text-3xl font-bold text-white">{result.summary.marks}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Percentage</p>
                      <p className="mt-2 text-3xl font-bold text-white">{percentage}%</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Section Score</p>
                      <p className="mt-2 text-lg font-bold text-white">A {result.summary.section_scores.A} • B {result.summary.section_scores.B} • C {result.summary.section_scores.C}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Question review</h3>
                      <p className="text-sm text-slate-300">Each question shows the correct answer, your selected answer, and whether it was correct.</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-200">{result.question_reviews.length} questions</span>
                  </div>

                  <div className="space-y-2">
                    {result.question_reviews.map((question) => (
                      <article key={question.question_number} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                              <p className="text-sm font-semibold text-cyan-200">Q.{question.question_number}</p>
                              <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 text-sm text-slate-200">
                                <input
                                  type="checkbox"
                                  checked={reviewQuestions.includes(question.question_number)}
                                  onChange={() => toggleReviewQuestion(question.question_number)}
                                  className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-500"
                                />
                                Review request
                              </label>
                            </div>
                            <p className="mt-2 text-sm text-slate-300">{question.question_text || 'Question text not available'}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${question.status === 'Correct' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
                            {question.status}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {['A', 'B', 'C', 'D'].map((option) => (
                            <div key={option} className={`rounded-xl px-3 py-2 ${question.correct_option === option ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/10'}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Option {option}</span>
                                {question.selected_option === option && (
                                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">Selected</span>
                                )}
                              </div>
                              <p className="mt-2 text-sm text-slate-200">{question[`option_${option.toLowerCase()}`] || 'No option text provided'}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-slate-200 sm:grid-cols-3">
                          <div className="rounded-xl bg-white/5 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Correct Answer</p>
                            <p className="mt-1 text-lg font-semibold text-white">{question.correct_option}</p>
                          </div>
                          <div className="rounded-xl bg-white/5 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Your Answer</p>
                            <p className="mt-1 text-lg font-semibold text-white">{question.selected_option || 'No response'}</p>
                          </div>
                          <div className="rounded-xl bg-white/5 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Status</p>
                            <p className={`mt-1 text-lg font-semibold ${question.status === 'Correct' ? 'text-emerald-200' : 'text-rose-200'}`}>{question.status}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                    <h3 className="text-lg font-semibold text-white">Submit a review request</h3>
                    <p className="mt-1 text-sm text-slate-300">Choose the questions you want reviewed and provide a detailed complaint of at least 100 words.</p>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">Selected questions</label>
                        <div className="rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">{reviewQuestions.length > 0 ? reviewQuestions.join(', ') : 'No questions selected'}</div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">Review reason</label>
                        <textarea
                          value={reviewReason}
                          onChange={(e) => setReviewReason(e.target.value)}
                          rows={6}
                          placeholder="Explain your concern in 100 words or more..."
                          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
                        />
                      </div>

                      {reviewError && (
                        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                          {reviewError}
                        </div>
                      )}
                      {reviewMessage && (
                        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                          {reviewMessage}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={submitReviewRequest}
                        disabled={reviewSubmitting}
                        className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-800/70"
                      >
                        {reviewSubmitting ? 'Submitting request…' : 'Submit review request'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
