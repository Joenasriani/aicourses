"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'
import courseImages from '@/content/courseImages'
import { useLearning } from '@/app/context/LearningContext'

const LEVEL_STYLES = {
  Beginner: {
    bg: 'rgba(59, 130, 246, 0.12)',
    color: '#60A5FA',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  Intermediate: {
    bg: 'rgba(52, 211, 153, 0.1)',
    color: '#34D399',
    border: 'rgba(52, 211, 153, 0.3)',
  },
  Advanced: {
    bg: 'rgba(167, 139, 250, 0.1)',
    color: '#A78BFA',
    border: 'rgba(167, 139, 250, 0.3)',
  },
}

export default function CourseCard({ course }) {
  const level = course.level || 'Beginner'
  const levelStyle = LEVEL_STYLES[level] || LEVEL_STYLES.Beginner
  const imageSrc = courseImages[course.slug]

  const { getCompletedCardCount, hydrated } = useLearning()

  // Hard-block: do not render courses without a mapped local image
  if (!imageSrc) return null

  // Compute overall progress across all modules
  const days = course.modules || []
  const totalCards = days.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
  const completedCards = hydrated
    ? days.reduce((sum, _, di) => sum + getCompletedCardCount(course.slug, di), 0)
    : 0
  const progressPct = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0
  const started = completedCards > 0

  const ctaLabel = completedCards >= totalCards && totalCards > 0
    ? 'Review course'
    : started
    ? 'Continue →'
    : 'Start learning →'

  return (
    <motion.a
      href={`/courses/${encodeURIComponent(course.slug)}`}
      className="course-card"
      whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(11,95,255,0.28)', borderColor: 'rgba(11,95,255,0.5)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Course hero image */}
      <div className="course-card-image">
        <Image
          src={imageSrc}
          alt={course.title}
          width={640}
          height={360}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="course-card-img"
          loading="lazy"
        />
      </div>

      {/* Level badge */}
      <span
        className="course-level-badge"
        style={{
          background: levelStyle.bg,
          color: levelStyle.color,
          border: `1px solid ${levelStyle.border}`,
        }}
      >
        {level}
      </span>

      <div className="course-card-top course-card-top--offset">
        {course.price_aed === 0 && <span className="pill pill-muted">Free</span>}
        {completedCards >= totalCards && totalCards > 0 && (
          <span className="pill" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}>
            ✓ Completed
          </span>
        )}
      </div>

      <h3>{course.title}</h3>
      <p className="hero-text">{course.subtitle}</p>

      <div className="course-meta">
        <span>{course.duration_days} days</span>
        <span>{course.modules?.length} modules</span>
      </div>

      {/* Progress bar — shown only if user has started */}
      {hydrated && started && (
        <div className="course-card-progress">
          <div className="course-card-progress-label">
            <span>Progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      <div className="course-card-cta-row">
        <span className="course-cta">{ctaLabel}</span>
      </div>
    </motion.a>
  )
}
