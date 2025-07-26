import { useEffect, useState } from 'react';

export default function ZoomDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const updateDiagnostics = () => {
      const html = document.documentElement;
      const body = document.body;
      const htmlStyles = window.getComputedStyle(html);
      const bodyStyles = window.getComputedStyle(body);

      setDiagnostics({
        htmlFontSize: htmlStyles.fontSize,
        bodyFontSize: bodyStyles.fontSize,
        htmlZoom: htmlStyles.zoom,
        bodyZoom: bodyStyles.zoom,
        htmlTransform: htmlStyles.transform,
        bodyTransform: bodyStyles.transform,
        devicePixelRatio: window.devicePixelRatio,
        visualViewportScale: window.visualViewport?.scale,
        scrollPosition: `${window.scrollX}, ${window.scrollY}`,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        bodyScrollHeight: body.scrollHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
      });
    };

    updateDiagnostics();
    
    const interval = setInterval(updateDiagnostics, 1000);
    window.addEventListener('resize', updateDiagnostics);
    window.addEventListener('scroll', updateDiagnostics);

    // Toggle with Ctrl+Shift+Z
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        setIsVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateDiagnostics);
      window.removeEventListener('scroll', updateDiagnostics);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 99999,
      maxWidth: '300px',
      border: '1px solid #00ff00',
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>Zoom Diagnostic (Ctrl+Shift+Z)</h3>
      {Object.entries(diagnostics).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '5px' }}>
          <strong>{key}:</strong> {value}
        </div>
      ))}
    </div>
  );
}