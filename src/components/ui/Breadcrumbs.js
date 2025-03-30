// src/components/ui/Breadcrumbs.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export default function Breadcrumbs() {
  const router = useRouter();
  
  const breadcrumbs = useMemo(() => {
    // Home will be first
    const paths = [{ label: 'Home', path: '/' }];
    
    if (router.pathname === '/') {
      return paths;
    }
    
    // Split and decode the pathname segments
    const pathSegments = router.pathname
      .split('/')
      .filter(Boolean)
      .map(segment => decodeURIComponent(segment));
    
    // Create the breadcrumb items by joining segments
    pathSegments.forEach((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      paths.push({ label, path });
    });
    
    return paths;
  }, [router.pathname]);
  
  return (
    <nav className="flex py-3 px-5 text-gray-600 dark:text-gray-400 text-sm">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={breadcrumb.path} className="inline-flex items-center">
              {index > 0 && (
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
              )}
              
              {isLast ? (
                <span className="ml-1 md:ml-2 text-navy-600 dark:text-navy-400 font-medium">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link href={breadcrumb.path}>
                  <span className="ml-1 md:ml-2 text-gray-600 dark:text-gray-400 hover:text-navy-700 dark:hover:text-white">
                    {breadcrumb.label}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}