// src/components/SEO.js
import Head from 'next/head';

export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  noIndex = false,
  structuredData,
}) {
  const siteTitle = title ? `${title} | Zenith Capital Advisors` : 'Zenith Capital Advisors';
  const siteDescription = description || 'Financial modeling and investment advisory services for public and private equity firms.';
  const siteImage = ogImage || '/images/og-image.jpg';
  const siteUrl = canonical || 'https://zencap.co';

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <link rel="canonical" href={siteUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={siteDescription} />
      <meta property="twitter:image" content={siteImage} />
      
      {/* No index if specified */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Structured data for rich results */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}