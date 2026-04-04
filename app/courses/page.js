import fs from 'fs'
import path from 'path'
import CourseList from './CourseList'

function getCourses() {
  const base = path.join(process.cwd(), 'content/courses')
  if (!fs.existsSync(base)) return []

  return fs
    .readdirSync(base)
    .map((slug) => {
      const file = path.join(base, slug, 'course.json')
      if (!fs.existsSync(file)) return null
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
      return { slug, ...data }
    })
    .filter(Boolean)
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
          <CourseList courses={courses} />
        </div>
      </section>
    </main>
  )
}