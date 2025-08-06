import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

export default function CheckoutSuccess() {
  const router = useRouter();
  const { modelTitle, sessionId } = router.query;
  const [countdown, setCountdown] = useState(30); // Increased to 30 seconds
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    // Only run countdown if auto-redirect is enabled
    if (!autoRedirect) return;
    
    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/models');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, autoRedirect]);

  return (
    <Layout>
      <SEO
        title="Purchase Complete - Zenith Capital Advisors"
        description="Your financial model purchase has been completed successfully"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900 mb-8">
              <svg className="h-12 w-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Success Message */}
            <h1 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Thank you for your purchase. Your order has been processed successfully.
            </p>
            
            {/* Order Details Card */}
            <Card className="bg-white dark:bg-navy-800 p-8 mb-8 text-left max-w-2xl mx-auto">
              <div className="border-b border-gray-200 dark:border-navy-600 pb-6 mb-6">
                <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">
                  Order Confirmation
                </h2>
                {sessionId && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order ID: {sessionId}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Product:</span>
                  <span className="font-medium text-navy-700 dark:text-white">
                    {modelTitle || 'Financial Model'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Complete
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Delivery:</span>
                  <span className="text-navy-700 dark:text-white">Instant Download</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-2">Next Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Check your email for the download link</li>
                      <li>Download your financial model</li>
                      <li>Review the included documentation</li>
                      <li>Contact support if you need assistance</li>
                    </ol>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button href="/models" variant="primary" size="lg">
                Browse More Models
              </Button>
              
              <Button href="/contact" variant="secondary" size="lg">
                Contact Support
              </Button>
              
              <Button href="/customer-portal" variant="ghost" size="lg">
                View My Purchases
              </Button>
            </div>
            
            {/* Auto-redirect notice */}
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              {autoRedirect ? (
                <>
                  <p>
                    Redirecting to models page in {countdown} seconds...
                  </p>
                  <div className="mt-2 space-x-4">
                    <button 
                      onClick={() => setAutoRedirect(false)}
                      className="underline hover:text-teal-600 dark:hover:text-teal-400"
                    >
                      Stay on this page
                    </button>
                    <button 
                      onClick={() => router.push('/models')}
                      className="underline hover:text-teal-600 dark:hover:text-teal-400"
                    >
                      Go to models now
                    </button>
                  </div>
                </>
              ) : (
                <p>Auto-redirect disabled. Take your time to review your purchase details.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}