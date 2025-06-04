// src/components/layout/Navbar.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [modelsOpen, setModelsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  
  // Function to determine if a link is active
  const isActive = (path) => {
    if (router.pathname === path || router.pathname.startsWith(`${path}/`)) {
      return 'text-teal-500 font-medium';
    }
    return 'text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-teal-300';
  };
  
  return (
    <nav className="flex space-x-8 items-center">
      <Link href="/" className={`cursor-pointer px-3 py-2 rounded-md text-sm flex items-center ${isActive('/')}`}>
        Home
      </Link>
      
      <Link href="/about" className={`cursor-pointer px-3 py-2 rounded-md text-sm flex items-center ${isActive('/about')}`}>
        About
      </Link>
      
      {/* Models Dropdown */}
      <div 
        className="relative z-50"
        onMouseEnter={() => setModelsOpen(true)}
        onMouseLeave={() => setModelsOpen(false)}
      >
        <Link 
          href="/models" 
          className={`cursor-pointer px-3 py-2 rounded-md text-sm flex items-center ${router.pathname === '/models' || router.pathname.startsWith('/models/') ? 'text-teal-500 font-medium' : 'text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-teal-300'}`}
        >
          Models
          <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Link>
        
        <div className={`absolute left-0 w-48 pt-3 transition-all duration-200 ease-in-out z-[100] ${
          modelsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          <div className="bg-white dark:bg-navy-800 rounded-md shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-navy-700">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <Link 
                href="/models/private-equity" 
                className={`block px-4 py-3 text-sm cursor-pointer transition-colors duration-150 ${
                  router.pathname === '/models/private-equity' 
                    ? 'text-teal-500 font-medium bg-gray-50 dark:bg-navy-700' 
                    : 'text-navy-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-navy-700'
                }`} 
                role="menuitem"
              >
                Private Equity Models
              </Link>
              <Link 
                href="/models/public-equity" 
                className={`block px-4 py-3 text-sm cursor-pointer transition-colors duration-150 ${
                  router.pathname === '/models/public-equity' 
                    ? 'text-teal-500 font-medium bg-gray-50 dark:bg-navy-700' 
                    : 'text-navy-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-navy-700'
                }`} 
                role="menuitem"
              >
                Public Equity Models
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Solutions Dropdown */}
      <div 
        className="relative z-50"
        onMouseEnter={() => setSolutionsOpen(true)}
        onMouseLeave={() => setSolutionsOpen(false)}
      >
        <Link 
          href="/solutions" 
          className={`cursor-pointer px-3 py-2 rounded-md text-sm flex items-center ${router.pathname === '/solutions' || router.pathname.startsWith('/solutions/') ? 'text-teal-500 font-medium' : 'text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-teal-300'}`}
        >
          Solutions
          <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Link>
        
        <div className={`absolute left-0 w-48 pt-3 transition-all duration-200 ease-in-out z-[100] ${
          solutionsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          <div className="bg-white dark:bg-navy-800 rounded-md shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-navy-700">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <Link 
                href="/solutions/financial-modeling" 
                className={`block px-4 py-3 text-sm cursor-pointer transition-colors duration-150 ${
                  router.pathname === '/solutions/financial-modeling' 
                    ? 'text-teal-500 font-medium bg-gray-50 dark:bg-navy-700' 
                    : 'text-navy-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-navy-700'
                }`} 
                role="menuitem"
              >
                Financial Modeling
              </Link>
              <Link 
                href="/solutions/infrastructure" 
                className={`block px-4 py-3 text-sm cursor-pointer transition-colors duration-150 ${
                  router.pathname === '/solutions/infrastructure' 
                    ? 'text-teal-500 font-medium bg-gray-50 dark:bg-navy-700' 
                    : 'text-navy-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-navy-700'
                }`} 
                role="menuitem"
              >
                Investment Infrastructure
              </Link>
              <Link 
                href="/solutions/research" 
                className={`block px-4 py-3 text-sm cursor-pointer transition-colors duration-150 ${
                  router.pathname === '/solutions/research' 
                    ? 'text-teal-500 font-medium bg-gray-50 dark:bg-navy-700' 
                    : 'text-navy-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-navy-700'
                }`} 
                role="menuitem"
              >
                Industry Research
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Insights Link */}
      <Link href="/insights" className={`cursor-pointer px-3 py-2 rounded-md text-sm flex items-center ${isActive('/insights')}`}>
        Insights
      </Link>
      
      <Link href="/contact" className={`cursor-pointer px-3 py-2 rounded-md text-sm flex items-center ${isActive('/contact')}`}>
        Contact
      </Link>
    </nav>
  );
}