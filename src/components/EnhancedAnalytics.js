import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AttributionTracker } from '../utils/analytics/attributionTracking';

export default function EnhancedAnalytics() {
  const router = useRouter();

  useEffect(() => {
    // Initialize attribution tracking
    const attributionTracker = new AttributionTracker();

    // Enhanced Google Analytics 4 setup with e-commerce
    const initGA = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        // Configure GA4 with enhanced e-commerce
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: router.asPath,
          enhanced_ecommerce: true,
          custom_parameters: {
            page_type: getPageType(router.asPath),
            user_type: getUserType()
          }
        });

        // Set up enhanced measurement events
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: router.asPath
        });
      }
    };

    // Initialize GA and attribution tracking
    initGA();
    attributionTracker.trackPageView({
      pageType: getPageType(router.asPath),
      pageTitle: document.title
    });

    // Enhanced route change tracking
    const handleRouteChange = (url) => {
      if (typeof window !== 'undefined' && window.gtag) {
        // Standard GA page view
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
        });

        // Enhanced page view event
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: url,
          event_category: 'Navigation',
          custom_parameters: {
            page_type: getPageType(url),
            previous_page: router.asPath
          }
        });
      }

      // Track with attribution
      attributionTracker.trackPageView({
        pageType: getPageType(url),
        pageTitle: document.title,
        previousPage: router.asPath
      });
    };

    // Set up scroll depth tracking
    const trackScrollDepth = () => {
      let maxScroll = 0;
      const milestones = [25, 50, 75, 90];
      
      const handleScroll = () => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          
          // Track milestone events
          milestones.forEach(milestone => {
            if (scrollPercent >= milestone && maxScroll - milestone < scrollPercent - maxScroll) {
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'scroll', {
                  event_category: 'Engagement',
                  event_label: `${milestone}% depth`,
                  value: milestone
                });
              }
            }
          });
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    };

    // Set up time on page tracking
    const startTime = Date.now();
    const trackTimeOnPage = () => {
      return () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        
        if (timeSpent > 10 && typeof window !== 'undefined' && window.gtag) { // Only track if >10 seconds
          window.gtag('event', 'timing_complete', {
            name: 'time_on_page',
            value: timeSpent,
            event_category: 'Engagement',
            custom_parameters: {
              page_path: router.asPath,
              time_category: getTimeCategory(timeSpent)
            }
          });
        }
      };
    };

    // Set up click tracking for key elements
    const trackClicks = () => {
      const trackClick = (selector, eventName) => {
        document.addEventListener('click', (e) => {
          if (e.target.matches(selector) || e.target.closest(selector)) {
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'click', {
                event_category: 'Engagement',
                event_label: eventName,
                event_action: 'click',
                value: 1
              });
            }
          }
        });
      };

      // Track important clicks
      trackClick('a[href*="/models/"]', 'model_link_click');
      trackClick('button[class*="cta"], a[class*="cta"]', 'cta_button_click');
      trackClick('a[href*="mailto"]', 'contact_email_click');
      trackClick('.newsletter-signup', 'newsletter_signup_click');
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    const cleanupScroll = trackScrollDepth();
    const cleanupTime = trackTimeOnPage();
    trackClicks();

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      cleanupScroll();
      cleanupTime();
    };
  }, [router.asPath, router.events]);

  // Return null as this is a utility component
  return null;
}

// Helper functions
function getPageType(path) {
  if (path === '/') return 'homepage';
  if (path.startsWith('/models/')) return 'model_page';
  if (path.startsWith('/insights/')) return 'insight_page';
  if (path.startsWith('/solutions/')) return 'solution_page';
  if (path === '/contact') return 'contact_page';
  if (path === '/about') return 'about_page';
  return 'other';
}

function getUserType() {
  // Determine user type based on session storage or cookies
  if (typeof window !== 'undefined') {
    const hasVisited = sessionStorage.getItem('returning_visitor');
    const hasNewsletter = localStorage.getItem('newsletter_subscriber');
    
    if (hasNewsletter) return 'subscriber';
    if (hasVisited) return 'returning_visitor';
    
    sessionStorage.setItem('returning_visitor', 'true');
    return 'new_visitor';
  }
  return 'unknown';
}

function getTimeCategory(seconds) {
  if (seconds < 30) return 'bounce';
  if (seconds < 60) return 'quick_view';
  if (seconds < 300) return 'engaged';
  if (seconds < 900) return 'highly_engaged';
  return 'deeply_engaged';
}