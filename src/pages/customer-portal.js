import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CustomerPortal() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState([]);

  // Mock data for demonstration
  const mockPurchases = [
    {
      id: 1,
      title: 'NVIDIA (NVDA) 3-Statement Model',
      price: 4985,
      purchaseDate: '2025-01-15',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Multifamily Development Model',
      price: 4985,
      purchaseDate: '2025-01-10',
      status: 'completed',
      downloadUrl: '#'
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful login
    if (email) {
      setIsLoggedIn(true);
      setPurchases(mockPurchases);
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isLoggedIn) {
    return (
      <Layout>
        <SEO
          title="Customer Portal - Zenith Capital Advisors"
          description="Access your purchased financial models and account information"
        />
        
        <div className="min-h-screen bg-gray-50 dark:bg-navy-900 py-12">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-900 mb-6">
                <svg className="h-8 w-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Customer Portal
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Access your purchased financial models
              </p>
            </div>
            
            <Card className="bg-white dark:bg-navy-800 p-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-navy-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use the email address you used for your purchase
                  </p>
                </div>
                
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  fullWidth
                  disabled={loading || !email}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Accessing Portal...
                    </div>
                  ) : (
                    'Access My Purchases'
                  )}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Need Help?</p>
                    <p>If you can't access your purchases, please <a href="/contact" className="underline">contact our support team</a> with your order details.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="My Purchases - Zenith Capital Advisors"
        description="View and download your purchased financial models"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-navy-700 dark:text-white mb-2">
                My Purchases
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back! Here are your purchased financial models.
              </p>
            </div>
            
            <Button
              onClick={() => {
                setIsLoggedIn(false);
                setEmail('');
                setPurchases([]);
              }}
              variant="ghost"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
          
          {/* Account Info */}
          <Card className="bg-white dark:bg-navy-800 p-6 mb-8">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mr-4">
                <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                  {email}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Customer since January 2025
                </p>
              </div>
            </div>
          </Card>
          
          {/* Purchases List */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
                Your Models ({purchases.length})
              </h2>
            </div>
            
            {purchases.length === 0 ? (
              <Card className="bg-white dark:bg-navy-800 p-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 dark:bg-navy-700 flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  No purchases yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Browse our collection of professional financial models to get started.
                </p>
                <Button href="/models" variant="primary" size="lg">
                  Browse Models
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="bg-white dark:bg-navy-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gray-200 dark:bg-navy-700 rounded-lg flex items-center justify-center">
                          <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                            {purchase.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Purchased on {formatDate(purchase.purchaseDate)}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {purchase.status}
                            </span>
                            <span className="ml-4 text-lg font-bold text-teal-500">
                              ${purchase.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button
                          href={purchase.downloadUrl}
                          variant="accent"
                          size="sm"
                          className="flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </Button>
                        
                        <Button
                          href="/contact"
                          variant="ghost"
                          size="sm"
                          className="flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Support
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Support Section */}
          <Card className="bg-white dark:bg-navy-800 p-6 mt-8">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-teal-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-navy-700 dark:text-white mb-1">
                    Technical Support
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get help with using your financial models
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-5 h-5 text-teal-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="font-medium text-navy-700 dark:text-white mb-1">
                    Re-download Files
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Download your models again anytime
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button href="/contact" variant="secondary" size="lg">
                Contact Support Team
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}