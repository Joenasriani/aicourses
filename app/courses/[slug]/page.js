import fs from 'fs'
import path from 'path'
import CourseClient from './CourseClient'

export default function CoursePage({ params }) {
  const file = path.join(process.cwd(), 'content/courses', params.slug, 'course.json')

  if (!fs.existsSync(file)) {
    return (
      <main>
        <div className="hero">
          <div className="container">
            <p className="eyebrow">AI Academy</p>
            <h1>Course not found</h1>
            <div className="hero-actions">
              <a href="/courses" className="btn btn-secondary">← Back to Courses</a>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const data = JSON.parse(fs.readFileSync(file, 'utf-8'))

  return (
    <main>
      <div className="hero">
        <div className="container">
          <div className="course-hero">
            <div>
              <p className="eyebrow"><a href="/courses">Courses</a> / {data.level}</p>
              <h1>{data.title}</h1>
              <p className="hero-text large">{data.subtitle}</p>
              <div className="course-meta" style={{ marginTop: '12px' }}>
                <span>{data.duration_days} days</span>
                <span>{data.modules?.length} modules</span>
                <span>{data.price_aed === 0 ? 'Free' : `${data.price_aed} AED`}</span>
              </div>
              <div className="hero-actions">
                <a href="/courses" className="btn btn-secondary">← All Courses</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="container">
          {data.final_project && (
            <div className="final-project" style={{ marginBottom: '24px' }}>
              <h3>Final Project</h3>
              <p className="hero-text">{data.final_project}</p>
            </div>
          )}
          <CourseClient course={{ slug: params.slug, ...data }} />
        </div>
      </section>
    </main>
  )
}