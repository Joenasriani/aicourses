import fs from 'fs'
import path from 'path'

export default function CoursePage({ params }) {
  const file = path.join(process.cwd(), 'content/courses', params.slug, 'course.json')
  if (!fs.existsSync(file)) return <div>Not found</div>

  const data = JSON.parse(fs.readFileSync(file, 'utf-8'))

  return (
    <main>
      <h1>{data.title}</h1>
      <p>{data.subtitle}</p>
      {data.modules.map((m, i) => (
        <div key={i}>
          <h3>{m.title}</h3>
          <ul>
            {m.lessons.map((l, j) => (
              <li key={j}>{l}</li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  )
}