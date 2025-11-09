const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add your image domains if needed
  },
  // Set the output file tracing root to silence the warning
  outputFileTracingRoot: __dirname,
  // Ensure client-side components work properly
  transpilePackages: [
    '@radix-ui/react-accordion',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-aspect-ratio',
    '@radix-ui/react-avatar',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-collapsible',
    '@radix-ui/react-context-menu',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-hover-card',
    '@radix-ui/react-label',
    '@radix-ui/react-menubar',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-progress',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-scroll-area',
    '@radix-ui/react-select',
    '@radix-ui/react-separator',
    '@radix-ui/react-slider',
    '@radix-ui/react-slot',
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs',
    '@radix-ui/react-toast',
    '@radix-ui/react-toggle',
    '@radix-ui/react-tooltip',
  ],
  // Webpack config for handling canvas
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('canvas');
    }
    // Also ignore canvas for client-side builds to prevent bundling issues
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias.canvas = false;
    
    return config;
  },
  // Server-side external packages
  serverExternalPackages: ['canvas', 'pdfjs-dist'],
  // Turbopack configuration
  turbopack: {
    // Set the application root directory
    root: __dirname,
    // Configure custom module resolution extensions
    resolveExtensions: [
      '.mdx',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.json',
    ],
    // Configure resolve aliases for cleaner imports
    resolveAlias: {
      '@': path.join(__dirname, 'src'),
      '@/components': path.join(__dirname, 'src/components'),
      '@/lib': path.join(__dirname, 'src/lib'),
      '@/hooks': path.join(__dirname, 'src/hooks'),
      '@/types': path.join(__dirname, 'src/types'),
      '@/contexts': path.join(__dirname, 'src/contexts'),
    },
    // Configure webpack loaders for Turbopack
    rules: {
      // Example: SVG handling (uncomment and install @svgr/webpack if needed)
      // '*.svg': {
      //   loaders: ['@svgr/webpack'],
      //   as: '*.js',
      // },
    },
    // Note: debugIds is available in Next.js 16.0.0+
    // Uncomment the line below when you upgrade to Next.js 16+
    // debugIds: true,
  },
};

module.exports = nextConfig;
