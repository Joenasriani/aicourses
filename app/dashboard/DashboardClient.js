"use client"

import { useLearning } from "@/app/context/LearningContext"
import ProgressBar from "@/components/ProgressBar"
import courseImages from "@/content/courseImages"
import Image from "next/image"

/** XP level thresholds */
const LEVELS = [
  { level: 1, min: 0,    max: 99,   label: "Novice",       color: "#6b7280" },
  { level: 2, min: 100,  max: 249,  label: "Learner",      color: "#3b82f6" },
  { level: 3, min: 250,  max: 499,  label: "Explorer",     color: "#8b5cf6" },
  { level: 4, min: 500,  max: 999,  label: "Practitioner", color: "#f59e0b" },
  { level: 5, min: 1000, max: Infinity, label: "Master",   color: "#059669" },
]

function getLevel(xp) {
  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.min) current = l
  }
  return current
}

function xpProgressToNextLevel(xp) {
  const lvl = getLevel(xp)
  const next = LEVELS.find((l) => l.level === lvl.level + 1)
  if (!next) return 100 // max level
  const range = next.min - lvl.min
  const earned = xp - lvl.min
  return Math.min(100, Math.round((earned / range) * 100))
}

/**
 * DashboardClient — displays XP, level, streak, and per-course progress.
 * Reads progress from LearningContext (localStorage).
 */
