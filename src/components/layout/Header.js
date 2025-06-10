// src/components/layout/Header.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import DarkModeToggle from '../ui/DarkModeToggle';
import ZenithLogo from '../ui/ZenithLogo';

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
    <header className="bg-white dark:bg-navy-900 shadow-sm dark:shadow-navy-800 transition-colors duration-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <ZenithLogo className="hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Navbar />
            <DarkModeToggle />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <DarkModeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-navy-700 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition duration-150 ease-in-out"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-navy-900 border-t border-gray-200 dark:border-navy-700">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname === '/' ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}
              >
                Home
              </Link>
              
              <Link 
                href="/about" 
                className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname === '/about' ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}
              >
                About
              </Link>
              
              {/* Models Submenu */}
              <div className="pl-4">
                <div className="text-navy-700 dark:text-gray-300 text-sm font-medium mb-2">Models</div>
                <div className="space-y-1">
                  <Link 
                    href="/models" 
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/models' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                    All Models
                  </Link>
                  <Link 
                    href="/models/private-equity" 
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/models/private-equity' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                    Private Equity
                  </Link>
                  <Link 
                    href="/models/public-equity" 
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/models/public-equity' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                    Public Equity
                  </Link>
                </div>
              </div>
              
              {/* Solutions Submenu */}
              <div className="pl-4">
                <div className="text-navy-700 dark:text-gray-300 text-sm font-medium mb-2">Solutions</div>
                <div className="space-y-1">
                  <Link 
                    href="/solutions" 
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/solutions' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                    All Solutions
                  </Link>
                  <Link 
                    href="/solutions/financial-modeling" 
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/solutions/financial-modeling' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                    Financial Modeling
                  </Link>
                  <Link 
                    href="/solutions/infrastructure" 
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/solutions/infrastructure' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                    Investment Infrastructure
                  </Link>
                  <Link 
                    href="/solutions/research" 
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/solutions/research' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                    Industry Research
                  </Link>
                </div>
              </div>
              
              {/* Insights Link */}
              <Link 
                href="/insights" 
                className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname.startsWith('/insights') ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}
              >
                Insights
              </Link>
              
              <Link 
                href="/contact" 
                className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname === '/contact' ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}
              >
                Contact
              </Link>
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-navy-700">
              <Link 
                href="/contact" 
                className="block w-full px-4 py-3 text-center rounded-md shadow bg-teal-500 text-white font-medium hover:bg-teal-600 transition duration-150 ease-in-out"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}