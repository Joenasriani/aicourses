import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import CourseClient from './CourseClient'
import courseImages from '@/content/courseImages'

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
  const imageSrc = courseImages[params.slug]

  // Hard-block: do not render a course without a mapped local image
  if (!imageSrc) {
    return (
      <main>
        <div className="hero">
          <div className="container">
            <p className="eyebrow">AI Academy</p>
            <h1>Course unavailable</h1>
            <p className="hero-text">This course is not yet available. Please check back soon.</p>
            <div className="hero-actions">
              <a href="/courses" className="btn btn-secondary">← All Courses</a>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="hero">
        <div className="container">
          <div className="course-hero">
            <div className="course-hero-text">
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
            <div className="course-hero-image">
              <Image
                src={imageSrc}
                alt={data.title}
                width={640}
                height={360}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="course-hero-img"
              />
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