"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useLearning } from "@/app/context/LearningContext"
import Mascot from "@/components/Mascot"
import { generateQuizQuestions } from "@/app/actions/quiz-engine"
import { getReinforcementExplanation } from "@/app/actions/ai-assistant"

/** Accent Blue — used for correct-answer highlight */
const ACCENT_BLUE = "#0B5FFF"

/** Minimum correct answers required to pass */
const PASS_THRESHOLD = 3

/** Failures before a reinforcement card is shown */
const REINFORCE_AT = 3

/** Module-level session cache: tracks used question prompts to avoid repeats */
const _sessionPrompts = new Map()

/** Human-readable labels for each question type */
const TYPE_LABELS = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  fix_the_prompt: "Fix the Prompt",
}

/**
 * QuizGate — presents a 3-question quiz that must be passed before the next
 * day unlocks. Integrates with LearningContext for persistence & mastery score.
 *
 * If `lessonContent` is provided the questions are generated dynamically via
 * the quiz-engine server action; otherwise the `questions` prop is used as-is.
 *
 * @param {string}    courseSlug     Course slug (for progress tracking)
 * @param {number}    dayIndex       Zero-based day index that was just completed
 * @param {Array}     [questions]    Optional static questions (fallback)
 * @param {string[]}  [lessonContent] Lesson texts used for dynamic generation
 * @param {string}    [dayTitle]     Day/module title (used in generation prompts)
 * @param {Function}  onPass         Called after a successful quiz submission
 */
