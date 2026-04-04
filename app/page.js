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

export default function Home() {
  const courses = getCourses()
  const featured = courses.slice(0, 6)

  return (
    <main>
      <div className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <p className="eyebrow">Apex Innovate · AI Academy</p>
              <h1>Learn AI the<br />right way.</h1>
              <p className="hero-text">Practical, structured courses that help you use AI tools in your real daily life — from beginners to seniors.</p>
              <div className="hero-actions">
                <a href="/courses" className="btn btn-primary">Browse Courses</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Why AI Academy?</h2>
          </div>
          <div className="value-grid">
            {[
              { title: 'Real Skills', desc: 'Every lesson is built around practical tasks you can apply immediately.' },
              { title: 'Structured Learning', desc: 'Clear modules, quizzes, and projects — no confusion, no guessing.' },
              { title: 'Mobile-First', desc: 'Learn anywhere, anytime. Our courses are designed for your phone.' },
              { title: 'For Everyone', desc: 'From complete beginners to seniors — we have a course for you.' },
            ].map((v) => (
              <div key={v.title} className="value-card">
                <h3>{v.title}</h3>
                <p className="hero-text">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured Courses</h2>
            <a href="/courses" className="section-link">View all →</a>
          </div>
          <div className="course-grid">
            {featured.map((course) => (
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

      <section className="section">
        <div className="container">
          <div className="cta-panel">
            <div className="section-head center">
              <h2>Ready to start learning?</h2>
              <p className="hero-text">Join AI Academy and start your AI journey today.</p>
            </div>
            <div className="cta">
              <a href="/courses" className="btn btn-primary full">Browse Courses</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}