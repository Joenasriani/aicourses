import './globals.css'
import Providers from './Providers'
import Footer from '@/components/Footer'
import XPBadge from '@/components/XPBadge'

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
          <header
            className="sticky top-0 z-50 min-h-[4rem] border-b bg-white"
            style={{ borderColor: "#E6E8EC" }}
          >
            <div className="container">
              <div className="header-inner">
                <a href="/" className="brand">
                  <span className="text-xl font-bold leading-tight" style={{ color: "#111827" }}>AI Academy</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">by Apex Innovate</span>
                </a>
                <nav className="site-nav">
                  <a href="/courses" className="nav-link">Courses</a>
                  <a href="/ai-professor" className="nav-link">AI Professor</a>
                  <XPBadge />
                </nav>
              </div>
            </div>
          </header>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}