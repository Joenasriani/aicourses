const LINKS = [
  { label: 'Courses', href: '/courses' },
  { label: 'AI Professor', href: '/ai-professor' },
]

const COURSE_LINKS = [
  { label: 'Getting Started with ChatGPT', href: '/courses/chatgpt-start' },
  { label: 'Getting Started with Claude', href: '/courses/claude-start' },
  { label: 'Getting Started with Gemini', href: '/courses/gemini-start' },
  { label: 'ChatGPT for Seniors', href: '/courses/chatgpt-seniors' },
  { label: 'AI for Seniors Daily', href: '/courses/ai-seniors-daily' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer-outer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand-col">
            <a href="/" className="brand">
              <span className="brand-title">AI Academy</span>
              <span className="brand-subtitle">by Apex Innovate</span>
            </a>
            <p className="footer-tagline">
              Interactive, 5-day AI courses designed for practical results — for everyone.
            </p>
          </div>

          {/* Navigation column */}
          <div className="footer-nav-col">
            <p className="footer-col-heading">Navigate</p>
            <ul className="footer-link-list">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="footer-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular courses column */}
          <div className="footer-nav-col">
            <p className="footer-col-heading">Popular Courses</p>
            <ul className="footer-link-list">
              {COURSE_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="footer-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Apex Innovate. All rights reserved.</p>
          <p>Built with AI, for learners everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
