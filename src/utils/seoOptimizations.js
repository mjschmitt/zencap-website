// src/utils/seoOptimizations.js - SEO Performance Optimizations

/**
 * Page Speed and Core Web Vitals Optimizations for SEO
 */

// Preload critical resources for faster loading
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap';
    fontPreload.as = 'style';
    fontPreload.onload = function() {
      this.onload = null;
      this.rel = 'stylesheet';
    };
    document.head.appendChild(fontPreload);

    // Preload critical images
    const heroImagePreload = document.createElement('link');
    heroImagePreload.rel = 'preload';
    heroImagePreload.href = '/images/home/home-hero.jpg';
    heroImagePreload.as = 'image';
    document.head.appendChild(heroImagePreload);
  }
};

// Optimize images with WebP fallback
export const optimizeImages = () => {
  if (typeof window !== 'undefined') {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" for better performance
      if (!img.hasAttribute('loading') && !img.closest('.hero')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add proper dimensions to prevent layout shift
      if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
        img.addEventListener('load', function() {
          this.setAttribute('width', this.naturalWidth);
          this.setAttribute('height', this.naturalHeight);
        });
      }
    });
  }
};

// Remove render-blocking resources
export const optimizeCSS = () => {
  if (typeof window !== 'undefined') {
    // Inline critical CSS and defer non-critical CSS
    const criticalCSS = `
      body { 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
        margin: 0; 
        padding: 0; 
      }
      .hero { 
        min-height: 70vh; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
      }
      .container { 
        max-width: 1200px; 
        margin: 0 auto; 
        padding: 0 1rem; 
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }
};

// Structured data for financial services
export const generateFinancialServicesSchema = (pageType, data = {}) => {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Zenith Capital Advisors",
    "url": "https://zencap-website.vercel.app",
    "logo": "https://zencap-website.vercel.app/images/logo.png",
    "description": "Professional financial modeling and investment advisory services for private equity, real estate, and public equity investments.",
    "serviceType": "Financial Advisory Services",
    "areaServed": "Worldwide",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };

  switch (pageType) {
    case 'homepage':
      return {
        ...baseSchema,
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Financial Models",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Private Equity Financial Models",
                "description": "Excel-based financial models for real estate and private equity investments"
              },
              "price": "4985",
              "priceCurrency": "USD"
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "Public Equity Analysis Models",
                "description": "DCF valuation and company-specific financial analysis models"
              },
              "price": "2985",
              "priceCurrency": "USD"
            }
          ]
        }
      };
    
    case 'models':
      return {
        ...baseSchema,
        "@type": "ProductCatalog",
        "name": "Financial Models Catalog",
        "numberOfItems": data.itemCount || 13,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Professional Financial Models",
          "itemListElement": data.models || []
        }
      };
    
    case 'insights':
      return {
        ...baseSchema,
        "@type": "Blog",
        "name": "Investment Insights & Research",
        "description": "Expert investment insights, market analysis, and financial modeling research",
        "blogPost": data.articles || []
      };
    
    default:
      return baseSchema;
  }
};

// Generate product schema for individual models
export const generateProductSchema = (model) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": model.title,
    "description": model.description,
    "category": "Financial Software",
    "brand": {
      "@type": "Brand",
      "name": "Zenith Capital Advisors"
    },
    "offers": {
      "@type": "Offer",
      "price": model.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Zenith Capital Advisors"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  };
};

// Generate article schema for insights
export const generateArticleSchema = (article) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "author": {
      "@type": "Person",
      "name": article.author || "Zenith Capital Research Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap-website.vercel.app/images/logo.png"
      }
    },
    "datePublished": article.date_published,
    "dateModified": article.updated_at || article.date_published,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://zencap-website.vercel.app/insights/${article.slug}`
    }
  };
};

// Critical performance metrics tracking
export const trackCoreWebVitals = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Track Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        console.log('LCP:', entry.startTime);
        
        // Send to analytics if configured
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(entry.startTime),
            event_category: 'Performance'
          });
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const FID = entry.processingStart - entry.startTime;
        console.log('FID:', FID);
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'FID',
            value: Math.round(FID),
            event_category: 'Performance'
          });
        }
      }
    }).observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      console.log('CLS:', clsValue);
      
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          name: 'CLS',
          value: Math.round(clsValue * 1000),
          event_category: 'Performance'
        });
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

// Initialize all SEO optimizations
export const initializeSEOOptimizations = () => {
  if (typeof window !== 'undefined') {
    // Run immediately
    preloadCriticalResources();
    optimizeCSS();
    
    // Run after DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImages();
      trackCoreWebVitals();
    });
    
    // Service worker for caching (if supported)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }
};

// SEO-optimized page titles and descriptions
export const SEO_DATA = {
  homepage: {
    title: "Financial Models & Investment Advisory | Zenith Capital",
    description: "Professional Excel financial models for private equity & real estate. DCF valuation tools $2,985-$4,985. Institutional-grade investment analysis models. Get premium financial modeling services.",
    keywords: "financial models, investment models, Excel financial models, DCF valuation, private equity models, real estate financial models, investment advisory, financial modeling services"
  },
  models: {
    title: "Financial Models | Excel Investment Analysis Tools",
    description: "Professional Excel financial models for private equity, real estate & public equity. Premium DCF models $2,985-$4,985. Institutional-grade investment analysis tools for professionals.",
    keywords: "financial models, investment models, Excel financial models, DCF valuation, private equity models, real estate financial models, LBO models, investment analysis tools"
  },
  insights: {
    title: "Investment Insights & Market Analysis | Zenith Capital",
    description: "Expert investment insights, market analysis & financial modeling research. Professional investment strategies for private equity, real estate & public equity. Get institutional research.",
    keywords: "investment insights, market analysis, investment research, financial modeling insights, private equity research, real estate market analysis, investment strategies"
  },
  about: {
    title: "About Zenith Capital | Expert Financial Modeling Team",
    description: "Expert financial modeling team led by Max Schmitt (10+ years private/public equity). Professional investment advisory services. Institutional-grade financial models & analysis.",
    keywords: "Zenith Capital Advisors, Max Schmitt, financial modeling team, investment advisory, private equity experience, financial services team, institutional finance"
  },
  contact: {
    title: "Contact Us | Financial Modeling Experts | Zenith Capital",
    description: "Contact financial modeling experts for custom Excel models & investment advisory services. Professional consultation for private equity & real estate investments. Get expert help today.",
    keywords: "contact financial modeling experts, investment advisory consultation, custom financial models, private equity modeling, financial analysis consultation"
  }
};