"use client"

import { useState, useMemo } from 'react'

const FILTERS = ['All', 'AI', 'Development', 'Marketing']

function matchesFilter(course, filter) {
  if (filter === 'All') return true
  const text = `${course.title} ${course.subtitle} ${course.slug}`.toLowerCase()
  return text.includes(filter.toLowerCase())
}

export default function CourseList({ courses }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return courses.filter((course) => {
      const matchesSearch =
        q === '' ||
        `${course.title} ${course.subtitle}`.toLowerCase().includes(q)
      return matchesFilter(course, activeFilter) && matchesSearch
    })
  }, [courses, activeFilter, search])

  return (
    <>
      <div className="filter-search-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Search courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-buttons">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="course-grid">
        {filtered.length === 0 ? (
          <p className="no-results">No courses match your search.</p>
        ) : (
          filtered.map((course) => (
            <a key={course.slug} href={`/courses/${encodeURIComponent(course.slug)}`} className="course-card">
              <div className="course-card-top">
                <span className="pill">{course.level}</span>
                {course.price_aed === 0 && <span className="pill pill-muted">Free</span>}
              </div>
              <h3>{course.title}</h3>
              <p className="hero-text">{course.subtitle}</p>
              <div className="course-meta">
                <span>{course.duration_days} days</span>
                <span>{course.modules?.length} modules</span>
              </div>
              <span className="course-cta">Learn more →</span>
            </a>
          ))
        )}
      </div>
    </>
  )
}
