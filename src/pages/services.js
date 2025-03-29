// src/pages/services.js
export default function Services() {
    // Define a common link style to use throughout the navigation
    const navLinkStyle = { color: '#4b5563' };
    
    return (
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          width: '100%', 
          padding: '2rem', 
          boxSizing: 'border-box' 
        }}>
          <header style={{ 
            marginBottom: '2rem', 
            textAlign: 'center' 
          }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e3a8a' }}>
              Zenith Capital Advisors
            </h1>
            <nav style={{ 
              marginTop: '1rem', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1.5rem' 
            }}>
              <a href="/" style={navLinkStyle}>Home</a>
              <a href="/about" style={navLinkStyle}>About</a>
              <a href="/products" style={navLinkStyle}>Products</a>
              <a href="/services" style={{...navLinkStyle, fontWeight: 'bold'}}>Services</a>
              <a href="/contact" style={navLinkStyle}>Contact</a>
            </nav>
          </header>
          
          <main>
            {/* Hero Section */}
            <section style={{ 
              padding: '3rem 1rem', 
              backgroundColor: '#1a3a5f', 
              marginBottom: '2rem', 
              borderRadius: '0.5rem', 
              textAlign: 'center' 
            }}>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                color: 'white' // Explicitly set to white
              }}>
                Custom Solutions
              </h2>
              <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'white' }}>
                Tailored expertise to elevate your investment capabilities and decision-making
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '1rem', 
                flexWrap: 'wrap' 
              }}>
                <a href="/contact" style={{ 
                  backgroundColor: '#ffd700', 
                  color: '#1a3a5f',
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '0.375rem', 
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Schedule a Consultation
                </a>
              </div>
            </section>
            
            {/* Financial Modeling Service */}
            <section style={{ 
              marginBottom: '3rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '0.5rem', height: '2.5rem', backgroundColor: '#ffd700', marginRight: '1rem' }}></div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a3a5f' }}>
                    Customized Financial Modeling & Valuation
                  </h3>
                </div>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Bespoke models and valuation frameworks aligned with your investment strategy. Our financial modeling services deliver tailored analytical tools for both public and private equity investments, providing deeper insights and competitive advantage.
                </p>
                <ul style={{ marginBottom: '1.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Custom Model Development</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Valuation Framework Design</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Model Enhancement & Optimization</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Financial Modeling Training</span>
                  </li>
                </ul>
                <a href="/services/financial-modeling" style={{ display: 'inline-flex', alignItems: 'center', color: '#1a3a5f', fontWeight: '500' }}>
                  Learn more about our modeling services
                  <svg style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
              <div style={{ 
                backgroundColor: '#f3f4f6', 
                height: '350px', 
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: '1.125rem'
              }}>
                [Financial Modeling Image]
              </div>
            </section>
            
            {/* Infrastructure Service */}
            <section style={{ 
              marginBottom: '3rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <div style={{ 
                backgroundColor: '#f3f4f6', 
                height: '350px', 
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: '1.125rem',
                order: { xs: 2, md: 1 }
              }}>
                [Investment Infrastructure Image]
              </div>
              <div style={{ order: { xs: 1, md: 2 } }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '0.5rem', height: '2.5rem', backgroundColor: '#ffd700', marginRight: '1rem' }}></div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a3a5f' }}>
                    Investment Infrastructure Development
                  </h3>
                </div>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  End-to-end systems for streamlining investment analysis, decision-making, and monitoring. We help investment firms develop comprehensive infrastructure that transforms disparate analyses into cohesive, systematic processes.
                </p>
                <ul style={{ marginBottom: '1.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Process Assessment & Design</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Data Architecture Development</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Dashboard & Reporting Systems</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Infrastructure Implementation</span>
                  </li>
                </ul>
                <a href="/services/infrastructure" style={{ display: 'inline-flex', alignItems: 'center', color: '#1a3a5f', fontWeight: '500' }}>
                  Learn more about our infrastructure services
                  <svg style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </section>
            
            {/* Research Service */}
            <section style={{ 
              marginBottom: '3rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '0.5rem', height: '2.5rem', backgroundColor: '#ffd700', marginRight: '1rem' }}></div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a3a5f' }}>
                    Bespoke Industry & Market Research
                  </h3>
                </div>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Specialized research to inform investment strategy and identify opportunities. Our research goes beyond publicly available information to provide proprietary insights that drive superior investment decisions.
                </p>
                <ul style={{ marginBottom: '1.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Market Opportunity Analysis</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Competitive Landscape Mapping</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Industry Deep-Dive</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#ffd700', marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: '#4b5563' }}>Thematic Investment Research</span>
                  </li>
                </ul>
                <a href="/services/research" style={{ display: 'inline-flex', alignItems: 'center', color: '#1a3a5f', fontWeight: '500' }}>
                  Learn more about our research services
                  <svg style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
              <div style={{ 
                backgroundColor: '#f3f4f6', 
                height: '350px', 
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: '1.125rem'
              }}>
                [Industry Research Image]
              </div>
            </section>
            
            {/* Process Section */}
            <section style={{
              marginBottom: '3rem',
              padding: '2rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem'
            }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a3a5f', textAlign: 'center', marginBottom: '2rem' }}>
                Our Process
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                {/* Step 1 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#1a3a5f',
                    color: 'white',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    1
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a3a5f', marginBottom: '0.5rem' }}>
                    Discovery
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    We begin by understanding your investment strategy, current processes, and specific needs.
                  </p>
                </div>
                
                {/* Step 2 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#1a3a5f',
                    color: 'white',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    2
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a3a5f', marginBottom: '0.5rem' }}>
                    Solution Design
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Our team develops a detailed proposal with a customized solution designed for your needs.
                  </p>
                </div>
                
                {/* Step 3 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#1a3a5f',
                    color: 'white',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    3
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a3a5f', marginBottom: '0.5rem' }}>
                    Development
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    We create your solution with meticulous attention to detail, incorporating your feedback.
                  </p>
                </div>
                
                {/* Step 4 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#1a3a5f',
                    color: 'white',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    4
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a3a5f', marginBottom: '0.5rem' }}>
                    Implementation
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    We deliver your solution with comprehensive documentation and training.
                  </p>
                </div>
              </div>
            </section>
            
            {/* CTA Section */}
            <section style={{ 
              padding: '3rem 1rem', 
              backgroundColor: '#1a3a5f', 
              marginBottom: '2rem', 
              borderRadius: '0.5rem', 
              textAlign: 'center' 
            }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
                Ready to elevate your investment process?
              </h2>
              <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: 'white' }}>
                Schedule a consultation to discuss your specific needs and how we can help.
              </p>
              <a href="/contact" style={{ 
                backgroundColor: '#ffd700', 
                color: '#1a3a5f',
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.375rem', 
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Schedule a Free Consultation
              </a>
            </section>
          </main>
          
          <footer style={{ 
            paddingTop: '2rem', 
            borderTop: '1px solid #e5e7eb', 
            marginTop: '3rem', 
            color: '#6b7280', 
            textAlign: 'center' 
          }}>
            <p>&copy; {new Date().getFullYear()} Zenith Capital Advisors</p>
          </footer>
        </div>
      </div>
    );
  }