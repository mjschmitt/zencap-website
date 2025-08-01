import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ScrollReset() {
  const router = useRouter();

  useEffect(() => {
    // Force scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return null;
}