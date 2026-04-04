import './globals.css'

export const metadata = {
  title: 'AI Academy by Apex Innovate',
  description: 'Learn AI through real, structured courses'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <div className="header-inner">
              <a href="/" className="brand">
                <span className="brand-title">AI Academy</span>
                <span className="brand-subtitle">by Apex Innovate</span>
              </a>
              <nav className="site-nav">
                <a href="/courses">Courses</a>
                <a href="/pricing">Pricing</a>
                <a href="/ai-professor">AI Professor</a>
                <a href="/courses" className="btn btn-primary" style={{ minHeight: '38px', padding: '0 16px', fontSize: '0.9rem' }}>Get Started</a>
              </nav>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}