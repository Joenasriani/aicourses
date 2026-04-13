import './globals.css'
import Providers from './Providers'
import HeaderNav from '@/components/HeaderNav'

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <HeaderNav />
          <div className="page-body">
            {children}
          </div>
          <footer className="site-footer">
            <div className="container">
              <div className="footer-inner">
                <span className="footer-brand">AI Academy</span>
                <span className="footer-copy">© 2025 Apex Innovate. All rights reserved.</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
