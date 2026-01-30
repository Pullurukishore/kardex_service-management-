const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  experimental: {
    // Next.js 14 native optimization for large libraries
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'chart.js',
      'react-chartjs-2',
      '@radix-ui/react-icons',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      'sonner',
      'clsx',
      'tailwind-merge',
      'axios',
      'zod'
    ],
  },

  // Modular imports for better tree-shaking
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },

  webpack: (config, { isServer, dev }) => {
    // Skip complex optimizations in development
    if (dev) {
      return config;
    }

    // Remove console logs in production
    config.optimization.minimizer = config.optimization.minimizer || [];
    const TerserPlugin = require('terser-webpack-plugin');
    config.optimization.minimizer.push(
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: process.env.NEXT_PUBLIC_ENABLE_LOGS !== 'true',
          },
        },
      })
    );

    // Advanced code splitting (PRODUCTION ONLY)
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25, // Increased for more granularity
        minSize: 40000, // Slightly larger to avoid tiny files
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
            name: 'framework',
            priority: 40,
            chunks: 'all',
            enforce: true,
          },
          // Visualization libs - let Webpack split them naturally
          charts: {
            test: /[\\/]node_modules[\\/](recharts|chart\.js|react-chartjs-2|d3)[\\/]/,
            priority: 35,
            chunks: 'all',
            reuseExistingChunk: true,
          },
          // Heavy mapping/excel libs - don't force into one 'heavy_libs' chunk
          heavy_libs: {
            test: /[\\/]node_modules[\\/](xlsx|file-saver|jspdf|exceljs|docx|leaflet|react-leaflet)[\\/]/,
            priority: 30,
            chunks: 'all',
            reuseExistingChunk: true,
          },
          // UI components - remove lucide-react and the 'name' to allow granularity
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@tanstack\/react-table)[\\/]/,
            priority: 25,
            chunks: 'all',
            reuseExistingChunk: true,
          },
          common: {
            minChunks: 2,
            priority: 20,
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Add asset loaders
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });

    // Handle undefined module errors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      module: false,
      net: false,
      dns: false,
      child_process: false,
      tls: false,
    };

    return config;
  },

  productionBrowserSourceMaps: false,
  compiler: {
    // Optimized for Tailwind-based project
    removeConsole: process.env.NEXT_PUBLIC_ENABLE_LOGS !== 'true' ? { exclude: ['error'] } : false,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003',
  },
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.run.app',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    unoptimized: process.env.NEXT_EXPORT === 'true',
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
}

module.exports = withBundleAnalyzer(nextConfig)

