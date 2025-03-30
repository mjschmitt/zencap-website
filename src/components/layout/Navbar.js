import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  
  // Function to determine if a link is active
  const isActive = (path) => {
    if (router.pathname === path) {
      return 'text-gold-500 font-medium'; // Consistent gold highlight for active page
    }
    return 'text-navy-700 hover:text-navy-900';
  };
  
  return (
    <nav className="flex space-x-8">
      <Link href="/">
        <div className={`cursor-pointer px-3 py-2 rounded-md text-sm ${isActive('/')}`}>
          Home
        </div>
      </Link>
      
      <Link href="/about">
        <div className={`cursor-pointer px-3 py-2 rounded-md text-sm ${isActive('/about')}`}>
          About
        </div>
      </Link>
      
      {/* Products Dropdown */}
      <div className="relative" onMouseEnter={() => setProductsDropdownOpen(true)} onMouseLeave={() => setProductsDropdownOpen(false)}>
        <Link href="/products">
          <div className={`cursor-pointer px-3 py-2 rounded-md text-sm ${router.pathname === '/products' || router.pathname.startsWith('/products/') ? 'text-gold-500 font-medium' : 'text-navy-700 hover:text-navy-900'}`}>
            Products
            <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Link>
        
        {productsDropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <Link href="/products/private-equity">
                <div className={`block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${router.pathname === '/products/private-equity' ? 'text-gold-500 font-medium' : 'text-navy-700'}`} role="menuitem">
                  Private Equity Models
                </div>
              </Link>
              <Link href="/products/public-equity">
                <div className={`block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${router.pathname === '/products/public-equity' ? 'text-gold-500 font-medium' : 'text-navy-700'}`} role="menuitem">
                  Public Equity Models
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Services Dropdown */}
      <div className="relative" onMouseEnter={() => setServicesDropdownOpen(true)} onMouseLeave={() => setServicesDropdownOpen(false)}>
        <Link href="/services">
          <div className={`cursor-pointer px-3 py-2 rounded-md text-sm ${router.pathname === '/services' || router.pathname.startsWith('/services/') ? 'text-gold-500 font-medium' : 'text-navy-700 hover:text-navy-900'}`}>
            Services
            <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Link>
        
        {servicesDropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <Link href="/services/financial-modeling">
                <div className={`block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${router.pathname === '/services/financial-modeling' ? 'text-gold-500 font-medium' : 'text-navy-700'}`} role="menuitem">
                  Financial Modeling
                </div>
              </Link>
              <Link href="/services/infrastructure">
                <div className={`block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${router.pathname === '/services/infrastructure' ? 'text-gold-500 font-medium' : 'text-navy-700'}`} role="menuitem">
                  Investment Infrastructure
                </div>
              </Link>
              <Link href="/services/research">
                <div className={`block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${router.pathname === '/services/research' ? 'text-gold-500 font-medium' : 'text-navy-700'}`} role="menuitem">
                  Industry Research
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <Link href="/contact">
        <div className={`cursor-pointer px-3 py-2 rounded-md text-sm ${isActive('/contact')}`}>
          Contact
        </div>
      </Link>
    </nav>
  );
}