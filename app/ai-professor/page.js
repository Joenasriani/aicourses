"use client"

import { useState } from "react"
import { generateCourse } from "../actions/ai-professor"

export default function AIProfessorPage() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError("")
    const res = await generateCourse(new FormData(e.target))
    if (res.ok) {
      setResult(res.data)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  return (
    <main>
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <div className="hero-inner">
            <div style={{ textAlign: "center", margin: "0 auto", maxWidth: 600 }}>
              <p className="eyebrow">AI Professor</p>
              <h1>Your Personal AI Professor</h1>
              <p className="hero-text" style={{ textAlign: "center", marginTop: "0.5rem" }}>
                Enter a topic and difficulty level — get a full structured course instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="container" style={{ maxWidth: "720px" }}>

          {/* Form card */}
          <div className="value-card" style={{ padding: "2rem" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label htmlFor="topic" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Course Topic
                </label>
                <input
                  id="topic"
                  name="topic"
                  type="text"
                  required
                  placeholder="e.g. Machine Learning, Prompt Engineering…"
                  className="search-input"
                  style={{ width: "100%", height: "48px" }}
                />
              </div>

              <div>
                <label htmlFor="difficulty" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  defaultValue="Beginner"
                  className="search-input"
                  style={{ width: "100%", height: "48px", cursor: "pointer" }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary full"
                style={{ height: "52px", fontSize: "1rem" }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <span className="ai-spinner" aria-hidden="true" style={{ width: "1.1rem", height: "1.1rem" }} />
                    Generating…
                  </span>
                ) : "Generate Course"}
              </button>
            </form>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center" }}>
              <span className="ai-spinner" aria-hidden="true" />
              <p style={{ color: "var(--muted)", fontWeight: 500 }}>
                Professor is curating your custom curriculum…
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", color: "#be123c" }}>
              {error}
            </div>
          )}

          {/* Structured course result */}
          {result && !loading && (
            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Title */}
              <div className="value-card" style={{ padding: "1.75rem" }}>
                <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Generated Course</p>
                <h2 style={{ margin: 0 }}>{result.courseTitle}</h2>
              </div>

              {/* 5-Day Outline */}
              <div className="value-card" style={{ padding: "1.75rem" }}>
                <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>5-Day Outline</h3>
                <ol style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {result.fiveDayOutline.map((day, i) => (
                    <li key={i} style={{ lineHeight: 1.6 }}>
                      <strong>Day {i + 1}:</strong> {day}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Daily Action Prompts */}
              {result.practicalActionPrompts?.length > 0 && (
                <div className="value-card" style={{ padding: "1.75rem" }}>
                  <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Daily Action Prompts</h3>
                  <ol style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {result.practicalActionPrompts.map((prompt, i) => (
                      <li key={i} style={{ lineHeight: 1.6 }}>
                        <strong>Day {i + 1}:</strong> {prompt}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Quizzes */}
              <div className="value-card" style={{ padding: "1.75rem" }}>
                <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Daily Quizzes</h3>
                {Object.entries(result.quizzes).map(([day, questions]) => (
                  <div key={day} style={{ marginBottom: "1.5rem" }}>
                    <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>Day {day}</p>
                    <ol style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {questions.map((q, qi) => (
                        <li key={qi}>
                          <p style={{ margin: "0 0 0.4rem", lineHeight: 1.5 }}>{q.prompt}</p>
                          <ul style={{ paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                            {q.options.map((opt, oi) => (
                              <li key={oi} style={{
                                color: oi === q.correctIndex ? "#059669" : "var(--muted)",
                                fontWeight: oi === q.correctIndex ? 600 : 400,
                                fontSize: "0.92rem",
                              }}>
                                {opt}{oi === q.correctIndex && " ✓"}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              {/* Final Challenge */}
              <div className="value-card" style={{ padding: "1.75rem" }}>
                <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Final Challenge</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{result.finalChallenge}</p>
              </div>

            </div>
          )}
        </div>
      </section>
    </main>
  )
}

