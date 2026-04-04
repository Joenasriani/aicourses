import fs from 'fs'
import path from 'path'

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
                <a href="/pricing" className="btn btn-primary">Enroll Now</a>
                <a href="/courses" className="btn btn-secondary">← All Courses</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="container">
          <div className="course-page">
            <div>
              <div className="section-head">
                <h2>Course Modules</h2>
              </div>
              <div className="modules-list">
                {data.modules.map((m, i) => (
                  <div key={i} className="module-card">
                    <h3>Module {i + 1}: {m.title}</h3>
                    <ul className="lesson-list">
                      {m.lessons.map((l, j) => (
                        <li key={j}>{l}</li>
                      ))}
                    </ul>
                    {m.mini_task && (
                      <div className="module-footer">
                        <p><strong>Mini Task:</strong> {m.mini_task}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {data.final_project && (
              <div className="final-project">
                <h3>Final Project</h3>
                <p className="hero-text">{data.final_project}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}