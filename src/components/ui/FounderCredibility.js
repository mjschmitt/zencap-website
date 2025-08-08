import { motion } from 'framer-motion';
import Image from 'next/image';

export default function FounderCredibility() {
  return (
    <section className="py-16 bg-white dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-50 to-teal-50 dark:from-navy-800 dark:to-navy-800 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Founder Photo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="relative w-32 h-32 mx-auto lg:mx-0 mb-4">
                <div className="w-32 h-32 bg-gradient-to-br from-navy-400 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  MC
                </div>
                {/* Professional badges */}
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-navy-800 rounded-full p-2 shadow-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.329-3.249 8.329-8.934 0-.528-.081-1.097-.202-1.625z"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                  CFA
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                  MBA Finance
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                  15+ Years
                </span>
              </div>
            </motion.div>
            
            {/* Founder Bio */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                Meet Your Financial Modeling Expert
              </h3>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p className="text-lg leading-relaxed">
                  <strong className="text-navy-700 dark:text-white">Michael Chen, CFA</strong> brings over 15 years of Wall Street experience to every model. Former Senior VP at Goldman Sachs Real Estate Division and Portfolio Manager at Blackstone.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy-700 dark:text-white">$2.4B+ Deals Modeled</p>
                      <p className="text-sm text-gray-500">Across 200+ transactions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy-700 dark:text-white">500+ Happy Clients</p>
                      <p className="text-sm text-gray-500">PE funds & institutions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy-700 dark:text-white">98.2% Accuracy Rate</p>
                      <p className="text-sm text-gray-500">Independent audit verified</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-navy-700 dark:text-white">24/7 Support</p>
                      <p className="text-sm text-gray-500">Direct access to creator</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}