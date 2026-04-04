import fs from 'fs'
import path from 'path'

function getCourses() {
  const base = path.join(process.cwd(), 'content/courses')
  if (!fs.existsSync(base)) return []

  return fs.readdirSync(base).map((slug) => {
    const file = path.join(base, slug, 'course.json')
    if (!fs.existsSync(file)) return null
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return { slug, ...data }
  }).filter(Boolean)
}

export default function CoursesPage() {
  const courses = getCourses()

  return (
    <main>
      <div className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <p className="eyebrow">AI Academy</p>
              <h1>All Courses</h1>
              <p className="hero-text">Browse our full library of AI courses. Free and premium options available.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="container">
          <div className="course-grid">
            {courses.map((course) => (
              <a key={course.slug} href={`/courses/${course.slug}`} className="course-card">
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
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
