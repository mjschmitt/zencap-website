import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ecommerceEvents } from '../../utils/analytics/ecommerceTracking';

// Exit Intent Popup for Conversion Optimization
export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup today
    const lastShown = localStorage.getItem('exitIntentShown');
    const today = new Date().toDateString();
    
    if (lastShown === today) {
      setHasShown(true);
      return;
    }

    // Set up exit intent detection
    let mouseLeavings = 0;
    
    const handleMouseLeave = (e) => {
      // Only trigger if mouse is leaving from the top of the viewport
      if (e.clientY <= 0 && !hasShown && !isVisible) {
        mouseLeavings++;
        
        // Show popup after second mouse leave attempt (reduces false positives)
        if (mouseLeavings >= 2) {
          setIsVisible(true);
          setHasShown(true);
          
          // Track exit intent event
          ecommerceEvents.trackEngagementMilestone('exit_intent_triggered', {
            pageUrl: window.location.href,
            timeOnPage: Date.now() - performance.timing.navigationStart
          });
          
          // Store that we've shown the popup today
          localStorage.setItem('exitIntentShown', today);
        }
      }
    };

    // Add scroll-based backup trigger (if user scrolls back up quickly)
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY) {
        scrollDirection = 'up';
      } else {
        scrollDirection = 'down';
      }
      
      // If user quickly scrolls up more than 200px, consider it exit intent
      if (scrollDirection === 'up' && lastScrollY - currentScrollY > 200 && !hasShown && !isVisible) {
        setIsVisible(true);
        setHasShown(true);
        
        ecommerceEvents.trackEngagementMilestone('exit_intent_scroll_triggered', {
          pageUrl: window.location.href,
          scrollPosition: currentScrollY
        });
        
        localStorage.setItem('exitIntentShown', today);
      }
      
      lastScrollY = currentScrollY;
    };

    // Time-based backup (show after 45 seconds if still on page)
    const timeBasedTrigger = setTimeout(() => {
      if (!hasShown && !isVisible) {
        setIsVisible(true);
        setHasShown(true);
        
        ecommerceEvents.trackEngagementMilestone('exit_intent_time_triggered', {
          pageUrl: window.location.href,
          timeOnPage: 45000
        });
        
        localStorage.setItem('exitIntentShown', today);
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeBasedTrigger);
    };
  }, [hasShown, isVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit to newsletter API
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source: 'exit_intent_popup'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        
        // Track successful conversion
        ecommerceEvents.trackNewsletterSignup(email, 'exit_intent_popup');
        ecommerceEvents.trackEngagementMilestone('exit_intent_conversion', {
          email,
          conversionValue: 250 // Estimated value of newsletter subscriber
        });

        // Close popup after 3 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    
    // Track popup dismissal
    ecommerceEvents.trackEngagementMilestone('exit_intent_dismissed', {
      pageUrl: window.location.href
    });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Wait! Don't Miss Out</h3>
                    <p className="text-blue-100 text-sm">Get exclusive financial insights before you go</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-4">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Join 2,500+ Finance Professionals
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Get weekly insights on real estate investment strategies, financial modeling techniques, and market analysis that drive results.
                  </p>

                  {/* Benefits List */}
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Weekly market insights & analysis
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Exclusive model previews & discounts
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Professional networking opportunities
                    </li>
                  </ul>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your professional email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subscribing...
                      </div>
                    ) : (
                      'Get Free Insights Now'
                    )}
                  </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-3">
                  No spam, ever. Unsubscribe with one click.
                </p>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome Aboard!</h3>
              <p className="text-gray-600 mb-4">
                Check your inbox for a welcome email with exclusive insights and your first financial modeling tip.
              </p>
              <p className="text-sm text-gray-500">
                This popup will close automatically in a few seconds.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Mini exit-intent for mobile (less intrusive)
export function MobileExitIntent() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Mobile-specific triggers (scroll to bottom, time-based)
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent > 80 && !hasShown && !isVisible) {
        setIsVisible(true);
        setHasShown(true);
        
        ecommerceEvents.trackEngagementMilestone('mobile_exit_intent', {
          scrollPercent: scrollPercent,
          device: 'mobile'
        });
      }
    };

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasShown, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-3">
          <p className="text-sm font-semibold">Get weekly insights</p>
          <p className="text-xs text-blue-100">Join 2,500+ professionals</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => window.location.href = '#newsletter'}
            className="bg-white bg-opacity-20 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Subscribe
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-blue-200 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}