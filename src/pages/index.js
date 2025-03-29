// src/pages/index.js
export default function Home() {
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
            <a href="/" style={{...navLinkStyle, fontWeight: 'bold'}}>Home</a>
            <a href="/about" style={navLinkStyle}>About</a>
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
              Elevate Your Investment Decisions
            </h2>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'white' }}>
              Precision financial modeling and advisory solutions for investors.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem', 
              flexWrap: 'wrap' 
            }}>
              <a href="/products" style={{ 
                backgroundColor: '#3b82f6', 
                color: 'white',
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.375rem', 
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Explore Solutions
              </a>
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
            </div>
          </section>
          
          <section style={{ 
            marginBottom: '2rem', 
            textAlign: 'center' 
          }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              About Zenith
            </h2>
            <p style={{ 
              maxWidth: '768px', 
              margin: '0 auto', 
              marginBottom: '2rem' 
            }}>
              Zenith Capital Advisors provides sophisticated financial modeling and investment solutions for asset managers and investment firms.
            </p>
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