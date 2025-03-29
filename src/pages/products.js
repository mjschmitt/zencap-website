// src/pages/products.js
export default function Products() {
    // Define a common link style to use throughout the navigation
    const navLinkStyle = { color: '#4b5563' };
    
    // Common card style
    const productCardStyle = {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    };
    
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
              <a href="/products" style={{...navLinkStyle, fontWeight: 'bold'}}>Products</a>
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
                Financial Models
              </h2>
              <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'white' }}>
                Pre-built Excel solutions to streamline your investment analysis
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
                  Request a Custom Model
                </a>
              </div>
            </section>
            
            {/* Filter Section */}
            <section style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ fontWeight: '500', color: '#4b5563' }}>Filter by:</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#1a3a5f',
                    color: 'white',
                    borderRadius: '9999px',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    All Models
                  </button>
                  <button style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    borderRadius: '9999px',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    Private Equity
                  </button>
                  <button style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    borderRadius: '9999px',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    Public Equity
                  </button>
                </div>
              </div>
            </section>
            
            {/* Private Equity Models */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1a3a5f' }}>
                Private Equity Models
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Product 1 */}
                <div style={productCardStyle}>
                  <div style={{
                    height: '150px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.25rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af'
                  }}>
                    [Excel Preview]
                  </div>
                  <div style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e6f0ff', color: '#1a3a5f', borderRadius: '9999px', display: 'inline-block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    Private Equity
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a3a5f' }}>
                    Multi-Family Acquisition Model
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem', flexGrow: 1 }}>
                    Comprehensive underwriting for apartment complexes with unit-level analysis, renovation scenarios, and financing options.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#1a3a5f' }}>$299</span>
                    <a href="#" style={{ color: '#3b82f6', fontWeight: '500', fontSize: '0.875rem' }}>View Details</a>
                  </div>
                </div>
                
                {/* Product 2 */}
                <div style={productCardStyle}>
                  <div style={{
                    height: '150px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.25rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af'
                  }}>
                    [Excel Preview]
                  </div>
                  <div style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e6f0ff', color: '#1a3a5f', borderRadius: '9999px', display: 'inline-block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    Private Equity
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a3a5f' }}>
                    Office Property Acquisition Model
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem', flexGrow: 1 }}>
                    Detailed tenant rollover analysis, leasing assumptions, and capital expenditure planning for office investments.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#1a3a5f' }}>$349</span>
                    <a href="#" style={{ color: '#3b82f6', fontWeight: '500', fontSize: '0.875rem' }}>View Details</a>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Public Equity Models */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1a3a5f' }}>
                Public Equity Models
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Product 3 */}
                <div style={productCardStyle}>
                  <div style={{
                    height: '150px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.25rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af'
                  }}>
                    [Excel Preview]
                  </div>
                  <div style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e1f0ff', color: '#1e40af', borderRadius: '9999px', display: 'inline-block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    Public Equity
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a3a5f' }}>
                    DCF Valuation Suite
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem', flexGrow: 1 }}>
                    Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#1a3a5f' }}>$249</span>
                    <a href="#" style={{ color: '#3b82f6', fontWeight: '500', fontSize: '0.875rem' }}>View Details</a>
                  </div>
                </div>
                
                {/* Product 4 */}
                <div style={productCardStyle}>
                  <div style={{
                    height: '150px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.25rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af'
                  }}>
                    [Excel Preview]
                  </div>
                  <div style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e1f0ff', color: '#1e40af', borderRadius: '9999px', display: 'inline-block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    Public Equity
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a3a5f' }}>
                    Portfolio Attribution Model
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem', flexGrow: 1 }}>
                    Analyze performance drivers and attribution factors across investment positions.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#1a3a5f' }}>$279</span>
                    <a href="#" style={{ color: '#3b82f6', fontWeight: '500', fontSize: '0.875rem' }}>View Details</a>
                  </div>
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
                Need Something More Tailored?
              </h2>
              <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: 'white' }}>
                Our custom financial modeling services can create bespoke solutions for your specific investment needs.
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '1rem', 
                flexWrap: 'wrap' 
              }}>
                <a href="/services" style={{ 
                  backgroundColor: '#ffd700', 
                  color: '#1a3a5f',
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '0.375rem', 
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Learn About Custom Services
                </a>
              </div>
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