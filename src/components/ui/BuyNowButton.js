// src/components/ui/BuyNowButton.js
import { useState } from 'react';

export default function BuyNowButton({ 
  modelId,
  modelSlug, 
  modelTitle, 
  modelPrice, 
  className = '', 
  children = null,
  variant = 'primary',
  size = 'lg'
}) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    // No authentication required - direct to checkout
    setLoading(true);

    try {
      // Create checkout session without authentication
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: modelId,
          modelSlug: modelSlug,
          modelTitle: modelTitle,
          modelPrice: modelPrice,
          customerEmail: '', // Will be collected at Stripe checkout
          customerName: '',  // Will be collected at Stripe checkout
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        alert(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    accent: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const buttonClass = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className={buttonClass}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processing...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Buy Now - ${modelPrice?.toLocaleString() || '0'}
        </>
      )}
    </button>
  );
}