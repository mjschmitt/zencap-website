import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Analytics() {
  const router = useRouter();

  useEffect(() => {
    // Google Analytics 4 setup
    const initGA = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: router.asPath,
        });
      }
    };

    // Initialize GA on first load
    initGA();

    // Track page views on route changes
    const handleRouteChange = (url) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.asPath, router.events]);

  // Return null as this is a utility component
  return null;
} 