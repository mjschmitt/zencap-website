// src/components/layout/Header.js
import { useState } from 'react';
import Link from 'next/link';
import Navbar from './Navbar';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="h-8 w-8 mr-2 bg-navy-900 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-gold-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                </div>
                <span className="text-navy-900 font-serif text-2xl font-bold">Zenith</span>
                <span className="text-navy-700 font-sans text-lg ml-1">Capital Advisors</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navbar />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-navy-500 hover:text-navy-900 hover:bg-gray-100 focus:outline-none"
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
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/">
            <div className="block px-3 py-2 rounded-md text-base font-medium text-navy-900 hover:bg-gray-50">Home</div>
          </Link>
          <Link href="/about">
            <div className="block px-3 py-2 rounded-md text-base font-medium text-navy-900 hover:bg-gray-50">About</div>
          </Link>
          <Link href="/products">
            <div className="block px-3 py-2 rounded-md text-base font-medium text-navy-900 hover:bg-gray-50">Products</div>
          </Link>
          <Link href="/services">
            <div className="block px-3 py-2 rounded-md text-base font-medium text-navy-900 hover:bg-gray-50">Services</div>
          </Link>
          <Link href="/contact">
            <div className="block px-3 py-2 rounded-md text-base font-medium text-navy-900 hover:bg-gray-50">Contact</div>
          </Link>
        </div>
      </div>
    </header>
  );
}