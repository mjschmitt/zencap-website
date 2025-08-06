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

    // Optimize ExcelJS bundle
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        exceljs: {
          test: /[\\/]node_modules[\\/](exceljs)[\\/]/,
          name: 'exceljs',
          priority: 10,
          enforce: true,
        },
      },
    };

    return config;
  },
};

export default nextConfig;