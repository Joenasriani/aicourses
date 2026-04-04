"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
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
    <main style={{ background: "#ffffff", minHeight: "100vh", paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div className="container" style={{ maxWidth: "720px" }}>
        {/* Header */}
        <div className="section-head center" style={{ marginBottom: "2rem" }}>
          <p className="eyebrow">AI Professor</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}>Your Personal AI Professor</h1>
          <p className="hero-text" style={{ textAlign: "center", marginTop: "0.5rem" }}>
            Enter a topic and difficulty level — get a full structured course instantly.
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          padding: "2rem",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label htmlFor="topic" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", color: "#111827" }}>
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
              <label htmlFor="difficulty" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", color: "#111827" }}>
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
              style={{ height: "52px", fontSize: "1rem", gap: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" style={{ width: "1.25rem", height: "1.25rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating…
                </>
              ) : "Generate Course"}
            </button>
          </form>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center" }}>
            <span style={{ display: "inline-block", width: "1rem", height: "1rem", borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <p style={{ color: "var(--muted)", fontWeight: 500 }}>
              Professor is curating your custom curriculum...
            </p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div style={{ marginTop: "2.5rem" }}>
            <div style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              padding: "2rem",
              overflowX: "auto",
            }}>
              <div className="prose lg:prose-xl" style={{ maxWidth: "none" }}>
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "")
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg !mt-0 !mb-0"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

