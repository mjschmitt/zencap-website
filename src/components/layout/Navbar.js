// src/components/layout/Navbar.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  
  // Function to determine if a link is active
  const isActive = (path) => {
    if (router.pathname === path || router.pathname.startsWith(`${path}/`)) {
      return 'text-teal-500 font-medium'; // Changed from gold to teal
    }
    return 'text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-teal-300';
  };
  
  return (
    <nav className="flex space-x-8">
      <Link href="/" className={`cursor-pointer px-3 py-2 rounded-md text-sm ${isActive('/')}`}>
        Home
      </Link>
      
      <Link href="/about" className={`cursor-pointer px-3 py-2 rounded-md text-sm ${isActive('/about')}`}>
        About
      </Link>
      
      {/* Products Dropdown - Fixed positioning and added sufficient spacing */}
      <div className="relative group">
        <Link 
          href="/products" 
          className={`cursor-pointer px-3 py-2 rounded-md text-sm ${router.pathname === '/products' || router.pathname.startsWith('/products/') ? 'text-teal-500 font-medium' : 'text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-teal-300'}`}
        >
          Products
          <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Link>
        
        {/* Added padding-top to create buffer space */}
        <div className="absolute left-0 w-48 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 ease-in-out">
          <div className="bg-white dark:bg-navy-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <Link 
                href="/products/private-equity" 
                className={`block px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-navy-700 cursor-pointer ${router.pathname === '/products/private-equity' ? 'text-teal-500 font-medium' : 'text-navy-700 dark:text-gray-300'}`} 
                role="menuitem"
              >
                Private Equity Models
              </Link>
              <Link 
                href="/products/public-equity" 
                className={`block px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-navy-700 cursor-pointer ${router.pathname === '/products/public-equity' ? 'text-teal-500 font-medium' : 'text-navy-700 dark:text-gray-300'}`} 
                role="menuitem"
              >
                Public Equity Models
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Services Dropdown - Fixed positioning and added sufficient spacing */}
      <div className="relative group">
        <Link 
          href="/services" 
          className={`cursor-pointer px-3 py-2 rounded-md text-sm ${router.pathname === '/services' || router.pathname.startsWith('/services/') ? 'text-teal-500 font-medium' : 'text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-teal-300'}`}
        >
          Services
          <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Link>
        
        {/* Added padding-top to create buffer space */}
        <div className="absolute left-0 w-48 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 ease-in-out">
          <div className="bg-white dark:bg-navy-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <Link 
                href="/services/financial-modeling" 
                className={`block px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-navy-700 cursor-pointer ${router.pathname === '/services/financial-modeling' ? 'text-teal-500 font-medium' : 'text-navy-700 dark:text-gray-300'}`} 
                role="menuitem"
              >
                Financial Modeling
              </Link>
              <Link 
                href="/services/infrastructure" 
                className={`block px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-navy-700 cursor-pointer ${router.pathname === '/services/infrastructure' ? 'text-teal-500 font-medium' : 'text-navy-700 dark:text-gray-300'}`} 
                role="menuitem"
              >
                Investment Infrastructure
              </Link>
              <Link 
                href="/services/research" 
                className={`block px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-navy-700 cursor-pointer ${router.pathname === '/services/research' ? 'text-teal-500 font-medium' : 'text-navy-700 dark:text-gray-300'}`} 
                role="menuitem"
              >
                Industry Research
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Insights Link - New addition */}
      <Link href="/insights" className={`cursor-pointer px-3 py-2 rounded-md text-sm ${isActive('/insights')}`}>
        Insights
      </Link>
      
      <Link href="/contact" className={`cursor-pointer px-3 py-2 rounded-md text-sm ${isActive('/contact')}`}>
        Contact
      </Link>
    </nav>
  );
}