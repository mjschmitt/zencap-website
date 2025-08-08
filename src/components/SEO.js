// src/components/SEO.js - Enhanced SEO Component
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  noIndex = false,
  structuredData,
  keywords,
  article = false,
  breadcrumbs = [],
}) {
  const router = useRouter();
  const baseUrl = 'https://zencap-website.vercel.app';
  
  const siteTitle = title ? (title.length > 60 ? `${title.substring(0, 57)}...` : `${title} | Zenith Capital`) : 'Financial Models & Investment Advisory | Zenith Capital';
  const siteDescription = description || 'Professional Excel financial models for private equity, real estate & public equity investments. Premium DCF valuation tools $2,985-$4,985. Expert investment advisory services.';
  const siteImage = ogImage ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`) : `${baseUrl}/images/og/zenith-capital-og.jpg`;
  const siteUrl = canonical || `${baseUrl}${router.asPath}`;
  const siteKeywords = keywords || 'financial models, investment models, Excel financial models, DCF valuation, private equity models, real estate financial models, investment advisory, financial modeling services';

  // Generate breadcrumb structured data
  const breadcrumbStructuredData = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": `${baseUrl}${breadcrumb.path}`
    }))
  } : null;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content="Zenith Capital Advisors" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={siteUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
        </>
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || 'Zenith Capital Advisors - Financial Modeling Services'} />
      <meta property="og:site_name" content="Zenith Capital Advisors" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ZenithCapital" />
      <meta name="twitter:creator" content="@ZenithCapital" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
      <meta name="twitter:image:alt" content={title || 'Zenith Capital Advisors - Financial Modeling Services'} />
      
      {/* Additional LinkedIn optimization */}
      <meta property="article:publisher" content="Zenith Capital Advisors" />
      
      {/* Business/Schema.org meta tags */}
      <meta name="application-name" content="Zenith Capital Advisors" />
      <meta name="apple-mobile-web-app-title" content="Zenith Capital" />
      <meta name="theme-color" content="#1e3a8a" />
      <meta name="msapplication-TileColor" content="#1e3a8a" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      {/* Default Financial Services Organization Schema */}
      {!structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialService",
              "name": "Zenith Capital Advisors",
              "description": "Professional financial modeling and investment advisory services for private equity, real estate, and public equity investments.",
              "url": baseUrl,
              "logo": `${baseUrl}/images/logo.png`,
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              },
              "sameAs": [
                "https://linkedin.com/company/zenith-capital-advisors",
                "https://twitter.com/ZenithCapital"
              ],
              "serviceType": "Financial Advisory Services",
              "areaServed": "Worldwide",
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
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Public Equity Analysis Models",
                      "description": "DCF valuation and company-specific financial analysis models"
                    }
                  }
                ]
              }
            })
          }}
        />
      )}
      
      {/* Breadcrumb Structured Data */}
      {breadcrumbStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
        />
      )}
    </Head>
  );
}