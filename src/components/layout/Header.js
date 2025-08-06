// src/components/layout/Header.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import Navbar from './Navbar';
import DarkModeToggle from '../ui/DarkModeToggle';
import dynamic from 'next/dynamic';

// Dynamically import search component for better performance
const SearchComponent = dynamic(() => import('../ui/SearchComponent'), {
  loading: () => (
    <div className="w-full max-w-md">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  ),
  ssr: false
});

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [router.pathname]);
  
  // Close menus when pressing escape key or clicking outside
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [userMenuOpen]);
  
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
    <header className="sticky top-0 z-40 bg-white dark:bg-navy-900 shadow-sm dark:shadow-navy-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center cursor-pointer">
              <div className="h-8 w-8 mr-2 bg-navy-700 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-teal-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
              </div>
              <span className="text-navy-700 dark:text-white font-serif text-2xl font-bold">Zenith</span>
              <span className="text-navy-600 dark:text-gray-300 font-sans text-lg ml-1">Capital Advisors</span>
            </Link>
          </div>
          
          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <SearchComponent />
          </div>
          
          {/* Desktop Navigation and Dark Mode Toggle */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <DarkModeToggle />
            <Navbar />
            
            {/* User Authentication */}
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-navy-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-navy-600">
                      <p className="font-medium">{session.user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/account/purchases"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Purchases
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
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
                  <div className="h-4 w-4 bg-teal-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
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
            
            {/* Mobile Search */}
            <div className="mb-6">
              <SearchComponent />
            </div>
            
            <nav className="flex-1 mt-4 space-y-2">
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
              
              {/* Models Section */}
              <div className="space-y-1">
                <Link 
                  href="/models" 
                  className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname.startsWith('/models') ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}
                >
                  Models
                </Link>
                <div className="pl-8 space-y-1">
                  <Link 
                    href="/models/private-equity" 
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/models/private-equity' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                    Private Equity Models
                  </Link>
                  <Link 
                    href="/models/public-equity" 
                    className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === '/models/public-equity' ? 'text-navy-900 dark:text-white' : 'text-navy-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                    Public Equity Models
                  </Link>
                </div>
              </div>
              
              {/* Solutions Section */}
              <div className="space-y-1">
                <Link 
                  href="/solutions" 
                  className={`block px-4 py-3 rounded-md text-base font-medium ${router.pathname.startsWith('/solutions') ? 'bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white' : 'text-navy-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'}`}
                >
                  Solutions
                </Link>
                <div className="pl-8 space-y-1">
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
              
              {/* Insights Link - New addition */}
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
            
            {/* Mobile Authentication */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-navy-700">
              {status === 'loading' ? (
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-md"></div>
                </div>
              ) : session ? (
                <div className="space-y-3">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-navy-700 rounded-md">
                    <p className="font-medium text-navy-700 dark:text-white">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                  </div>
                  <Link 
                    href="/account/purchases" 
                    className="block w-full px-4 py-3 text-center rounded-md shadow bg-blue-600 text-white font-medium hover:bg-blue-700 transition duration-150 ease-in-out"
                  >
                    My Purchases
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="block w-full px-4 py-3 text-center rounded-md border border-gray-300 dark:border-navy-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-navy-700 transition duration-150 ease-in-out"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signIn();
                  }}
                  className="block w-full px-4 py-3 text-center rounded-md shadow bg-blue-600 text-white font-medium hover:bg-blue-700 transition duration-150 ease-in-out"
                >
                  Sign In
                </button>
              )}
              
              <Link 
                href="/contact" 
                className="block w-full px-4 py-3 mt-3 text-center rounded-md shadow bg-teal-500 text-white font-medium hover:bg-teal-600 transition duration-150 ease-in-out"
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