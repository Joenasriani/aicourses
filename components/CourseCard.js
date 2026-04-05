"use client"

import { motion } from 'framer-motion'

const LEVEL_STYLES = {
  Beginner: {
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
  },
  Advanced: {
    bg: '#f5f3ff',
    color: '#7c3aed',
    border: '#ddd6fe',
  },
}

export default function CourseCard({ course }) {
  const level = course.level || 'Beginner'
  const levelStyle = LEVEL_STYLES[level] || LEVEL_STYLES.Beginner

  return (
    <motion.a
      href={`/courses/${encodeURIComponent(course.slug)}`}
      className="course-card"
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 220, padding: 18, borderRadius: 8, border: '1px solid #F1F5F9', background: 'var(--surface)', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
    >
      {/* Level badge — top right */}
      <span
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: levelStyle.bg,
          color: levelStyle.color,
          border: `1px solid ${levelStyle.border}`,
          borderRadius: 999,
          padding: '2px 10px',
          fontSize: '0.75rem',
          fontWeight: 500,
          lineHeight: 1.6,
        }}
      >
        {level}
      </span>

      <div className="course-card-top" style={{ paddingRight: 80 }}>
        {course.price_aed === 0 && <span className="pill pill-muted">Free</span>}
      </div>

      <h3>{course.title}</h3>
      <p className="hero-text">{course.subtitle}</p>

      <div className="course-meta">
        <span>{course.duration_days} days</span>
        <span>{course.modules?.length} modules</span>
      </div>

      <span className="course-cta" style={{ marginTop: 'auto' }}>Learn more →</span>
    </motion.a>
  )
}
