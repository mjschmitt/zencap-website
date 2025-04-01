// src/components/layout/Layout.js - With transition improvements
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';
import PerformanceMonitor from '../PerformanceMonitor';

export default function Layout({ 
  children, 
  title = 'Zenith Capital Advisors', 
  description = 'Financial modeling and investment advisory services for public and private equity firms.',
  metaImage = '/images/meta-image.jpg'
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={metaImage} />
      </Head>
      
      <Header />
      
      <main className="flex-grow dark:text-white transition-colors duration-200">
        {children}
      </main>
      
      <Footer />
      
      <ScrollToTop />
      <PerformanceMonitor />
    </div>
  );
}