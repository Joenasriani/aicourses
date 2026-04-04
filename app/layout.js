import './globals.css'

export const metadata = {
  title: 'Robomarket Academy',
  description: 'Learn AI through real, structured courses'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="site-header">
          <div className="container">
            <div className="header-inner">
              <a href="/" className="brand">
                <span className="brand-title">Robomarket Academy</span>
                <span className="brand-subtitle">by Robomarket</span>
              </a>
              <nav className="site-nav">
                <a href="/courses" className="nav-link">Courses</a>
                <a href="/ai-professor" className="nav-link">AI Professor</a>
                <a href="/courses" className="btn btn-primary btn-get-started">Get Started</a>
              </nav>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}