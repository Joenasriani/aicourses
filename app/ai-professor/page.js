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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">
            AI Professor
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            Your Personal AI Professor
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Enter a topic and difficulty level — get a full structured course instantly.
          </p>
        </div>

        {/* Glass card form */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="topic" className="block text-sm font-semibold text-slate-200">
                Course Topic
              </label>
              <input
                id="topic"
                name="topic"
                type="text"
                required
                placeholder="e.g. Machine Learning, Prompt Engineering…"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="difficulty" className="block text-sm font-semibold text-slate-200">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue="Beginner"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none"
              >
                <option value="Beginner" className="bg-slate-800">Beginner</option>
                <option value="Intermediate" className="bg-slate-800">Intermediate</option>
                <option value="Advanced" className="bg-slate-800">Advanced</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Generating…" : "Generate Course"}
            </button>
          </form>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="inline-block w-4 h-4 rounded-full bg-indigo-400 animate-pulse" />
            <p className="text-indigo-300 text-base font-medium animate-pulse">
              Professor is curating your custom curriculum...
            </p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="mt-10 animate-fade-slide-up">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 overflow-x-auto">
              <div className="prose prose-invert lg:prose-xl max-w-none">
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

