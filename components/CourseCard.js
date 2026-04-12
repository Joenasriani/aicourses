"use client"

import { motion } from 'framer-motion'

const LEVEL_STYLES = {
  Beginner: {
    bg: '#E0EDFF',
    color: '#3B82F6',
    border: '#bfdbfe',
  },
  Intermediate: {
    bg: '#ECFDF5',
    color: '#059669',
    border: '#A7F3D0',
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
    >
      {/* Level badge — top right */}
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
      </div>

      <h3>{course.title}</h3>
      <p className="hero-text">{course.subtitle}</p>

      <div className="course-meta">
        <span>{course.duration_days} days</span>
        <span>{course.modules?.length} modules</span>
      </div>

      <span className="course-cta">Learn more →</span>
    </motion.a>
  )
}
