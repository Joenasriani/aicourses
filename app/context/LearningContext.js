"use client"

import { createContext, useContext, useState, useEffect } from "react"

/**
 * LearningContext — tracks user progress across all courses.
 *
 * State structure:
 * {
 *   xp: number,                            // Total XP earned
 *   completedCards: string[],              // "courseSlug:dayIndex:cardIndex" ids
 *   dayStatus: {                           // Per-course day unlock status
 *     [courseSlug]: {
 *       [dayIndex]: "locked" | "unlocked" | "completed"
 *     }
 *   },
 *   quizAttempts: {                        // Per-day quiz attempt history
 *     ["courseSlug:dayIndex"]: {
 *       attempts: number,                  // Total submit attempts
 *       failures: number,                  // Number of failed attempts
 *       passed: boolean                    // Whether the quiz has been passed
 *     }
 *   }
 * }
 */

const STORAGE_KEY = "robomarket_learning_progress"

const defaultState = {
  xp: 0,
  completedCards: [],
  dayStatus: {},
  quizAttempts: {},
  streakDays: 0,
  lastActiveDate: null, // ISO "YYYY-MM-DD"
  coursePositions: {}, // { [courseSlug]: dayIndex }
}

const LearningContext = createContext(null)

export function LearningProvider({ children }) {
  const [state, setState] = useState(defaultState)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage after mount (client-side only — safe for SSR)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setState({ ...defaultState, ...parsed })
      }
    } catch {
      // Ignore parse errors; fall back to defaults
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever state changes (only after initial hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore storage write errors
    }
  }, [state, hydrated])

  /** Return today's date as "YYYY-MM-DD" (local time) */
  function todayISO() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  /** Update streak: call on any learning activity. */
  function touchStreak() {
    const today = todayISO()
    setState((prev) => {
      if (prev.lastActiveDate === today) return prev // already updated today
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yISO = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`
      const consecutive = prev.lastActiveDate === yISO
      return {
        ...prev,
        lastActiveDate: today,
        streakDays: consecutive ? prev.streakDays + 1 : 1,
      }
    })
  }

  /** Mark a single card as complete. */
  function markCardComplete(courseSlug, dayIndex, cardIndex) {
    const id = `${courseSlug}:${dayIndex}:${cardIndex}`
    touchStreak()
    setState((prev) => ({
      ...prev,
      completedCards: prev.completedCards.includes(id)
        ? prev.completedCards
        : [...prev.completedCards, id],
    }))
  }

  /** Save the learner's current day position within a course (for resume). */
  function saveCoursePosition(courseSlug, dayIndex) {
    setState((prev) => ({
      ...prev,
      coursePositions: { ...prev.coursePositions, [courseSlug]: dayIndex },
    }))
  }

  /** Get the saved day position for a course (defaults to 0). */
  function getCoursePosition(courseSlug) {
    return state.coursePositions?.[courseSlug] ?? 0
  }

  /** Mark an entire day as completed, award XP, and unlock the next day. */
  function markDayComplete(courseSlug, dayIndex, xpReward = 50) {
    setState((prev) => {
      const courseStatus = prev.dayStatus[courseSlug] || {}
      return {
        ...prev,
        xp: prev.xp + xpReward,
        dayStatus: {
          ...prev.dayStatus,
          [courseSlug]: {
            ...courseStatus,
            [dayIndex]: "completed",
            [dayIndex + 1]: "unlocked",
          },
        },
      }
    })
  }

  /** Return "locked" | "unlocked" | "completed" for a specific day. Day 0 is unlocked by default. */
  function getDayStatus(courseSlug, dayIndex) {
    const courseStatus = state.dayStatus[courseSlug]
    if (!courseStatus) return dayIndex === 0 ? "unlocked" : "locked"
    return courseStatus[dayIndex] ?? (dayIndex === 0 ? "unlocked" : "locked")
  }

  /** Check whether a specific card has already been completed. */
  function isCardComplete(courseSlug, dayIndex, cardIndex) {
    return state.completedCards.includes(`${courseSlug}:${dayIndex}:${cardIndex}`)
  }

  /** Count how many cards have been completed for a given day. */
  function getCompletedCardCount(courseSlug, dayIndex) {
    const prefix = `${courseSlug}:${dayIndex}:`
    return state.completedCards.filter((id) => id.startsWith(prefix)).length
  }

  /**
   * Record a quiz attempt (pass or fail) for a specific day.
   * Persisted in state so failures survive page refreshes.
   */
  function recordQuizAttempt(courseSlug, dayIndex, passed) {
    const key = `${courseSlug}:${dayIndex}`
    setState((prev) => {
      const existing = prev.quizAttempts[key] || { attempts: 0, failures: 0, passed: false }
      return {
        ...prev,
        quizAttempts: {
          ...prev.quizAttempts,
          [key]: {
            attempts: existing.attempts + 1,
            failures: passed ? existing.failures : existing.failures + 1,
            passed: existing.passed || passed,
          },
        },
      }
    })
  }

  /** Return the number of quiz failures for a specific day (0 if never attempted). */
  function getQuizFailures(courseSlug, dayIndex) {
    return state.quizAttempts[`${courseSlug}:${dayIndex}`]?.failures ?? 0
  }

  /**
   * Calculate mastery score (0–100%) for a course.
   *
   * Formula: for each day in the course, the per-day score is:
   *   - passed on 1st try  → 100 pts
   *   - passed on 2nd try  →  80 pts  (1 failure)
   *   - passed on 3rd try  →  60 pts  (2 failures)
   *   - passed on 4th+ try →  min 20 pts
   *   - not yet passed     →   0 pts
   * masteryScore = (sum of per-day scores) / (totalDays × 100) × 100
   *
   * @param {string} courseSlug
   * @param {number} totalDays  - Total number of days in the course
   */
  function getMasteryScore(courseSlug, totalDays) {
    if (!totalDays) return 0
    let scoreSum = 0
    for (let di = 0; di < totalDays; di++) {
      const entry = state.quizAttempts[`${courseSlug}:${di}`]
      if (entry?.passed) {
        // Each failure deducts 20 pts (first failure → 80, second → 60 …).
        // Floor at 20 so persistent learners always earn at least some credit.
        scoreSum += Math.max(20, 100 - entry.failures * 20)
      }
    }
    return Math.round((scoreSum / (totalDays * 100)) * 100)
  }

  return (
    <LearningContext.Provider
      value={{
        ...state,
        hydrated,
        markCardComplete,
        markDayComplete,
        getDayStatus,
        isCardComplete,
        getCompletedCardCount,
        recordQuizAttempt,
        getQuizFailures,
        getMasteryScore,
        saveCoursePosition,
        getCoursePosition,
      }}
    >
      {children}
    </LearningContext.Provider>
  )
}

export function useLearning() {
  const ctx = useContext(LearningContext)
  if (!ctx) throw new Error("useLearning must be used within a LearningProvider")
  return ctx
}
