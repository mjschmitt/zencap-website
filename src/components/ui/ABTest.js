// src/components/ui/ABTest.js - A/B Testing React Components

import React, { useState, useEffect, createContext, useContext } from 'react';
import { getTestVariant, trackTestExposure, trackPageView } from '../../utils/abTesting';

// Context for sharing A/B test results across components
const ABTestContext = createContext({});

/**
 * A/B Test Provider - wrap your app with this
 */
export function ABTestProvider({ children }) {
  const [testResults, setTestResults] = useState({});
  
  useEffect(() => {
    // Track page view for segmentation
    if (typeof window !== 'undefined') {
      trackPageView(window.location.pathname);
    }
  }, []);

  const getTest = (testId) => {
    if (testResults[testId]) {
      return testResults[testId];
    }

    const variant = getTestVariant(testId);
    if (variant) {
      setTestResults(prev => ({ ...prev, [testId]: variant }));
      return variant;
    }
    return null;
  };

  return (
    <ABTestContext.Provider value={{ testResults, getTest }}>
      {children}
    </ABTestContext.Provider>
  );
}

/**
 * Hook to access A/B test results
 */
export function useABTest(testId) {
  const { getTest } = useContext(ABTestContext);
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    const testResult = getTest(testId);
    if (testResult) {
      setVariant(testResult);
      // Track exposure
      trackTestExposure(testId, testResult.variant);
    }
  }, [testId, getTest]);

  return variant;
}

/**
 * A/B Test Component - renders different variants
 */
export function ABTest({ testId, children, fallback = null }) {
  const variant = useABTest(testId);

  if (!variant) {
    return fallback;
  }

  // If children is a function, call it with the variant
  if (typeof children === 'function') {
    return children(variant);
  }

  // If children is an object with variant keys, render the matching variant
  if (React.isValidElement(children)) {
    return React.cloneElement(children, { variant });
  }

  // If children is an object with variant names as keys
  if (typeof children === 'object' && children[variant.variant]) {
    return children[variant.variant];
  }

  return fallback;
}

/**
 * Pricing Display A/B Test Component
 */
export function PricingABTest({ model, children }) {
  const variant = useABTest('pricing_display_v1');

  if (!variant) {
    // Default pricing display
    return (
      <div className="pricing-display">
        <div className="price text-3xl font-bold text-navy-600">
          ${model.price?.toLocaleString()}
        </div>
        {children}
      </div>
    );
  }

  if (variant.variant === 'variant_a') {
    // Value emphasis variant
    const { config } = variant;
    return (
      <div className="pricing-display value-emphasis">
        <div className="price-container">
          {config.showStrikethrough && config.originalPrice && (
            <div className="original-price text-lg text-gray-500 line-through">
              ${config.originalPrice.toLocaleString()}
            </div>
          )}
          <div className="price text-4xl font-bold text-teal-600">
            ${model.price?.toLocaleString()}
          </div>
          {config.showStrikethrough && config.originalPrice && (
            <div className="savings text-sm font-semibold text-green-600">
              Save ${(config.originalPrice - model.price).toLocaleString()}!
            </div>
          )}
        </div>
        
        {config.valueProps && config.valueProps.length > 0 && (
          <div className="value-props mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="text-sm font-semibold text-teal-800 mb-2">What's Included:</div>
            <ul className="text-sm text-teal-700 space-y-1">
              {config.valueProps.map((prop, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-teal-600 mr-2">✓</span>
                  {prop}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {config.showMoneyBackGuarantee && (
          <div className="guarantee mt-3 text-center">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              30-Day Money-Back Guarantee
            </div>
          </div>
        )}
        
        {children}
      </div>
    );
  }

  // Control variant - standard display
  return (
    <div className="pricing-display">
      <div className="price text-3xl font-bold text-navy-600">
        ${model.price?.toLocaleString()}
      </div>
      {children}
    </div>
  );
}

/**
 * Email Capture A/B Test Component
 */
export function EmailCaptureABTest({ onSubmit, className = "" }) {
  const variant = useABTest('email_capture_v1');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && onSubmit) {
      onSubmit(email, variant?.variant || 'control');
    }
  };

  if (!variant || variant.variant === 'control') {
    // Control: Simple newsletter signup
    return (
      <form onSubmit={handleSubmit} className={`newsletter-signup ${className}`}>
        <div className="text-lg font-semibold mb-2">Stay Updated</div>
        <div className="text-gray-600 mb-4">Get the latest insights delivered to your inbox</div>
        <div className="flex">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 transition-colors"
          >
            Subscribe
          </button>
        </div>
      </form>
    );
  }

  if (variant.variant === 'variant_a') {
    // Variant A: Free sample model
    return (
      <form onSubmit={handleSubmit} className={`lead-magnet-signup ${className}`}>
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg border border-teal-200">
          <div className="text-xl font-bold text-navy-600 mb-2">
            Get Your Free DCF Template
          </div>
          <div className="text-gray-700 mb-1">
            Professional-grade discounted cash flow model
          </div>
          <div className="text-sm text-teal-600 font-semibold mb-4">
            {variant.config.incentiveValue} • Download instantly
          </div>
          
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email for instant access"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 transition-colors font-semibold"
            >
              Get Free Template
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            No spam. Unsubscribe anytime. Used by 500+ investment professionals.
          </div>
        </div>
      </form>
    );
  }

  if (variant.variant === 'variant_b') {
    // Variant B: Market insights focus
    return (
      <form onSubmit={handleSubmit} className={`insights-signup ${className}`}>
        <div className="bg-gradient-to-r from-blue-50 to-navy-50 p-6 rounded-lg border border-blue-200">
          <div className="text-xl font-bold text-navy-600 mb-2">
            Weekly Market Analysis
          </div>
          <div className="text-gray-700 mb-1">
            {variant.config.incentiveValue} from Wall Street veterans
          </div>
          <div className="text-sm text-blue-600 font-semibold mb-4">
            Market trends • Deal flow • Investment opportunities
          </div>
          
          <div className="flex">
            <input
              type="email"
              placeholder="Get weekly market insights"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Subscribe
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            Join 1,000+ investment professionals • Free forever
          </div>
        </div>
      </form>
    );
  }

  // Fallback to control
  return (
    <form onSubmit={handleSubmit} className={`newsletter-signup ${className}`}>
      <div className="text-lg font-semibold mb-2">Stay Updated</div>
      <div className="text-gray-600 mb-4">Get the latest insights delivered to your inbox</div>
      <div className="flex">
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 transition-colors"
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}

/**
 * Conversion Button with A/B Testing
 */
export function ConversionButton({ 
  children, 
  onClick, 
  goal = 'button_click',
  value = null,
  className = "",
  ...props 
}) {
  const handleClick = async (e) => {
    // Track conversion
    await trackConversion(goal, value, {
      buttonText: typeof children === 'string' ? children : 'button',
      page: typeof window !== 'undefined' ? window.location.pathname : null
    });
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}