export default function NotFound() {
  return (
    <main>
      <div className="hero">
        <div className="container">
          <div className="hero-inner">
            <div style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
              <p style={{ fontSize: '4rem', marginBottom: '0.5rem', lineHeight: 1 }}>🤖</p>
              <p className="eyebrow">404 — Page Not Found</p>
              <h1>Oops! Geo-Bot got lost.</h1>
              <p className="hero-text" style={{ marginTop: '0.5rem' }}>
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
              <div className="hero-actions" style={{ justifyContent: 'center' }}>
                <a href="/" className="btn btn-primary">Go Home</a>
                <a href="/courses" className="btn btn-secondary">Browse Courses</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
