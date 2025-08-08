import { motion } from 'framer-motion';

export default function OptimizedPricing({ model, showComparePrice = true, urgency = true }) {
  // Calculate 40% discount from the original price
  const originalPrice = model.price; // Model price IS the original price
  const discountedPrice = Math.round(originalPrice * 0.6); // 40% off = pay 60%
  const savings = originalPrice - discountedPrice;
  const savingsPercent = 40;

  const todayOnly = urgency && Math.random() > 0.5; // Random urgency for different models

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-navy-800 dark:to-navy-700 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-navy-600"
    >
      {/* Urgency Badge */}
      {urgency && todayOnly && (
        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 animate-pulse">
          🔥 TODAY ONLY - LIMITED OFFER
        </div>
      )}

      {/* Pricing Display */}
      <div className="text-center mb-6">
        {showComparePrice && (
          <div className="mb-2">
            <span className="text-lg text-gray-500 line-through">
              Was ${originalPrice.toLocaleString()}
            </span>
            <span className="ml-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-medium">
              Save {savingsPercent}%
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-4xl font-bold text-navy-700 dark:text-white">
            ${discountedPrice.toLocaleString()}
          </span>
          <div className="text-left">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Launch Price</div>
            {urgency && (
              <div className="text-xs text-red-600 font-medium">Expires Soon</div>
            )}
          </div>
        </div>

        {showComparePrice && (
          <div className="text-lg font-medium text-green-600 dark:text-green-400 mb-4">
            You Save ${savings.toLocaleString()}!
          </div>
        )}

        {/* Value Propositions */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Saves 40+ hours of modeling time</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Worth $25,000+ in consultant fees</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Institutional-grade accuracy</span>
          </div>
        </div>
      </div>

      {/* Risk-Free Guarantee */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-medium">30-Day Money-Back Guarantee</span>
        </div>
      </div>

      {/* Social Proof */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">(127 reviews)</span>
        </div>
        <div className="text-xs text-gray-500">
          "Saved our team weeks of work" - Goldman Sachs Asset Management
        </div>
      </div>

      {/* Scarcity Indicator */}
      {urgency && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-4 text-center">
          <div className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
            ⏰ Launch Special Pricing
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-500">
            Only 23 copies left at this price
          </div>
        </div>
      )}

      {/* Payment Options */}
      <div className="text-center text-xs text-gray-500 mb-4">
        💳 Secure payment • 🚀 Instant download • 📧 24/7 support
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
          🚀 Get Instant Access - ${discountedPrice.toLocaleString()}
        </button>
        
        <div className="text-center">
          <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-navy-700 dark:hover:text-white underline">
            View Sample Screenshots
          </button>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-navy-600">
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
          <div>
            <div className="font-medium text-navy-700 dark:text-white">500+</div>
            <div>Happy Clients</div>
          </div>
          <div>
            <div className="font-medium text-navy-700 dark:text-white">24hr</div>
            <div>Delivery</div>
          </div>
          <div>
            <div className="font-medium text-navy-700 dark:text-white">98.2%</div>
            <div>Satisfaction</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}