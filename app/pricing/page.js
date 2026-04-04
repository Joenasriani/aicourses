export default function PricingPage() {
  return (
    <main>
      <div className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <p className="eyebrow">AI Academy</p>
              <h1>Simple Pricing</h1>
              <p className="hero-text">Unlock all AI courses with one affordable plan. No hidden fees.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="container">
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Monthly</h3>
              <div className="price">49 AED</div>
              <p className="price-sub">per month</p>
              <div className="hero-actions" style={{ marginTop: '20px' }}>
                <a href="/courses" className="btn btn-secondary full">Get Started</a>
              </div>
            </div>
            <div className="pricing-card pricing-card-featured">
              <span className="featured-badge">Best Value</span>
              <h3>Yearly</h3>
              <div className="price">399 AED</div>
              <p className="price-sub">per year · save 33%</p>
              <div className="hero-actions" style={{ marginTop: '20px' }}>
                <a href="/courses" className="btn btn-primary full">Get Started</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}