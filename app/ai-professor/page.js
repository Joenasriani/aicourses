"use client"

import { useState } from "react"
import { generateCourse } from "../actions/ai-professor"

export default function AIProfessorPage() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setResult("")
    const content = await generateCourse(new FormData(e.target))
    setResult(content)
    setLoading(false)
  }

  return (
    <main>
      <div className="hero" style={{ paddingBottom: "24px" }}>
        <div className="container">
          <p className="eyebrow">Robomarket Academy · AI Professor</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3.2rem)" }}>Your personal<br />AI Professor</h1>
          <p className="hero-text">Enter a topic and difficulty level and let the AI Professor generate a full structured course for you — instantly.</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: "0" }}>
        <div className="container">
          <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "grid", gap: "6px" }}>
                <label htmlFor="topic" style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                  Course Topic
                </label>
                <input
                  id="topic"
                  name="topic"
                  type="text"
                  required
                  placeholder="e.g. Machine Learning, Prompt Engineering…"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: "6px" }}>
                <label htmlFor="difficulty" style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  defaultValue="Beginner"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "fit-content", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Generating…" : "Generate Course"}
              </button>
            </div>
          </form>

          {loading && (
            <div style={{ marginTop: "32px", color: "var(--muted)", fontSize: "0.95rem" }}>
              The AI Professor is preparing your lesson…
            </div>
          )}

          {result && !loading && (
            <div
              className="value-card"
              style={{
                marginTop: "32px",
                maxHeight: "70vh",
                overflowY: "auto",
                maxWidth: "800px",
              }}
            >
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  lineHeight: "1.7",
                  color: "var(--text)",
                }}
              >
                {result}
              </pre>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
