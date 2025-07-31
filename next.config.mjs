/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24, // 1 day instead of 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compression and optimization
  compress: true,
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion'],
  },

  // Webpack configuration for better chunk handling
  webpack: (config, { isServer }) => {
    // Optimize chunk splitting for better loading
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Create a separate chunk for ExcelJS
        exceljs: {
          name: 'exceljs',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]exceljs[\\/]/,
          priority: 20,
          enforce: true,
        },
        // Create a separate chunk for other large libraries
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          enforce: true,
        },
      },
    };

    // Improve chunk loading reliability
    config.output.chunkFilename = isServer 
      ? 'static/chunks/[id].js'
      : 'static/chunks/[name].[chunkhash].js';

    return config;
  },
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self' blob:; child-src 'self' blob:;",
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'X-API-Version',
            value: '1.0',
          },
        ],
      },
      {
        source: '/uploads/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400', // 1 day cache
          },
        ],
      },
    ];
  },
};

export default nextConfig;
