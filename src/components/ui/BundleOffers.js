import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BundleOffers() {
  const bundles = [
    {
      id: 'pe-starter',
      name: 'Private Equity Starter Pack',
      description: 'Perfect for getting started with PE real estate modeling',
      models: ['Multifamily Development', 'Multifamily Acquisition', 'Commercial Acquisition'],
      originalPrice: 29625,
      bundlePrice: 17775,
      savings: 11850,
      mostPopular: true,
      features: [
        'Three complete PE models',
        'Detailed instruction guides',
        'Sample data sets',
        '90-day email support',
        'Free updates for 1 year'
      ]
    },
    {
      id: 'complete-suite',
      name: 'Complete Financial Modeling Suite',
      description: 'Everything you need for comprehensive investment analysis',
      models: ['All 8 Private Equity Models', 'All 5 Public Equity Models'],
      originalPrice: 152750,
      bundlePrice: 91650,
      savings: 61100,
      mostPopular: false,
      features: [
        'All 13 premium models',
        'Comprehensive documentation',
        'Video tutorials library',
        'Priority email & phone support',
        'Lifetime free updates',
        'Custom model consultation (1 hour)',
        'Exclusive investor community access'
      ]
    },
    {
      id: 'hospitality-focus',
      name: 'Hospitality Investment Bundle',
      description: 'Specialized models for hotel and resort investments',
      models: ['Hospitality Development', 'Hospitality Acquisition', 'Mixed-Use with Hotel'],
      originalPrice: 29625,
      bundlePrice: 19775,
      savings: 9850,
      mostPopular: false,
      features: [
        'Three hospitality-focused models',
        'Industry-specific metrics',
        'RevPAR analysis tools',
        '60-day email support',
        'Quarterly model updates'
      ]
    }
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
            Save Big with Bundle Packages
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get multiple models at significant discounts. Perfect for institutions and serious investors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {bundles.map((bundle, index) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white dark:bg-navy-800 rounded-2xl shadow-lg overflow-hidden ${
                bundle.mostPopular ? 'ring-2 ring-teal-500 transform scale-105' : ''
              }`}
            >
              {bundle.mostPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-center py-2 font-medium">
                  MOST POPULAR - BEST VALUE
                </div>
              )}
              
              <div className={`p-8 ${bundle.mostPopular ? 'pt-12' : ''}`}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">
                    {bundle.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {bundle.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 line-through mb-1">
                      Was ${bundle.originalPrice.toLocaleString()}
                    </div>
                    <div className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                      ${bundle.bundlePrice.toLocaleString()}
                    </div>
                    <div className="text-lg font-medium text-green-600 dark:text-green-400">
                      Save ${bundle.savings.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-navy-700 dark:text-white mb-3">
                    Includes:
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {bundle.models.map((model, idx) => (
                      <div key={idx} className="flex items-center">
                        <svg className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {model}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-navy-700 dark:text-white mb-3">
                    Bundle Benefits:
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {bundle.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Link
                  href={`/contact?bundle=${bundle.id}`}
                  className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                    bundle.mostPopular
                      ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-600 hover:to-blue-700 transform hover:-translate-y-1 shadow-lg'
                      : 'bg-navy-700 text-white hover:bg-navy-800'
                  }`}
                >
                  Get This Bundle
                </Link>
                
                {bundle.mostPopular && (
                  <div className="text-center mt-4 text-sm text-gray-500">
                    🔥 Limited time offer - Save 69%!
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="bg-blue-50 dark:bg-navy-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
              Need a Custom Bundle?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Contact us for enterprise pricing or custom model combinations tailored to your specific needs.
            </p>
            <Link
              href="/contact?type=custom-bundle"
              className="inline-flex items-center px-6 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              Request Custom Quote
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}