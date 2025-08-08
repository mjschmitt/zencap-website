// src/components/ui/PricingWithABTest.js - Pricing component with A/B testing

import React, { useState, useEffect } from 'react';
import { getTestVariant, trackTestExposure } from '../../utils/abTesting';
import { trackModelEngagement } from '../../utils/conversionTracking';

export default function PricingWithABTest({ model, location = 'default', className = "" }) {
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    const testVariant = getTestVariant('pricing_display_v1');
    if (testVariant) {
      setVariant(testVariant);
      // Track exposure
      trackTestExposure('pricing_display_v1', testVariant.variant, {
        modelSlug: model.slug,
        location,
        modelPrice: model.price
      });
    }
  }, [model.slug, location, model.price]);

  const handlePricingInteraction = (action) => {
    trackModelEngagement(model.slug, 'pricing_view', {
      location,
      action,
      testVariant: variant?.variant || 'control'
    });
  };

  // Control variant - standard pricing display
  if (!variant || variant.variant === 'control') {
    return (
      <div className={`pricing-display ${className}`}>
        <div className="flex items-baseline">
          <span className="text-3xl md:text-4xl font-bold text-white">
            ${model.price?.toLocaleString()}
          </span>
          <span className="ml-2 text-lg text-gray-300">USD</span>
        </div>
      </div>
    );
  }

  // Variant A - Value emphasis with guarantee
  if (variant.variant === 'variant_a') {
    const { config } = variant;
    
    return (
      <div className={`pricing-display-enhanced ${className}`}>
        <div className="space-y-4">
          {/* Price with strikethrough if configured */}
          <div className="pricing-container">
            {config.showStrikethrough && config.originalPrice && (
              <div className="original-price text-lg text-gray-400 line-through mb-1">
                Was ${config.originalPrice.toLocaleString()}
              </div>
            )}
            <div className="flex items-baseline">
              <span className="text-4xl md:text-5xl font-bold text-teal-400">
                ${model.price?.toLocaleString()}
              </span>
              <span className="ml-2 text-lg text-gray-300">USD</span>
            </div>
            {config.showStrikethrough && config.originalPrice && (
              <div className="savings text-green-400 font-semibold mt-1">
                Save ${(config.originalPrice - model.price).toLocaleString()}!
              </div>
            )}
          </div>
          
          {/* Value propositions */}
          {config.valueProps && config.valueProps.length > 0 && (
            <div className="value-props bg-teal-900/30 backdrop-blur-sm rounded-lg p-4 border border-teal-500/30">
              <div className="text-sm font-semibold text-teal-200 mb-2">
                What's Included:
              </div>
              <ul className="text-sm text-gray-200 space-y-1">
                {config.valueProps.map((prop, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-teal-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{prop}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Money-back guarantee */}
          {config.showMoneyBackGuarantee && (
            <div className="guarantee">
              <div className="inline-flex items-center bg-green-900/40 text-green-200 px-4 py-2 rounded-full text-sm font-medium border border-green-500/30">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                30-Day Money-Back Guarantee
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback to control
  return (
    <div className={`pricing-display ${className}`}>
      <div className="flex items-baseline">
        <span className="text-3xl md:text-4xl font-bold text-white">
          ${model.price?.toLocaleString()}
        </span>
        <span className="ml-2 text-lg text-gray-300">USD</span>
      </div>
    </div>
  );
}

/**
 * Enhanced Buy Now Button with A/B testing integration
 */
export function BuyNowButtonWithTracking({ 
  model, 
  location = 'default', 
  variant = 'primary',
  size = 'lg',
  children,
  className = "",
  ...props 
}) {
  const handleClick = () => {
    trackModelEngagement(model.slug, 'pricing_view', {
      location,
      action: 'buy_now_click',
      modelPrice: model.price
    });
  };

  const baseClasses = {
    primary: "bg-teal-500 hover:bg-teal-600 text-white",
    secondary: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy-700",
    accent: "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const classes = `
    inline-flex items-center font-semibold rounded-lg 
    transition-all duration-200 shadow-lg hover:shadow-xl 
    transform hover:-translate-y-1
    ${baseClasses[variant]} ${sizeClasses[size]} ${className}
  `.trim();

  return (
    <button
      onClick={handleClick}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}