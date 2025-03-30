// src/components/layout/Header.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import DarkModeToggle from '../ui/DarkModeToggle';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);
  
  // Close mobile menu when pressing escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);
  
  return (
    <header className="bg-white dark:bg-navy-900 shadow-sm dark:shadow-navy-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="h-8 w-8 mr-2 bg-navy-700 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-gold-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                </div>
                <span className="text-navy-700 dark:text-white font-serif text-2xl font-bold">Zenith</span>
                <span className="text-navy-600 dark:text-gray-300 font-sans text-lg ml-1">Capital Advisors</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation and Dark Mode Toggle */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <DarkModeToggle />
            <Navbar />
          </div>
          
          {/* Mobile menu button and Dark Mode Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <DarkModeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-navy-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg 
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon when menu is open */}
              <svg 
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - Improved with animation and better UX */}
      <div 
        className={`md:hidden fixed inset-0 z-50 bg-navy-900 bg-opacity-80 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className="absolute right-0 h-full w-3/4 max-w-sm bg-white dark:bg-navy-800 shadow-xl transform transition-transform duration-300 ease-in-out"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-4 pt-5 pb-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="h-8 w-8 mr-2 bg-navy-700 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-gold-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                </div>
                <span className="text-navy-700 dark:text-white font-serif text-xl font-bold">Zenith</span>
              </div>
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-navy-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="flex-1 mt-4 space-y-2">
              <Link href="/">
                <div className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname === '/' ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}>
                  Home
                </div>
              </Link>
              <Link href="/about">
                <div className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname === '/about' ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}>
                  About
                </div>
              </Link>
              
              {/* Products Section */}
              <div className="space-y-1">
                <Link href="/products">
                  <div className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname.startsWith('/products') ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}>
                    Products
                  </div>
                </Link>
                <div className="pl-8 space-y-1">
                  <Link href="/products/private-equity">
                    <div className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/products/private-equity' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}>
                      Private Equity Models
                    </div>
                  </Link>
                  <Link href="/products/public-equity">
                    <div className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/products/public-equity' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}>
                      Public Equity Models
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Services Section */}
              <div className="space-y-1">
                <Link href="/services">
                  <div className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname.startsWith('/services') ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}>
                    Services
                  </div>
                </Link>
                <div className="pl-8 space-y-1">
                  <Link href="/services/financial-modeling">
                    <div className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/services/financial-modeling' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}>
                      Financial Modeling
                    </div>
                  </Link>
                  <Link href="/services/infrastructure">
                    <div className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/services/infrastructure' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}>
                      Investment Infrastructure
                    </div>
                  </Link>
                  <Link href="/services/research">
                    <div className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/services/research' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}>
                      Industry Research
                    </div>
                  </Link>
                </div>
              </div>
              
              <Link href="/contact">
                <div className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname === '/contact' ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}>
                  Contact
                </div>
              </Link>
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-navy-700">
              <Link href="/contact">
                <div className="block w-full px-4 py-3 text-center rounded-md shadow bg-gold-500 text-navy-900 font-medium hover:bg-gold-600 transition duration-150 ease-in-out">
                  Get In Touch
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}