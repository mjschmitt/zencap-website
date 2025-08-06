import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

export default function CheckoutCancel() {
  const router = useRouter();
  const { modelTitle, modelSlug } = router.query;
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (modelSlug) {
            router.push(`/models/${modelSlug}`);
          } else {
            router.push('/models');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, modelSlug]);

  return (
    <Layout>
      <SEO
        title="Payment Cancelled - Zenith Capital Advisors"
        description="Your payment was cancelled. You can try again anytime."
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Cancel Icon */}
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-orange-100 dark:bg-orange-900 mb-8">
              <svg className="h-12 w-12 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Cancel Message */}
            <h1 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
              Payment Cancelled
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Your payment was cancelled. No charges were made to your account.
            </p>
            
            {/* Information Card */}
            <Card className="bg-white dark:bg-navy-800 p-8 mb-8 text-left max-w-2xl mx-auto">
              <div className="border-b border-gray-200 dark:border-navy-600 pb-6 mb-6">
                <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">
                  What Happened?
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Your payment process was interrupted or cancelled before completion.
                </p>
              </div>
              
              {modelTitle && (
                <div className="mb-6">
                  <h3 className="font-medium text-navy-700 dark:text-white mb-2">
                    Product you were purchasing:
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {modelTitle}
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-2">Need Help?</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Try the checkout process again</li>
                      <li>Check your payment method details</li>
                      <li>Contact our support team if issues persist</li>
                      <li>All models remain available for purchase</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {modelSlug ? (
                <Button 
                  href={`/models/${modelSlug}`} 
                  variant="primary" 
                  size="lg"
                  className="flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Try Purchase Again
                </Button>
              ) : (
                <Button href="/models" variant="primary" size="lg">
                  Browse All Models
                </Button>
              )}
              
              <Button href="/contact" variant="secondary" size="lg">
                Get Help
              </Button>
              
              <Button href="/" variant="ghost" size="lg">
                Return Home
              </Button>
            </div>
            
            {/* Auto-redirect notice */}
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p>
                Redirecting back to {modelTitle ? 'model page' : 'models'} in {countdown} seconds...
              </p>
              <button 
                onClick={() => modelSlug ? router.push(`/models/${modelSlug}`) : router.push('/models')}
                className="underline hover:text-teal-600 dark:hover:text-teal-400"
              >
                Skip waiting
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}