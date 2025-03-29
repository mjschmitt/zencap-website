// src/pages/contact.js
export default function Contact() {
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
              <a href="/services" style={navLinkStyle}>Services</a>
              <a href="/contact" style={{...navLinkStyle, fontWeight: 'bold'}}>Contact</a>
            </nav>
          </header>
          
          <main>
            {/* Page Header */}
            <section style={{ 
              padding: '3rem 1rem', 
              backgroundColor: '#f8fafc', 
              borderRadius: '0.5rem', 
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1a3a5f', textAlign: 'center', marginBottom: '1rem' }}>
                Contact Us
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#4b5563', textAlign: 'center' }}>
                Let's discuss how we can help elevate your investment process
              </p>
            </section>
            
            {/* Contact Form and Info */}
            <section style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {/* Contact Form */}
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a3a5f', marginBottom: '1.5rem' }}>
                  Send Us a Message
                </h3>
                
                <form>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
                      Full Name*
                    </label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      required 
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
                      Email Address*
                    </label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required 
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="company" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
                      Company
                    </label>
                    <input 
                      type="text" 
                      id="company" 
                      name="company" 
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="interest" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
                      I'm interested in
                    </label>
                    <select 
                      id="interest" 
                      name="interest" 
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="products">Financial Models</option>
                      <option value="services">Custom Services</option>
                      <option value="partnership">Partnership Opportunity</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="message" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
                      Message*
                    </label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows="4" 
                      required 
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem'
                      }}
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#ffd700',
                      color: '#1a3a5f',
                      borderRadius: '0.375rem',
                      fontWeight: '500',
                      fontSize: '1rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Send Message
                  </button>
                </form>
              </div>
              
              {/* Contact Information */}
              <div>
                <div style={{
                  backgroundColor: '#1a3a5f',
                  padding: '2rem',
                  borderRadius: '0.5rem',
                  color: 'white',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                    Contact Information
                  </h3>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <svg style={{ width: '1.5rem', height: '1.5rem', color: '#ffd700', marginRight: '0.75rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>Email</h4>
                        <a href="mailto:info@zencap.co" style={{ color: '#d1d5db', textDecoration: 'none', hover: { color: 'white' } }}>
                          info@zencap.co
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <svg style={{ width: '1.5rem', height: '1.5rem', color: '#ffd700', marginRight: '0.75rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>Phone</h4>
                        <a href="tel:+15551234567" style={{ color: '#d1d5db', textDecoration: 'none', hover: { color: 'white' } }}>
                          +1 (555) 123-4567
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <svg style={{ width: '1.5rem', height: '1.5rem', color: '#ffd700', marginRight: '0.75rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>Address</h4>
                        <p style={{ color: '#d1d5db' }}>
                          123 Finance Street<br />
                          New York, NY 10001
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" style={{
                    display: 'block',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#1a3a5f',
                    textAlign: 'center',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}>
                    Schedule a Meeting
                  </a>
                </div>
                
                <div style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a3a5f', marginBottom: '1rem' }}>
                    Follow Us
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="#" style={{ color: '#4b5563' }}>
                      <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" style={{ color: '#4b5563' }}>
                      <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>
            
            {/* FAQ Section */}
            <section style={{
              marginBottom: '3rem'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a3a5f', marginBottom: '1.5rem', textAlign: 'center' }}>
                Frequently Asked Questions
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '500', color: '#1a3a5f' }}>
                    What is the typical turnaround time for custom services?
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Our turnaround time varies based on the complexity of the project. For standard custom models, we typically deliver initial drafts within 1-2 weeks. For comprehensive infrastructure projects, the timeline is generally 4-8 weeks. During our initial consultation, we'll provide a specific estimate for your project.
                  </p>
                </div>
                
                <div style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '500', color: '#1a3a5f' }}>
                    Do you offer implementation support for your models?
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Yes, we provide comprehensive implementation support for all our models. This includes personalized training, documentation, and ongoing support to ensure your team can effectively use the models. For custom projects, we also offer extended support packages to help with integration into your existing systems.
                  </p>
                </div>
              </div>
            </section>
            
            {/* Map Section - Placeholder */}
            <div style={{
              height: '300px',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              marginBottom: '2rem'
            }}>
              [Google Map Would Go Here]
            </div>
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