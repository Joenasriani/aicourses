"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useLearning } from "@/app/context/LearningContext"
import Mascot from "@/components/Mascot"

/** Robomarket Blue — used for correct-answer highlight */
const ROBOMARKET_BLUE = "#0B5FFF"

/** User must answer all questions correctly to pass */
const PASS_THRESHOLD = 3

/**
 * QuizGate — presents a 3-question quiz that must be passed before the next
 * day unlocks. Integrates with LearningContext to persist day completion & XP.
 *
 * @param {string}   courseSlug  Course slug (for progress tracking)
 * @param {number}   dayIndex    Zero-based day index that was just completed
 * @param {Array}    questions   [{prompt, options: string[], correctIndex}]
 * @param {Function} onPass      Called after a successful quiz submission
 */
export default function QuizGate({ courseSlug, dayIndex, questions, onPass }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  // Index of the question whose option row should shake (wrong answer feedback)
  const [shakeQuestion, setShakeQuestion] = useState(null)
  const [mascotState, setMascotState] = useState("idle")
  const mascotTimerRef = useRef(null)
  const { markDayComplete } = useLearning()

  // Clean up any pending mascot timer on unmount
  useEffect(() => {
    return () => clearTimeout(mascotTimerRef.current)
  }, [])

  function setMascotThenIdle(nextState, delay) {
    clearTimeout(mascotTimerRef.current)
    setMascotState(nextState)
    mascotTimerRef.current = setTimeout(() => setMascotState("idle"), delay)
  }

  function selectAnswer(qIndex, optIndex) {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))
    if (optIndex === questions[qIndex].correctIndex) {
      setMascotThenIdle("happy", 1200)
    } else {
      setMascotThenIdle("confused", 800)
    }
  }

  function handleSubmit() {
    if (Object.keys(answers).length < questions.length) return

    // Find the first wrong answer
    const firstWrong = questions.findIndex((q, i) => answers[i] !== q.correctIndex)
    if (firstWrong !== -1) {
      setShakeQuestion(firstWrong)
      clearTimeout(mascotTimerRef.current)
      setMascotState("confused")
      mascotTimerRef.current = setTimeout(() => {
        setShakeQuestion(null)
        setMascotState("idle")
      }, 800)
      return
    }

    // All correct — mark day complete and award XP
    setSubmitted(true)
    setMascotState("celebrate")
    markDayComplete(courseSlug, dayIndex, 50)
    onPass?.()
  }

  const allAnswered = Object.keys(answers).length === questions.length

  return (
    <div className="quiz-gate">
      <div className="quiz-gate-header">
        <h3>Day {dayIndex + 1} Quiz</h3>
        <p className="hero-text">
          Answer all {PASS_THRESHOLD} questions correctly to unlock the next day.
        </p>
      </div>

      {questions.map((q, qi) => (
        <motion.div
          key={qi}
          animate={shakeQuestion === qi ? { x: [-10, 10, -10, 10, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="quiz-question"
        >
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
                      ? { background: ROBOMARKET_BLUE, color: "#fff", borderColor: ROBOMARKET_BLUE }
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
        <div className="quiz-result">
          🎉 You passed! +50 XP earned. Next day unlocked!
        </div>
      )}

      <Mascot state={mascotState} />
    </div>
  )
}
