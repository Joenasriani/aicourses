"use client"

import { useState, useEffect } from "react"
import { useLearning } from "@/app/context/LearningContext"
import LessonCard from "@/components/LessonCard"
import QuizGate from "@/components/QuizGate"
import ProgressBar from "@/components/ProgressBar"

/**
 * Default quiz questions used when a static course.json has no quiz data.
 * Questions are generated from the module title so they stay contextual.
 */
function getDefaultQuiz(moduleTitle) {
  return [
    {
      prompt: `What is the main focus of the "${moduleTitle}" module?`,
      options: [
        "Practical application and daily use",
        "Abstract theory with no real-world relevance",
        "Memorising technical jargon",
      ],
      correctIndex: 0,
    },
    {
      prompt: "What is the key benefit of learning with AI Academy?",
      options: [
        "Expensive certifications",
        "Real, immediately applicable AI skills",
        "Reading academic papers only",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Which approach accelerates learning new AI skills the most?",
      options: [
        "Wait until you are an expert before trying",
        "Only watch videos",
        "Practice with small real tasks right away",
      ],
      correctIndex: 2,
    },
  ]
}

/**
 * CourseClient — client-side interactive course view.
 * Renders a two-column layout: left sidebar (course outline) + right main area
 * (sticky progress header + lesson cards / quiz gate).
 *
 * @param {{ slug: string, title: string, modules: Array, quizzes?: Object }} course
 */
export default function CourseClient({ course }) {
  const { getDayStatus, getCompletedCardCount, getMasteryScore, getCoursePosition, saveCoursePosition, hydrated } = useLearning()
  const [currentDay, setCurrentDay] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const days = course.modules || []

  // Restore saved position after localStorage has hydrated
  useEffect(() => {
    if (!hydrated) return
    const saved = getCoursePosition(course.slug)
    if (saved > 0 && saved < days.length) {
      setCurrentDay(saved)
    }
  }, [hydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  const day = days[currentDay]

  // Build card objects from the flat lessons array of the active module
  const cards = (day?.lessons || []).map((lesson, i) => ({
    title: `Lesson ${i + 1}`,
    content: lesson,
    // Attach mini_task only to the last card of the day
    task: i === (day?.lessons?.length ?? 0) - 1 ? day?.mini_task ?? null : null,
  }))

  // Overall progress across all days
  const totalCards = days.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
  const completedCount = days.reduce(
    (sum, _, di) => sum + getCompletedCardCount(course.slug, di),
    0
  )
  const progressPct = totalCards > 0 ? Math.round((completedCount / totalCards) * 100) : 0

  const masteryScore = getMasteryScore(course.slug, days.length)

  const dayStatus = getDayStatus(course.slug, currentDay)

  // Use quizzes from AI-generated data (keyed 1-based) or fall back to defaults
  const quizQuestions =
    course.quizzes?.[currentDay + 1] ?? getDefaultQuiz(day?.title ?? "this module")

  function switchDay(di) {
    setCurrentDay(di)
    setShowQuiz(false)
    saveCoursePosition(course.slug, di)
    setSidebarOpen(false)
  }

  if (!day) return null

  return (
    <div>
      {/* ── Sticky course header ──────────────────────────────────────── */}
      <div className="course-sticky-header">
        <div className="container">
          <div className="course-sticky-inner">
            <span className="course-sticky-title">
              {course.title || "Course"}
            </span>

            <div className="course-sticky-progress">
              <div className="course-sticky-bar">
                <ProgressBar completed={completedCount} total={totalCards} />
              </div>
              <span className="course-sticky-pct">{progressPct}%</span>
              {masteryScore > 0 && (
                <span className="mastery-score">
                  🏆 <span className="mastery-score-value">{masteryScore}%</span>
                </span>
              )}
            </div>

            <div className="course-sticky-actions">
              {/* Mobile sidebar toggle */}
              <button
                className="btn-nav sidebar-toggle"
                onClick={() => setSidebarOpen((o) => !o)}
                title={sidebarOpen ? "Hide outline" : "Show outline"}
                aria-expanded={sidebarOpen}
                aria-label="Toggle course outline"
              >
                {sidebarOpen ? "✕ Outline" : "☰ Outline"}
              </button>
              <button
                className="btn-nav"
                disabled={currentDay === 0}
                onClick={() => switchDay(currentDay - 1)}
                title="Previous day"
              >
                ← Prev
              </button>
              <button
                className="btn-nav"
                disabled={currentDay >= days.length - 1 || getDayStatus(course.slug, currentDay + 1) === "locked"}
                onClick={() => switchDay(currentDay + 1)}
                title="Next day"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main two-column layout ────────────────────────────────────── */}
      <div className="course-layout">
        {/* ── Left Sidebar — Course Outline ── */}
        <aside className={`course-sidebar${sidebarOpen ? " sidebar-mobile-open" : ""}`}>
          <div className="course-sidebar-header">
            <p className="course-sidebar-title">Course outline</p>
            <div className="course-sidebar-progress">
              <div style={{ flex: 1 }}>
                <ProgressBar completed={completedCount} total={totalCards} />
              </div>
              <span>{completedCount}/{totalCards}</span>
            </div>
          </div>
          <nav className="course-sidebar-nav" aria-label="Course modules">
            {days.map((m, di) => {
              const st = getDayStatus(course.slug, di)
              const dayCompleted = st === "completed"
              const dayLocked = st === "locked"
              return (
                <button
                  key={di}
                  disabled={dayLocked}
                  className={`sidebar-day-btn${currentDay === di ? " active" : ""}${dayCompleted ? " completed" : ""}`}
                  onClick={() => switchDay(di)}
                >
                  <span className="sidebar-day-num">{di + 1}</span>
                  <span className="sidebar-day-label">
                    {m.title || `Day ${di + 1}`}
                  </span>
                  <span className="sidebar-day-status">
                    {dayLocked ? "🔒" : dayCompleted ? "✓" : null}
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* ── Right Main content ── */}
        <div>
          {dayStatus === "locked" ? (
            <div className="module-card locked-day">
              <p className="locked-icon">🔒</p>
              <p>Complete the previous day&apos;s quiz to unlock this day.</p>
            </div>
          ) : showQuiz ? (
            <QuizGate
              courseSlug={course.slug}
              dayIndex={currentDay}
              questions={quizQuestions}
              lessonContent={cards.map((c) => c.content)}
              dayTitle={day?.title}
              onPass={() => {
                setShowQuiz(false)
                // Advance to next unlocked day, if available
                if (currentDay + 1 < days.length) switchDay(currentDay + 1)
              }}
            />
          ) : (
            <div className="module-card">
              <div className="section-head">
                <h3>
                  Day {currentDay + 1}: {day.title}
                </h3>
              </div>
              <LessonCard
                courseSlug={course.slug}
                dayIndex={currentDay}
                cards={cards}
                onAllComplete={() => setShowQuiz(true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
