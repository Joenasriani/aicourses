"use client"

import { useLearning } from "@/app/context/LearningContext"

/**
 * XPBadge — shows the user's current XP total.
 * Rendered client-side so it can read from LearningContext.
 */
export default function XPBadge() {
  const { xp, hydrated } = useLearning()

  if (!hydrated || xp === 0) return null

  return (
    <span className="xp-badge" aria-label={`${xp} XP earned`}>
      ⚡ {xp} XP
    </span>
  )
}
