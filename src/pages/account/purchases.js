// src/pages/account/purchases.js
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { DocumentArrowDownIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Purchases() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/account/orders');
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (orderId, modelTitle) => {
    try {
      const response = await fetch(`/api/download/${orderId}`);
      
      if (response.ok) {
        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = modelTitle || 'model.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Refresh orders to update download count
        fetchOrders();
      } else {
        const error = await response.json();
        alert(error.message || 'Download failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Please try again.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view your purchase history.
            </p>
            <button
              onClick={() => signIn()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
            <p className="text-gray-600 mt-2">
              View and download your purchased financial models
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 mb-4">
                <DocumentArrowDownIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No purchases yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any models yet. Browse our collection to get started.
              </p>
              <a
                href="/models"
                className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Models
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {order.model_title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Purchase Date:</span>
                          <div>{new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="font-medium">Price:</span>
                          <div>${parseFloat(order.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                          <span className="font-medium">Downloads:</span>
                          <div>{order.download_count} of {order.max_downloads}</div>
                        </div>
                      </div>
                      
                      {/* Status and Expiry Info */}
                      <div className="flex items-center space-x-4 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'completed' ? 'Completed' : 'Processing'}
                        </span>
                        
                        {order.download_expires_at && (
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Expires: {new Date(order.download_expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Download Button */}
                    <div className="ml-4">
                      {order.status === 'completed' && 
                       order.download_count < order.max_downloads && 
                       new Date(order.download_expires_at) > new Date() ? (
                        <button
                          onClick={() => handleDownload(order.id, order.model_title)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                          Download
                        </button>
                      ) : (
                        <div className="text-sm text-gray-500 text-center">
                          {order.status !== 'completed' ? 'Processing...' :
                           order.download_count >= order.max_downloads ? 'Download limit reached' :
                           'Download expired'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}