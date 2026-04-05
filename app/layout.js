import './globals.css'
import Providers from './Providers'

export const metadata = {
  title: 'AI Academy',
  description: 'Interactive, 5-day AI courses designed for practical results.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <header className="site-header">
            <div className="container">
              <div className="header-inner">
                <a href="/" className="brand">
                  <span className="brand-title">AI Academy</span>
                  <span className="brand-subtitle">by Apex Innovate</span>
                </a>
                <nav className="site-nav">
                  <a href="/courses" className="nav-link">Courses</a>
                  <a href="/ai-professor" className="nav-link">AI Professor</a>
                  <a href="/courses" className="btn btn-primary btn-get-started">Get Started</a>
                </nav>
              </div>
            </div>
          </header>
          <div className="max-w-7xl mx-auto px-4">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}