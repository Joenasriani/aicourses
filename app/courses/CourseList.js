"use client"

import { useState, useMemo, useTransition } from 'react'
import CourseCard from '../../components/CourseCard'

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Seniors', 'Free']

function matchesFilter(course, filter) {
  if (filter === 'All') return true
  if (filter === 'Free') return course.price_aed === 0
  const text = `${course.title} ${course.subtitle} ${course.slug} ${course.level}`.toLowerCase()
  return text.includes(filter.toLowerCase())
}

function SkeletonCard() {
  return (
    <div className="course-card skeleton-card" aria-hidden="true">
      <div className="skeleton-badge" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-subtitle" />
      <div className="skeleton-line skeleton-subtitle skeleton-short" />
      <div className="skeleton-meta">
        <div className="skeleton-line skeleton-meta-item" />
        <div className="skeleton-line skeleton-meta-item" />
      </div>
      <div className="skeleton-line skeleton-cta" />
    </div>
  )
}

export default function CourseList({ courses }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return courses.filter((course) => {
      const matchesSearch =
        q === '' ||
        `${course.title} ${course.subtitle}`.toLowerCase().includes(q)
      return matchesFilter(course, activeFilter) && matchesSearch
    })
  }, [courses, activeFilter, search])

  function handleFilter(f) {
    startTransition(() => {
      setActiveFilter(f)
    })
  }

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
              className={`filter-pill${activeFilter === f ? ' active' : ''}`}
              onClick={() => handleFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="course-grid">
        {isPending ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <p className="no-results">No courses match your search.</p>
        ) : (
          filtered.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))
        )}
      </div>
    </>
  )
}

