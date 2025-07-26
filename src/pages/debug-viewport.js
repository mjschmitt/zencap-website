import { useEffect, useState } from 'react';

export default function DebugViewport() {
  const [viewportInfo, setViewportInfo] = useState({});

  useEffect(() => {
    const updateInfo = () => {
      setViewportInfo({
        windowInnerWidth: window.innerWidth,
        windowInnerHeight: window.innerHeight,
        documentClientWidth: document.documentElement.clientWidth,
        documentClientHeight: document.documentElement.clientHeight,
        bodyClientWidth: document.body.clientWidth,
        bodyClientHeight: document.body.clientHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        scrollY: window.scrollY,
        scrollX: window.scrollX,
        visualViewportScale: window.visualViewport?.scale || 'N/A',
        computedFontSize: window.getComputedStyle(document.documentElement).fontSize,
        bodyComputedFontSize: window.getComputedStyle(document.body).fontSize,
        zoom: window.getComputedStyle(document.documentElement).zoom,
        transform: window.getComputedStyle(document.documentElement).transform,
      });
    };

    updateInfo();
    window.addEventListener('resize', updateInfo);
    window.addEventListener('scroll', updateInfo);

    return () => {
      window.removeEventListener('resize', updateInfo);
      window.removeEventListener('scroll', updateInfo);
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Viewport Debug Info</h1>
      <pre style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        {JSON.stringify(viewportInfo, null, 2)}
      </pre>
      <div style={{ marginTop: '20px', height: '2000px', background: 'linear-gradient(to bottom, red, blue)' }}>
        <p>Scroll test area</p>
      </div>
    </div>
  );
}