// src/components/layout/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 mr-2 bg-white rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-teal-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
              </div>
              <span className="text-white font-serif text-2xl font-bold">Zenith Capital</span>
            </div>
            <p className="text-gray-300 text-sm">
              Elevate Your Investment Decisions
            </p>
            <div className="mt-4">
              <p className="text-gray-300 text-sm">
                © {new Date().getFullYear()} Zenith Capital Advisors
              </p>
            </div>
          </div>
          
          {/* Models Links */}
          <div className="col-span-1">
            <Link href="/models" className="cursor-pointer">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 hover:text-teal-300 transition-colors">
                Models
              </h3>
            </Link>
            <ul className="space-y-2">
              <li>
                <Link href="/models/private-equity" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150">
                  Private Equity Models
                </Link>
              </li>
              <li>
                <Link href="/models/public-equity" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150">
                  Public Equity Models
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Solutions Links */}
          <div className="col-span-1">
            <Link href="/solutions" className="cursor-pointer">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 hover:text-teal-300 transition-colors">
                Solutions
              </h3>
            </Link>
            <ul className="space-y-2">
              <li>
                <Link href="/solutions/financial-modeling" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150">
                  Financial Modeling
                </Link>
              </li>
              <li>
                <Link href="/solutions/infrastructure" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150">
                  Investment Infrastructure
                </Link>
              </li>
              <li>
                <Link href="/solutions/research" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150">
                  Industry Research
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Section */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm">
                <span className="block">Email:</span>
                <a href="mailto:info@zencap.co" className="hover:text-white">info@zencap.co</a>
              </li>
              <li className="text-gray-300 text-sm">
                <span className="block">Phone:</span>
                <a href="tel:+15551234567" className="hover:text-white">+1 (555) 123-4567</a>
              </li>
              <li>
                <Link href="/contact" className="mt-4 inline-block bg-teal-500 text-white px-4 py-2 text-sm font-medium rounded hover:bg-teal-600 cursor-pointer">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-xs">
              All rights reserved. Zenith Capital Advisors LLC.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}