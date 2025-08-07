// src/components/layout/Footer.js
import Link from 'next/link';
import TrustBadges from '@/components/ui/TrustBadges';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-navy-900 text-white">
      {/* Trust badges section */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Trusted by Investment Professionals
            </h3>
          </div>
          <TrustBadges className="justify-center" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info - Expanded */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 mr-2 bg-white rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-teal-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
              </div>
              <span className="text-white font-serif text-2xl font-bold">Zenith Capital</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Elevate Your Investment Decisions
            </p>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              We provide institutional-grade financial models and investment analysis tools 
              to help sophisticated investors make data-driven decisions. Our Excel-based models 
              range from $2,985 to $4,985 and cover private equity real estate and public equity analysis.
            </p>
            
            {/* Professional credentials */}
            <div className="space-y-2 text-xs text-gray-400">
              <p className="flex items-center">
                <svg className="w-3 h-3 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                SEC Compliant Financial Models
              </p>
              <p className="flex items-center">
                <svg className="w-3 h-3 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                GAAP Accounting Standards
              </p>
              <p className="flex items-center">
                <svg className="w-3 h-3 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                CFA Institute Best Practices
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
            <ul className="space-y-3">
              <li>
                <Link href="/models/private-equity" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150 flex items-center">
                  <svg className="w-3 h-3 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Private Equity Models
                </Link>
              </li>
              <li>
                <Link href="/models/public-equity" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150 flex items-center">
                  <svg className="w-3 h-3 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Public Equity Models
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150 flex items-center">
                  <svg className="w-3 h-3 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Market Insights
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Solutions Links */}
          <div className="col-span-1">
            <Link href="/solutions" className="cursor-pointer">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 hover:text-teal-300 transition-colors">
                Services
              </h3>
            </Link>
            <ul className="space-y-3">
              <li>
                <Link href="/solutions/financial-modeling" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150 flex items-center">
                  <svg className="w-3 h-3 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Financial Modeling
                </Link>
              </li>
              <li>
                <Link href="/solutions/infrastructure" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150 flex items-center">
                  <svg className="w-3 h-3 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Investment Infrastructure
                </Link>
              </li>
              <li>
                <Link href="/solutions/research" className="text-gray-300 hover:text-teal-300 text-sm cursor-pointer transition-colors duration-150 flex items-center">
                  <svg className="w-3 h-3 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Industry Research
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact & Resources Section */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Contact & Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@zencap.co" className="text-gray-300 hover:text-teal-300 text-sm transition-colors duration-150 flex items-center">
                  <svg className="w-3 h-3 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  info@zencap.co
                </a>
              </li>
              <li>
                <a href="tel:+15551234567" className="text-gray-300 hover:text-teal-300 text-sm transition-colors duration-150 flex items-center">
                  <svg className="w-3 h-3 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +1 (555) 123-4567
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-teal-300 text-sm transition-colors duration-150 flex items-center">
                  <svg className="w-3 h-3 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  Contact Support
                </Link>
              </li>
              <li className="pt-2">
                <Link href="/contact" className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:from-teal-600 hover:to-teal-700 cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-sm">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-8">
              <p className="text-gray-400 text-xs">
                © {currentYear} Zenith Capital Advisors LLC. All rights reserved.
              </p>
              <div className="flex space-x-6 text-xs">
                <Link href="/terms" className="text-gray-400 hover:text-teal-300 cursor-pointer transition-colors duration-150">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-teal-300 cursor-pointer transition-colors duration-150">
                  Privacy Policy
                </Link>
                <Link href="/sitemap.xml" className="text-gray-400 hover:text-teal-300 cursor-pointer transition-colors duration-150">
                  Sitemap
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <p className="text-xs text-gray-500">Follow us:</p>
              <div className="flex space-x-4">
                <a href="https://linkedin.com/company/zenith-capital-advisors" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-300 transition-colors duration-150">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://twitter.com/zenithcapital" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-300 transition-colors duration-150">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="mailto:info@zencap.co" className="text-gray-400 hover:text-teal-300 transition-colors duration-150">
                  <span className="sr-only">Email</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center leading-relaxed max-w-4xl mx-auto">
              <strong>Investment Disclaimer:</strong> The financial models and information provided by Zenith Capital Advisors are for educational and informational purposes only. 
              They do not constitute investment advice, and past performance does not guarantee future results. 
              Please consult with qualified financial professionals before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}