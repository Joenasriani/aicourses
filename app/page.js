import fs from 'fs'
import path from 'path'
import CourseCard from '../components/CourseCard'

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

const TRUST_STATS = [
  { value: '500+', label: 'Students' },
  { value: '15+', label: 'AI Courses' },
  { value: '4.9/5', label: 'Rating' },
]

const EASY_WAY = [
  { icon: '⚡', title: 'Short Lessons', desc: '5 mins/day keeps the learning real and sustainable.' },
  { icon: '🤖', title: 'AI-Powered Quizzes', desc: 'Personalised questions that adapt to your progress.' },
  { icon: '🏆', title: 'Practical Challenges', desc: 'Finish every course with a real-world final project.' },
]

export default function Home() {
  const courses = getCourses()
  const featured = courses.slice(0, 6)

  return (
    <main>
      <div className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <h1 className="text-6xl font-bold tracking-tighter leading-tight text-gray-900">
                Learn anything the easy way.
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mt-4">
                Short, interactive, 5-day AI courses designed for real-world results. No fluff, just progress.
              </p>
              <div className="hero-actions">
                <a
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/40 bg-[#0066FF]"
                >
                  Start Learning
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <section className="trust-bar">
        <div className="container">
          <div className="trust-stats">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="trust-stat">
                <span className="trust-stat-value">{s.value}</span>
                <span className="trust-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Easy Way */}
      <section className="section easy-way-section">
        <div className="container">
          <div className="section-head center">
            <h2>The Easy Way to Learn AI</h2>
          </div>
          <div className="easy-way-grid">
            {EASY_WAY.map((item) => (
              <div key={item.title} className="easy-way-card">
                <span className="easy-way-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p className="hero-text">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              <CourseCard key={course.slug} course={course} />
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