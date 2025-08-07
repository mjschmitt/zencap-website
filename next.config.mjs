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
    webpackBuildWorker: true,
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

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

    // Advanced bundle optimization with code splitting
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      maxSize: 250000, // 250KB chunks
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        // Excel processing libraries
        exceljs: {
          test: /[\\/]node_modules[\\/](exceljs)[\\/]/,
          name: 'exceljs',
          priority: 30,
          chunks: 'async',
          enforce: true,
        },
        // Other Excel libraries
        xlsxLibs: {
          test: /[\\/]node_modules[\\/](xlsx|xlsx-js-style|node-xlsx)[\\/]/,
          name: 'xlsx-libs',
          priority: 25,
          chunks: 'async',
          enforce: true,
        },
        // Rich text editor libraries
        textEditor: {
          test: /[\\/]node_modules[\\/](@tiptap|@lexical|lexical)[\\/]/,
          name: 'text-editor',
          priority: 20,
          chunks: 'async',
          enforce: true,
        },
        // Chart and visualization libraries
        charts: {
          test: /[\\/]node_modules[\\/](recharts|luckysheet)[\\/]/,
          name: 'charts',
          priority: 15,
          chunks: 'async',
          enforce: true,
        },
        // UI and animation libraries
        animations: {
          test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
          name: 'animations',
          priority: 10,
          chunks: 'all',
        },
        // React and core libraries
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react-vendor',
          priority: 40,
          chunks: 'all',
          enforce: true,
        },
        // Common vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 5,
          chunks: 'initial',
          minChunks: 2,
        },
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

export default nextConfig;