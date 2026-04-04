import fs from 'fs'
import path from 'path'

export default function Home() {
  const base = path.join(process.cwd(), 'content/courses')
  const courses = fs.existsSync(base) ? fs.readdirSync(base) : []

  return (
    <main>
      <h2>All Courses</h2>
      <div>
        {courses.map((slug) => (
          <div key={slug}>
            <a href={'/courses/' + slug}>{slug}</a>
          </div>
        ))}
      </div>
    </main>
  )
}