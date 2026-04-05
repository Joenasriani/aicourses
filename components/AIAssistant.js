"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getELI5Explanation } from "@/app/actions/ai-assistant"

/**
 * AIAssistant — adds an "Explain Simply" button to lesson cards.
 *
 * Sends the current lesson text to OpenRouter (via server action) and
 * renders a 2-sentence ELI5 in Robo-Buddy's speech bubble.
 *
 * @param {string} lessonTitle   - The card title (used as fallback)
 * @param {string} lessonContent - The card body text to explain
 */
export default function AIAssistant({ lessonTitle, lessonContent }) {
  const [status, setStatus] = useState("idle") // "idle" | "loading" | "done" | "error"
  const [explanation, setExplanation] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleExplain() {
    if (status === "loading") return
    setStatus("loading")
    setExplanation("")
    setErrorMsg("")

    const text = (lessonContent || lessonTitle || "").trim()
    const result = await getELI5Explanation(text)

    if (result.ok) {
      setExplanation(result.explanation)
      setStatus("done")
    } else {
      setErrorMsg(result.error)
      setStatus("error")
    }
  }

  return (
    <div className="ai-assistant">
      <button
        className={`ai-assistant-btn${status === "loading" ? " loading" : ""}`}
        onClick={handleExplain}
        disabled={status === "loading"}
        title="Ask Robo-Buddy to explain this simply"
        aria-label="Explain Simply"
      >
        {status === "loading" ? (
          <span className="ai-spinner" aria-hidden="true" />
        ) : (
          "💡 Explain Simply"
        )}
      </button>

      <AnimatePresence>
        {(status === "done" || status === "error") && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`ai-bubble${status === "error" ? " error" : ""}`}
            role="status"
          >
            <div className="ai-bubble-label">
              {status === "error" ? "⚠️ Robo-Buddy says:" : "🤖 Robo-Buddy says:"}
            </div>
            <p className="ai-bubble-text">
              {status === "error" ? errorMsg : explanation}
            </p>
            <button
              className="ai-bubble-close"
              onClick={() => setStatus("idle")}
              aria-label="Close explanation"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
