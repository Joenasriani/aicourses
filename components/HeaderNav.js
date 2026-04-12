"use client"

import { useState } from "react"
import { useLearning } from "@/app/context/LearningContext"

/** XP thresholds per level (cumulative) */
const LEVELS = [
  { level: 1, min: 0,    label: "Novice" },
  { level: 2, min: 100,  label: "Learner" },
  { level: 3, min: 250,  label: "Explorer" },
  { level: 4, min: 500,  label: "Practitioner" },
  { level: 5, min: 1000, label: "Master" },
]

function getLevel(xp) {
  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.min) current = l
  }
  return current
}

/**
 * HeaderNav — responsive navigation bar with XP badge, level, streak, and
 * a hamburger menu for mobile screens.
 */
export default function HeaderNav() {
  const { xp, streakDays, hydrated } = useLearning()
  const [menuOpen, setMenuOpen] = useState(false)

  const lvl = getLevel(xp)

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          {/* Brand */}
          <a href="/" className="brand">
            <span className="brand-title">AI Academy</span>
            <span className="brand-subtitle">by Apex Innovate</span>
          </a>

          {/* Desktop nav */}
          <nav className="site-nav desktop-nav">
            <a href="/courses" className="nav-link">Courses</a>
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/ai-professor" className="nav-link">AI Professor</a>
          </nav>

          {/* XP / Streak badge — only shown after hydration */}
          {hydrated && (
            <div className="header-xp-group">
              {streakDays > 0 && (
                <span className="streak-badge" title={`${streakDays}-day streak`}>
                  🔥 {streakDays}
                </span>
              )}
              <a href="/dashboard" className="xp-badge" title={`Level ${lvl.level} — ${lvl.label}`}>
                <span className="xp-badge-level">L{lvl.level}</span>
                <span className="xp-badge-xp">{xp} XP</span>
              </a>
            </div>
          )}

          {/* Hamburger (mobile) */}
          <button
            className="hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={`hamburger-bar${menuOpen ? " open" : ""}`} />
            <span className={`hamburger-bar${menuOpen ? " open" : ""}`} />
            <span className={`hamburger-bar${menuOpen ? " open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="mobile-nav" onClick={() => setMenuOpen(false)}>
          <a href="/courses" className="mobile-nav-link">Courses</a>
          <a href="/dashboard" className="mobile-nav-link">Dashboard</a>
          <a href="/ai-professor" className="mobile-nav-link">AI Professor</a>
          {hydrated && (
            <div className="mobile-nav-xp">
              {streakDays > 1 && <span>🔥 {streakDays}-day streak</span>}
              <span>Level {lvl.level} · {xp} XP</span>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
