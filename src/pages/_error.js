// src/pages/_error.js
function Error({ statusCode, hasGetInitialPropsRun, err }) {
  // If this is an API route, return JSON
  if (err && err.url && err.url.startsWith('/api/')) {
    return null; // Let Next.js handle API errors
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
        {statusCode}
      </h1>
      <p style={{ fontSize: '24px', color: '#666' }}>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;