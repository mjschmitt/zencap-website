import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TrustBadges from '@/components/ui/TrustBadges';

export default function Checkout() {
  const router = useRouter();
  const { modelId, modelSlug, modelTitle, modelPrice } = router.query;
  
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: ''
  });

  // Fetch model data if not provided in query params
  useEffect(() => {
    if (modelSlug && !model) {
      fetchModelData();
    } else if (modelId && modelTitle && modelPrice) {
      setModel({
        id: modelId,
        title: modelTitle,
        price: parseInt(modelPrice),
        slug: modelSlug
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [modelSlug, modelId, modelTitle, modelPrice]);

  const fetchModelData = async () => {
    try {
      const response = await fetch(`/api/models?slug=${modelSlug}`);
      if (response.ok) {
        const modelData = await response.json();
        setModel(modelData);
      }
    } catch (error) {
      console.error('Error fetching model:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: model.id,
          modelTitle: model.title,
          modelPrice: model.price,
          modelSlug: model.slug,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!model) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
              Model Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The requested model could not be found.
            </p>
            <Button href="/models" variant="primary">
              Browse All Models
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`Checkout - ${model.title}`}
        description="Complete your purchase of premium financial models from Zenith Capital Advisors"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Secure checkout for professional financial models
            </p>
            
            {/* Trust Badges */}
            <TrustBadges className="max-w-2xl mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Customer Information */}
            <div>
              <Card className="bg-white dark:bg-navy-800 p-6 mb-6">
                <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-4">
                  Customer Information
                </h2>
                
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-navy-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-navy-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-navy-700 dark:text-white"
                    />
                  </div>

                  {/* Payment Button */}
                  <div className="mt-8">
                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      fullWidth
                      disabled={processing}
                      className="relative"
                    >
                      {processing ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing Payment...
                        </div>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Complete Purchase - ${model.price.toLocaleString()}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
              
              {/* Security & Trust Badges */}
              <Card className="bg-white dark:bg-navy-800 p-6">
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
                  Secure Checkout
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      SSL encrypted secure checkout
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Instant download after payment
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      30-day email support included
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="bg-white dark:bg-navy-800 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-navy-700 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-navy-700 dark:text-white">
                        {model.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Professional Financial Model
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-teal-500">
                        ${model.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <hr className="border-gray-200 dark:border-navy-600" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">${model.price.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Processing Fee</span>
                      <span className="text-gray-900 dark:text-white">$0</span>
                    </div>
                  </div>
                  
                  <hr className="border-gray-200 dark:border-navy-600" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-navy-700 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-teal-500">${model.price.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">What's Included:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Full Excel model (.xlsx format)</li>
                        <li>Comprehensive documentation</li>
                        <li>30-day email support</li>
                        <li>Lifetime updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}