export default function QuizGate({
  courseSlug,
  dayIndex,
  questions: staticQuestions,
  lessonContent,
  dayTitle,
  onPass,
}) {
  // ── Question loading ────────────────────────────────────────────────────
  const [questionsStatus, setQuestionsStatus] = useState("loading") // "loading"|"ready"|"error"
  const [currentQuestions, setCurrentQuestions] = useState([])
  const [loadError, setLoadError] = useState("")

  // ── Quiz interaction ────────────────────────────────────────────────────
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [shakeQuestion, setShakeQuestion] = useState(null)
  const [mascotState, setMascotState] = useState("idle")
  const mascotTimerRef = useRef(null)

  // ── Reinforcement card ─────────────────────────────────────────────────
  const [showReinforcement, setShowReinforcement] = useState(false)
  const [reinforcementText, setReinforcementText] = useState("")
  const [reinforcementLoading, setReinforcementLoading] = useState(false)
  const [reinforcementRead, setReinforcementRead] = useState(false)

  const { markDayComplete, recordQuizAttempt, getQuizFailures } = useLearning()

  // Clean up mascot timer on unmount
  useEffect(() => {
    return () => clearTimeout(mascotTimerRef.current)
  }, [])

  // Load (or set) questions on mount only.
  // Dependencies are intentionally omitted: the effect must run exactly once when
  // the quiz first appears. Re-running on prop changes would reset a quiz already
  // in progress. `lessonContent`, `dayTitle`, `staticQuestions`, `courseSlug` and
  // `dayIndex` are all stable for the lifetime of a single QuizGate instance.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false

    async function load() {
      // If lesson content is provided, generate fresh questions
      if (lessonContent && lessonContent.length > 0) {
        const sessionKey = `${courseSlug}:${dayIndex}`
        const used = _sessionPrompts.get(sessionKey) || []

        const result = await generateQuizQuestions(lessonContent, dayTitle, used)

        if (cancelled) return

        if (result.ok) {
          setCurrentQuestions(result.questions)
          // Cache the prompts to avoid repetition within the session
          const newPrompts = result.questions.map((q) => q.prompt)
          _sessionPrompts.set(sessionKey, [...used, ...newPrompts])
          setQuestionsStatus("ready")
        } else {
          // Fall back to static questions if generation fails
          if (staticQuestions?.length) {
            setCurrentQuestions(staticQuestions)
            setQuestionsStatus("ready")
          } else {
            setLoadError(result.error)
            setQuestionsStatus("error")
          }
        }
        return
      }

      // Use static questions directly
      if (staticQuestions?.length) {
        setCurrentQuestions(staticQuestions)
        setQuestionsStatus("ready")
        return
      }

      setLoadError("No questions available for this quiz.")
      setQuestionsStatus("error")
    }

    load()
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — intentional mount-only // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────────────

  function setMascotThenIdle(nextState, delay) {
    clearTimeout(mascotTimerRef.current)
    setMascotState(nextState)
    mascotTimerRef.current = setTimeout(() => setMascotState("idle"), delay)
  }

  function selectAnswer(qIndex, optIndex) {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))
    if (optIndex === currentQuestions[qIndex].correctIndex) {
      setMascotThenIdle("happy", 1200)
    } else {
      setMascotThenIdle("confused", 800)
    }
  }

  async function loadReinforcement() {
    setReinforcementLoading(true)
    const lessonText = Array.isArray(lessonContent)
      ? lessonContent.join("\n\n")
      : lessonContent || ""
    const result = await getReinforcementExplanation(lessonText, dayTitle)
    setReinforcementText(
      result.ok ? result.explanation : "Try re-reading the lesson cards above — focus on the key concepts before your next attempt.",
    )
    setReinforcementLoading(false)
  }

  function handleSubmit() {
    if (Object.keys(answers).length < currentQuestions.length) return

    const firstWrong = currentQuestions.findIndex((q, i) => answers[i] !== q.correctIndex)

    if (firstWrong !== -1) {
      // Wrong answer feedback
      setShakeQuestion(firstWrong)
      clearTimeout(mascotTimerRef.current)
      setMascotState("confused")
      mascotTimerRef.current = setTimeout(() => {
        setShakeQuestion(null)
        setMascotState("idle")
      }, 800)

      // Record failure; check if reinforcement card should appear
      const currentFailures = getQuizFailures(courseSlug, dayIndex)
      recordQuizAttempt(courseSlug, dayIndex, false)
      if (currentFailures + 1 >= REINFORCE_AT) {
        setShowReinforcement(true)
        loadReinforcement()
      }
      return
    }

    // ── All correct ─────────────────────────────────────────────────────
    setSubmitted(true)
    setMascotState("celebrate")
    markDayComplete(courseSlug, dayIndex, 50)
    recordQuizAttempt(courseSlug, dayIndex, true)
    onPass?.()
  }

  function handleRetryAfterReinforcement() {
    setShowReinforcement(false)
    setReinforcementRead(false)
    setReinforcementText("")
    setAnswers({})
    setSubmitted(false)
    setShakeQuestion(null)
    setMascotState("idle")
  }

  // ── Render: loading questions ────────────────────────────────────────────
  if (questionsStatus === "loading") {
    return (
      <div className="quiz-gate">
        <div className="quiz-loading">
          <span className="ai-spinner" aria-hidden="true" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <p>Generating your personalised quiz…</p>
        </div>
        <Mascot state="idle" />
      </div>
    )
  }

  // ── Render: error loading questions ─────────────────────────────────────
  if (questionsStatus === "error") {
    return (
      <div className="quiz-gate">
        <div className="quiz-gate-header">
          <h3>Day {dayIndex + 1} Quiz</h3>
          <p className="hero-text" style={{ color: "#b91c1c" }}>
            {loadError}
          </p>
        </div>
        <Mascot state="confused" />
      </div>
    )
  }

  // ── Render: reinforcement card ──────────────────────────────────────────
  if (showReinforcement) {
    return (
      <div className="quiz-gate">
        <div className="reinforcement-card">
          <h4>🧠 Let&apos;s try a different angle!</h4>
          <p>
            You&apos;ve missed this quiz a few times — no worries! Here&apos;s another way to think about
            it:
          </p>
          {reinforcementLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="ai-spinner" aria-hidden="true" />
              <span>Robo-Buddy is thinking…</span>
            </div>
          ) : (
            <p style={{ fontStyle: "italic" }}>{reinforcementText}</p>
          )}
          {!reinforcementLoading && (
            <label className="lesson-task" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={reinforcementRead}
                onChange={(e) => setReinforcementRead(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
              />
              <span>I&apos;ve read and understood this explanation</span>
            </label>
          )}
          {!reinforcementLoading && (
            <button
              className={`btn ${reinforcementRead ? "btn-primary" : "btn-locked"}`}
              disabled={!reinforcementRead}
              onClick={handleRetryAfterReinforcement}
            >
              Ready to retry →
            </button>
          )}
        </div>
        <Mascot state={mascotState} />
      </div>
    )
  }

  const allAnswered = Object.keys(answers).length === currentQuestions.length

  // ── Render: quiz ─────────────────────────────────────────────────────────
  return (
    <div className="quiz-gate">
      <div className="quiz-gate-header">
        <h3>Day {dayIndex + 1} Quiz</h3>
        <p className="hero-text">
          Answer all {PASS_THRESHOLD} questions correctly to unlock the next day.
        </p>
      </div>

      {currentQuestions.map((q, qi) => (
        <motion.div
          key={qi}
          animate={shakeQuestion === qi ? { x: [-10, 10, -10, 10, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="quiz-question"
        >
          {q.type && (
            <span className="quiz-type-badge">
              {TYPE_LABELS[q.type] ?? q.type}
            </span>
          )}
          <p className="quiz-prompt">
            <strong>Q{qi + 1}.</strong> {q.prompt}
          </p>
          <div className="quiz-options">
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi
              const isCorrect = submitted && oi === q.correctIndex
              const isWrong = submitted && isSelected && oi !== q.correctIndex

              return (
                <button
                  key={oi}
                  className={[
                    "quiz-option",
                    isSelected && !submitted ? "selected" : "",
                    isCorrect ? "correct" : "",
                    isWrong ? "wrong" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    isCorrect
                      ? { background: ACCENT_BLUE, color: "#fff", borderColor: ACCENT_BLUE }
                      : undefined
                  }
                  onClick={() => selectAnswer(qi, oi)}
                  disabled={submitted}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </motion.div>
      ))}

      {!submitted && (
        <button
          className="btn btn-primary"
          disabled={!allAnswered}
          onClick={handleSubmit}
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div className="quiz-result">🎉 You passed! +50 XP earned. Next day unlocked!</div>
      )}

      <Mascot state={mascotState} />
    </div>
  )
}

