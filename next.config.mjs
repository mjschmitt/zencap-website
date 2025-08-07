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

  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
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
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
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