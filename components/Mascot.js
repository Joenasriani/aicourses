"use client"

import { motion } from "framer-motion"

/** SVG robot face whose expression changes to match the current state */
function RoboBuddySvg({ state }) {
  const mouthPath =
    state === "confused"
      ? "M 22 42 Q 32 37 42 42" // frown
      : "M 22 38 Q 32 44 42 38" // smile

  return (
    <svg
      viewBox="0 0 64 64"
      width="64"
      height="64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Robo-Buddy mascot"
    >
      {/* Antenna */}
      <line x1="32" y1="5" x2="32" y2="13" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="3.5" r="3.5" fill="#0B5FFF" />

      {/* Head */}
      <rect x="8" y="12" width="48" height="45" rx="13" fill="#0B5FFF" />

      {/* Face plate */}
      <rect x="13" y="17" width="38" height="34" rx="9" fill="#3B82F6" />

      {/* Left eye */}
      <circle cx="22" cy="28" r="6.5" fill="white" />
      <circle cx="22" cy="28" r="3" fill="#1e3a5f" />
      <circle cx="23.5" cy="26.5" r="1.2" fill="white" />

      {/* Right eye */}
      <circle cx="42" cy="28" r="6.5" fill="white" />
      <circle cx="42" cy="28" r="3" fill="#1e3a5f" />
      <circle cx="43.5" cy="26.5" r="1.2" fill="white" />

      {/* Mouth */}
      <path d={mouthPath} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/** Per-state animation config */
const STATE_ANIM = {
  idle: {
    animate: { y: [0, -6, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    animate: { y: [0, -14, 0, -7, 0] },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  confused: {
    animate: { rotate: [-8, 8, -8, 8, 0] },
    transition: { duration: 0.5 },
  },
  celebrate: {
    animate: { rotate: [0, 360], scale: [1, 1.25, 1] },
    transition: { duration: 0.75, ease: "easeInOut" },
  },
}

/**
 * Mascot — animated "Robo-Buddy" character used for gamification feedback.
 * Place inside a `position: relative` container; the mascot anchors itself
 * to the bottom-right corner via absolute positioning.
 *
 * @param {"idle"|"happy"|"confused"|"celebrate"} state
 */
export default function Mascot({ state = "idle" }) {
  const { animate, transition } = STATE_ANIM[state] ?? STATE_ANIM.idle

  return (
    <div className="mascot-overlay" aria-hidden="true">
      {/* key={state} restarts the animation cleanly on every state transition */}
      <motion.div key={state} animate={animate} transition={transition}>
        <RoboBuddySvg state={state} />
      </motion.div>
    </div>
  )
}
