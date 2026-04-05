"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLearning } from "@/app/context/LearningContext"
import Mascot from "@/components/Mascot"
import AIAssistant from "@/components/AIAssistant"

/**
 * LessonCard — swipeable card deck for a single course day.
 *
 * @param {string}   courseSlug  Unique course slug (used for progress tracking)
 * @param {number}   dayIndex    Zero-based day index
 * @param {Array}    cards       Array of { title, content, task? } objects
 * @param {Function} onAllComplete  Called when the final card is advanced past
 */
export default function LessonCard({ courseSlug, dayIndex, cards, onAllComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [canAdvance, setCanAdvance] = useState(false)
  const [taskDone, setTaskDone] = useState(false)
  const [mascotState, setMascotState] = useState("idle")
  const celebrateTimerRef = useRef(null)
  const taskTimerRef = useRef(null)
  const { markCardComplete, isCardComplete } = useLearning()

  const card = cards[currentIndex]

  // Clean up any pending mascot timers when the component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(celebrateTimerRef.current)
      clearTimeout(taskTimerRef.current)
    }
  }, [])

  // Reset unlock timer whenever the active card changes
  useEffect(() => {
    setCanAdvance(false)
    setTaskDone(false)

    // Cards the user already finished can be advanced past immediately
    if (isCardComplete(courseSlug, dayIndex, currentIndex)) {
      setCanAdvance(true)
      return
    }

    // Lock "Next" for 3 seconds so the user has time to read
    const timer = setTimeout(() => setCanAdvance(true), 3000)
    return () => clearTimeout(timer)
  }, [currentIndex, courseSlug, dayIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  function advance(dir = 1) {
    if (!canAdvance) return
    markCardComplete(courseSlug, dayIndex, currentIndex)
    const next = currentIndex + dir
    if (next >= cards.length) {
      // Show celebrate animation briefly before handing off to parent
      setMascotState("celebrate")
      celebrateTimerRef.current = setTimeout(() => onAllComplete?.(), 800)
      return
    }
    setDirection(dir)
    setCurrentIndex(next)
  }

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 320 : -320, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -320 : 320, opacity: 0 }),
  }

  if (!card) return null

  return (
    <div className="lesson-card-wrapper">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_e, info) => {
            if (info.offset.x < -80) advance(1)
            else if (info.offset.x > 80 && currentIndex > 0) advance(-1)
          }}
          className="lesson-card"
        >
          <div className="lesson-card-counter">
            {currentIndex + 1} / {cards.length}
          </div>

          <h3 className="lesson-card-title">{card.title}</h3>
          <p className="lesson-card-body">{card.content}</p>

          <AIAssistant lessonTitle={card.title} lessonContent={card.content} />

          {card.task && (
            <label className="lesson-task">
              <input
                type="checkbox"
                checked={taskDone}
                onChange={(e) => {
                  setTaskDone(e.target.checked)
                  if (e.target.checked) {
                    setCanAdvance(true)
                    setMascotState("happy")
                    clearTimeout(taskTimerRef.current)
                    taskTimerRef.current = setTimeout(() => setMascotState("idle"), 1500)
                  }
                }}
              />
              <span>{card.task}</span>
            </label>
          )}

          <Mascot state={mascotState} />
        </motion.div>
      </AnimatePresence>

      <div className="lesson-card-actions">
        <button
          className={`btn ${canAdvance ? "btn-primary" : "btn-locked"}`}
          disabled={!canAdvance}
          onClick={() => advance(1)}
          title={canAdvance ? undefined : "Wait 3 seconds or complete the task above"}
        >
          {canAdvance
            ? currentIndex === cards.length - 1
              ? "Complete Day →"
              : "Next →"
            : "Unlocking…"}
        </button>
        <span className="lesson-card-hint">
          {canAdvance ? "Swipe left or tap Next" : "Read the card to unlock Next"}
        </span>
      </div>
    </div>
  )
}
