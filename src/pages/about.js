// src/pages/about.js
export default function About() {
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
              <a href="/about" style={{...navLinkStyle, fontWeight: 'bold'}}>About</a>
              <a href="/products" style={navLinkStyle}>Products</a>
              <a href="/services" style={navLinkStyle}>Services</a>
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
                About Zenith Capital
              </h2>
              <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'white' }}>
                Investment expertise for public and private equity markets
              </p>
            </section>
            
            {/* Our Story Section */}
            <section style={{ 
              marginBottom: '2rem',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1a3a5f' }}>
                Our Story
              </h2>
              <div style={{ lineHeight: '1.7', color: '#4b5563' }}>
                <p style={{ marginBottom: '1rem' }}>
                  Zenith Capital Advisors was founded with a simple mission: to provide investment professionals 
                  with the analytical tools and frameworks they need to make better decisions. With backgrounds 
                  spanning private equity, investment banking, and asset management, our team brings together deep 
                  expertise in both financial analysis and practical investment decision-making.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  The idea for Zenith emerged from our founders' frustration with the limitations of existing financial 
                  models and analytical tools. Too often, these models were either overly simplistic, failing to capture 
                  the nuances of complex investments, or needlessly complicated, obscuring key insights beneath layers 
                  of unnecessary detail.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  We set out to create a different approach: financial models and advisory services that combine analytical 
                  rigor with practical usability, designed by investment professionals for investment professionals.
                </p>
                <p>
                  Today, Zenith serves clients across the investment landscape, from boutique real estate investment 
                  firms to global asset managers. Our pre-built models save our clients countless hours of development 
                  time, while our custom services provide tailored solutions for specific investment needs.
                </p>
              </div>
            </section>
            
            {/* Our Values Section */}
            <section style={{ 
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1a3a5f' }}>
                Our Values
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {/* Value 1 */}
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#ffd700',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <svg style={{ width: '2rem', height: '2rem', color: '#1a3a5f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#1a3a5f' }}>
                    Analytical Rigor
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    We believe that sound decisions begin with thorough analysis. Our work is grounded in 
                    quantitative precision and careful attention to detail.
                  </p>
                </div>
                
                {/* Value 2 */}
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#ffd700',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <svg style={{ width: '2rem', height: '2rem', color: '#1a3a5f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#1a3a5f' }}>
                    Client Partnership
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    We view our client relationships as partnerships. We succeed when you succeed, 
                    and we're committed to your long-term investment performance.
                  </p>
                </div>
                
                {/* Value 3 */}
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#ffd700',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <svg style={{ width: '2rem', height: '2rem', color: '#1a3a5f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#1a3a5f' }}>
                    Continuous Innovation
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    The investment landscape is constantly evolving, and so are we. We continuously 
                    refine our methodologies and incorporate new approaches into our work.
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
                Ready to work with our team?
              </h2>
              <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: 'white' }}>
                Let's discuss how we can help elevate your investment process
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
                Contact Us
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