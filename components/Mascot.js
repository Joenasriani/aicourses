"use client"

import { motion, AnimatePresence } from "framer-motion"

/** Thought-bubble SVG shown above the mascot during the "hint" state */
function ThoughtBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: 8 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "absolute",
        bottom: "100%",
        right: 0,
        marginBottom: 4,
        pointerEvents: "none",
      }}
    >
      <svg
        viewBox="0 0 76 56"
        width="76"
        height="56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Bubble tail dots */}
        <circle cx="60" cy="51" r="2.5" fill="white" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="52" cy="46" r="3.5" fill="white" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Main bubble */}
        <rect x="2" y="2" width="62" height="40" rx="13" fill="white" stroke="#94a3b8" strokeWidth="2" />
        {/* Question mark */}
        <text
          x="33"
          y="27"
          textAnchor="middle"
          fontSize="20"
          fill="#0B5FFF"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          ?
        </text>
      </svg>
    </motion.div>
  )
}

/** Modern geometric SVG mascot face whose expression changes with state */
function GeoBotSvg({ state }) {
  const isError = state === "error" || state === "confused"
  const showBlink = state === "idle" || state === "hint"

  const headColor = isError ? "#64748b" : "#0B5FFF"
  const faceColor = isError ? "#94a3b8" : "#3B82F6"
  const accentColor = isError ? "#475569" : "#1d4ed8"

  const mouthPath = isError
    ? "M 22 42 Q 32 37 42 42" // frown
    : "M 22 38 Q 32 44 42 38" // smile

  const blinkAnimate = showBlink ? { scaleY: [0, 1, 0] } : { scaleY: 0 }
  const blinkTransition = showBlink
    ? { duration: 0.2, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }
    : { duration: 0 }

  return (
    <svg
      viewBox="0 0 64 64"
      width="64"
      height="64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Geo-Bot mascot"
    >
      {/* Antenna stem */}
      <line x1="32" y1="5" x2="32" y2="13" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      {/* Antenna tip */}
      <circle cx="32" cy="3.5" r="3.5" fill={isError ? "#64748b" : "#0B5FFF"} />

      {/* Head */}
      <rect x="8" y="12" width="48" height="45" rx="13" fill={headColor} />
      {/* Side ear bolts */}
      <circle cx="8" cy="30" r="3" fill={accentColor} />
      <circle cx="56" cy="30" r="3" fill={accentColor} />

      {/* Face plate */}
      <rect x="13" y="17" width="38" height="34" rx="9" fill={faceColor} />

      {/* Left eye white */}
      <circle cx="22" cy="28" r="6.5" fill="white" />
      <circle cx="22" cy="28" r="3" fill="#1e3a5f" />
      <circle cx="23.5" cy="26.5" r="1.2" fill="white" />

      {/* Right eye white */}
      <circle cx="42" cy="28" r="6.5" fill="white" />
      <circle cx="42" cy="28" r="3" fill="#1e3a5f" />
      <circle cx="43.5" cy="26.5" r="1.2" fill="white" />

      {/* Left eyelid — animates closed then open for the blink effect */}
      <motion.rect
        x="15.5"
        y="21.5"
        width="13"
        height="13"
        rx="6.5"
        fill={faceColor}
        animate={blinkAnimate}
        transition={blinkTransition}
      />

      {/* Right eyelid — mirrors left */}
      <motion.rect
        x="35.5"
        y="21.5"
        width="13"
        height="13"
        rx="6.5"
        fill={faceColor}
        animate={blinkAnimate}
        transition={blinkTransition}
      />

      {/* Mouth */}
      <path d={mouthPath} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/** Per-state animation config for the outer wrapper */
const STATE_ANIM = {
  // Subtle 2 px float; eye-blink handled inside GeoBotSvg
  idle: {
    animate: { y: [0, -2, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  // Same float as idle; thought bubble added by the parent Mascot component
  hint: {
    animate: { y: [0, -2, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  // Quick upward bounce (backward-compat alias for success-lite feedback)
  happy: {
    animate: { y: [0, -14, 0, -7, 0] },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  // High-energy jump + full head spin
  success: {
    animate: { y: [0, -28, 0], rotate: [0, 360] },
    transition: { duration: 0.75, ease: "easeInOut" },
  },
  // Backward-compat alias — same high-energy animation as success
  celebrate: {
    animate: { y: [0, -28, 0], rotate: [0, 360] },
    transition: { duration: 0.75, ease: "easeInOut" },
  },
  // Side-to-side shake; dimmed colors handled inside GeoBotSvg
  error: {
    animate: { x: [-8, 8, -8, 8, -4, 4, 0] },
    transition: { duration: 0.5 },
  },
  // Backward-compat alias — same shake animation as error
  confused: {
    animate: { x: [-8, 8, -8, 8, -4, 4, 0] },
    transition: { duration: 0.5 },
  },
}

/**
 * Mascot — animated "Geo-Bot" character used for gamification feedback.
 * Place inside a `position: relative` container; the mascot anchors itself
 * to the bottom-right corner via absolute positioning.
 *
 * @param {"idle"|"hint"|"happy"|"success"|"celebrate"|"error"|"confused"} state
 */
export default function Mascot({ state = "idle" }) {
  const { animate, transition } = STATE_ANIM[state] ?? STATE_ANIM.idle
  const showBubble = state === "hint"

  return (
    <div className="mascot-overlay" aria-hidden="true">
      <AnimatePresence>
        {showBubble && <ThoughtBubble />}
      </AnimatePresence>
      {/* key={state} restarts the animation cleanly on every state transition */}
      <motion.div key={state} animate={animate} transition={transition}>
        <GeoBotSvg state={state} />
      </motion.div>
    </div>
  )
}