export default function DashboardClient({ courses }) {
  const {
    xp,
    streakDays,
    hydrated,
    getDayStatus,
    getCompletedCardCount,
    getMasteryScore,
    getCoursePosition,
  } = useLearning()

  if (!hydrated) {
    return (
      <main>
        <div className="hero">
          <div className="container">
            <p className="eyebrow">Dashboard</p>
            <h1>Loading…</h1>
          </div>
        </div>
      </main>
    )
  }

  const lvl = getLevel(xp)
  const xpPct = xpProgressToNextLevel(xp)
  const nextLvl = LEVELS.find((l) => l.level === lvl.level + 1)

  // Build per-course stats
  const courseStats = courses.map((course) => {
    const days = course.modules || []
    const totalCards = days.reduce((s, m) => s + (m.lessons?.length || 0), 0)
    const completedCards = days.reduce(
      (s, _, di) => s + getCompletedCardCount(course.slug, di),
      0
    )
    const completedDays = days.filter((_, di) => getDayStatus(course.slug, di) === "completed").length
    const mastery = getMasteryScore(course.slug, days.length)
    const resumeDay = getCoursePosition(course.slug)
    const isStarted = completedCards > 0
    const isCompleted = completedDays === days.length && days.length > 0
    return { course, totalCards, completedCards, completedDays, mastery, resumeDay, isStarted, isCompleted }
  })

  const activeCourses = courseStats.filter((s) => s.isStarted && !s.isCompleted)
  const completedCourses = courseStats.filter((s) => s.isCompleted)
  const notStarted = courseStats.filter((s) => !s.isStarted)

  return (
    <main>
      <div className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <p className="eyebrow">My Learning</p>
              <h1>Dashboard</h1>
              <p className="hero-text">Track your progress, XP, and achievements.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="container">

          {/* ── Stats row ── */}
          <div className="dashboard-stats">
            {/* XP / Level card */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon" style={{ background: lvl.color + "22", color: lvl.color }}>
                ⭐
              </div>
              <div className="dashboard-stat-body">
                <p className="dashboard-stat-label">Level {lvl.level} · {lvl.label}</p>
                <p className="dashboard-stat-value">{xp} XP</p>
                {nextLvl && (
                  <div style={{ marginTop: 8 }}>
                    <div className="progress-bar-track" style={{ height: 6 }}>
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${xpPct}%`, background: lvl.color }}
                      />
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                      {nextLvl.min - xp} XP to Level {nextLvl.level}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Streak card */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
                🔥
              </div>
              <div className="dashboard-stat-body">
                <p className="dashboard-stat-label">Learning Streak</p>
                <p className="dashboard-stat-value">
                  {streakDays > 0 ? `${streakDays} day${streakDays !== 1 ? "s" : ""}` : "Not started"}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                  {streakDays > 0 ? "Keep it up! Come back tomorrow." : "Complete a lesson to start your streak."}
                </p>
              </div>
            </div>

            {/* Courses completed card */}
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                🏆
              </div>
              <div className="dashboard-stat-body">
                <p className="dashboard-stat-label">Courses Completed</p>
                <p className="dashboard-stat-value">{completedCourses.length}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                  {activeCourses.length} in progress · {notStarted.length} not started
                </p>
              </div>
            </div>
          </div>

          {/* ── Active / In-Progress ── */}
          {activeCourses.length > 0 && (
            <div className="dashboard-section">
              <div className="section-head">
                <h2>Continue Learning</h2>
              </div>
              <div className="dashboard-course-list">
                {activeCourses.map(({ course, totalCards, completedCards, completedDays, mastery, resumeDay }) => (
                  <CourseProgressCard
                    key={course.slug}
                    course={course}
                    totalCards={totalCards}
                    completedCards={completedCards}
                    completedDays={completedDays}
                    mastery={mastery}
                    resumeDay={resumeDay}
                    variant="active"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Completed ── */}
          {completedCourses.length > 0 && (
            <div className="dashboard-section">
              <div className="section-head">
                <h2>Completed Courses</h2>
              </div>
              <div className="dashboard-course-list">
                {completedCourses.map(({ course, totalCards, completedCards, mastery }) => (
                  <CourseProgressCard
                    key={course.slug}
                    course={course}
                    totalCards={totalCards}
                    completedCards={completedCards}
                    completedDays={(course.modules || []).length}
                    mastery={mastery}
                    resumeDay={0}
                    variant="completed"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Not started ── */}
          {notStarted.length > 0 && (
            <div className="dashboard-section">
              <div className="section-head">
                <h2>Available Courses</h2>
              </div>
              <div className="dashboard-course-list">
                {notStarted.map(({ course }) => (
                  <CourseProgressCard
                    key={course.slug}
                    course={course}
                    totalCards={(course.modules || []).reduce((s, m) => s + (m.lessons?.length || 0), 0)}
                    completedCards={0}
                    completedDays={0}
                    mastery={0}
                    resumeDay={0}
                    variant="new"
                  />
                ))}
              </div>
            </div>
          )}

          {courseStats.length === 0 && (
            <div className="empty-state">
              <p>No courses found. <a href="/courses" className="btn btn-primary" style={{ display: "inline-block", marginTop: 12 }}>Browse Courses</a></p>
            </div>
          )}

        </div>
      </section>
    </main>
  )
}

function CourseProgressCard({ course, totalCards, completedCards, completedDays, mastery, resumeDay, variant }) {
  const imageSrc = courseImages[course.slug]
  const pct = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0
  const totalDays = (course.modules || []).length
  const href = `/courses/${encodeURIComponent(course.slug)}`

  return (
    <div className={`dashboard-course-card${variant === "completed" ? " completed" : ""}`}>
      {imageSrc && (
        <a href={href} className="dashboard-course-img-wrap">
          <Image
            src={imageSrc}
            alt={course.title}
            width={120}
            height={68}
            className="dashboard-course-img"
          />
        </a>
      )}
      <div className="dashboard-course-info">
        <a href={href} className="dashboard-course-title">{course.title}</a>
        <div className="dashboard-course-meta">
          <span>{completedDays}/{totalDays} days</span>
          {mastery > 0 && <span>🏆 {mastery}% mastery</span>}
          {course.price_aed === 0 ? <span className="pill pill-muted">Free</span> : null}
        </div>
        {variant !== "new" && (
          <div style={{ marginTop: 8 }}>
            <ProgressBar completed={completedCards} total={totalCards} />
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>{pct}% complete</p>
          </div>
        )}
      </div>
      <div className="dashboard-course-action">
        {variant === "active" && (
          <a href={href} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
            Resume →
          </a>
        )}
        {variant === "completed" && (
          <a href={href} className="btn btn-secondary" style={{ whiteSpace: "nowrap" }}>
            Review
          </a>
        )}
        {variant === "new" && (
          <a href={href} className="btn btn-secondary" style={{ whiteSpace: "nowrap" }}>
            Start →
          </a>
        )}
      </div>
    </div>
  )
}
