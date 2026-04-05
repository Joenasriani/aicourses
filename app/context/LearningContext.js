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
 *   }
 * }
 */

const STORAGE_KEY = "robomarket_learning_progress"

const defaultState = {
  xp: 0,
  completedCards: [],
  dayStatus: {},
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

  /** Mark a single card as complete. */
  function markCardComplete(courseSlug, dayIndex, cardIndex) {
    const id = `${courseSlug}:${dayIndex}:${cardIndex}`
    setState((prev) => ({
      ...prev,
      completedCards: prev.completedCards.includes(id)
        ? prev.completedCards
        : [...prev.completedCards, id],
    }))
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
