// src/pages/purchase/success.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { CheckCircleIcon, DocumentArrowDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function PurchaseSuccess() {
  const router = useRouter();
  const { data: session } = useSession();
  const { session_id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session_id) {
      fetchOrderDetails();
    }
  }, [session_id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${session_id}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data);
      } else {
        setError(data.error || 'Failed to fetch order details');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/download/${order.id}`);
      
      if (response.ok) {
        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = order.model_title || 'model.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(error.message || 'Download failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ArrowPathIcon className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
            <p className="mt-4 text-gray-600">Processing your purchase...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Purchase Error
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/models')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Models
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Order not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Purchase Successful!
              </h1>
              <p className="text-gray-600">
                Thank you for your purchase. Your financial model is ready for download.
              </p>
            </div>

            {/* Order Details */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-gray-900">Model</dt>
                  <dd className="mt-1 text-gray-600">{order.model_title}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Price</dt>
                  <dd className="mt-1 text-gray-600">
                    ${parseFloat(order.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Purchase Date</dt>
                  <dd className="mt-1 text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Downloads Remaining</dt>
                  <dd className="mt-1 text-gray-600">
                    {order.max_downloads - order.download_count} of {order.max_downloads}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Download Section */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Download Your Model
              </h3>
              <p className="text-gray-600 mb-4">
                Your model download will expire on {new Date(order.download_expires_at).toLocaleDateString()}.
                You can download this file up to {order.max_downloads} times.
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Download Model
              </button>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                What's Next?
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Open the downloaded Excel file in Microsoft Excel or compatible software</li>
                <li>• Review the documentation tab for instructions and assumptions</li>
                <li>• Customize the model inputs to match your specific investment scenario</li>
                <li>• Contact our support team if you need assistance</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/models')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Browse More Models
              </button>
              <button
                onClick={() => router.push('/account/purchases')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Purchases
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Disable static generation to prevent build errors during prerendering  
export const getServerSideProps = async (context) => {
  return {
    props: {}
  };
};