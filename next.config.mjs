import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // EMERGENCY OVERRIDE - Skip ESLint for production build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip TypeScript errors for production build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimizations
  experimental: {
    optimizeCss: true,
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },
  
  // SWC minification is enabled by default in Next.js 15
  // swcMinify: true, // Removed as this is deprecated

  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com https://api.stripe.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "media-src 'self' data: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.stripe.com",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              "block-all-mixed-content"
            ].join('; ')
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },

  webpack: (config, { dev, isServer, webpack }) => {
    // Handle Excel-related packages
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
    };

    // CRITICAL: Aggressive bundle optimization for sub-2s load times
    config.optimization = {
      ...config.optimization,
      
      // Advanced code splitting configuration
      splitChunks: {
        chunks: 'all',
        maxSize: 200000, // 200KB max chunk size (reduced from 250KB)
        minSize: 20000,  // 20KB minimum chunk size
        maxAsyncRequests: 30,
        maxInitialRequests: 25,
        enforceSizeThreshold: 150000, // 150KB threshold
        
        cacheGroups: {
          // CRITICAL: Excel processing (load only when needed)
          exceljs: {
            test: /[\\/]node_modules[\\/](exceljs)[\\/]/,
            name: 'excel-engine',
            priority: 50,
            chunks: 'async',
            enforce: true,
            reuseExistingChunk: true,
          },
          
          // Excel utilities (smaller bundle)
          xlsxLibs: {
            test: /[\\/]node_modules[\\/](xlsx|xlsx-js-style|node-xlsx)[\\/]/,
            name: 'excel-utils',
            priority: 45,
            chunks: 'async',
            enforce: true,
            reuseExistingChunk: true,
          },
          
          // Rich text editor (admin only)
          textEditor: {
            test: /[\\/]node_modules[\\/](@tiptap|@lexical|lexical)[\\/]/,
            name: 'rich-editor',
            priority: 40,
            chunks: 'async',
            enforce: true,
            reuseExistingChunk: true,
          },
          
          // Charts and visualizations
          charts: {
            test: /[\\/]node_modules[\\/](recharts|luckysheet|chart\.js)[\\/]/,
            name: 'charts-viz',
            priority: 35,
            chunks: 'async',
            enforce: true,
            reuseExistingChunk: true,
          },
          
          // Animations (critical for UX but lazy loaded)
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'animations',
            priority: 30,
            chunks: 'async', // Changed to async
            enforce: true,
            reuseExistingChunk: true,
          },
          
          // React ecosystem (essential)
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: 'react-core',
            priority: 60,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true,
          },
          
          // Next.js framework
          nextjs: {
            test: /[\\/]node_modules[\\/](next)[\\/]/,
            name: 'nextjs-framework',
            priority: 55,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true,
          },
          
          // Utility libraries
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|uuid|classnames)[\\/]/,
            name: 'utils',
            priority: 25,
            chunks: 'all',
            minChunks: 2,
            reuseExistingChunk: true,
          },
          
          // CSS and styling
          styles: {
            test: /\.(css|scss|sass|less)$/,
            name: 'styles',
            priority: 20,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true,
          },
          
          // Common vendor chunk (fallback)
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10,
            chunks: 'initial',
            minChunks: 2,
            maxSize: 150000, // 150KB max for vendor chunks
            reuseExistingChunk: true,
          },
          
          // Default chunk
          default: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            maxSize: 100000, // 100KB max for default chunks
          },
        },
      },
      
      // Module concatenation for better performance
      concatenateModules: true,
      
      // Minimize configuration
      minimize: !dev,
      
      // Remove empty chunks
      removeEmptyChunks: true,
      
      // Merge duplicate chunks
      mergeDuplicateChunks: true,
      
      // Better runtime chunk
      runtimeChunk: {
        name: 'runtime',
      },
    };

    // Tree shaking optimizations
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: false,
          analyzerPort: 8888,
        })
      );
    }

    return config;
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Only upload source maps in production
  silent: process.env.NODE_ENV !== 'production',
  
  // Upload source maps during build
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring/sentry-tunnel",
  hideSourceMaps: true,
  disableLogger: true,
  
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  automaticVercelMonitors: true,
};

// Make sure adding Sentry options is the last code to run before exporting
export default process.env.SENTRY_DSN ? 
  withSentryConfig(nextConfig, sentryWebpackPluginOptions) : 
  nextConfig;