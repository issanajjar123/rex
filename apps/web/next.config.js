/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to allow API routes to work
  // Capacitor will use the static pages from the build
  turbopack: {},
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude database modules from client bundle
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        '@neondatabase/serverless': false,
        'pg': false,
      };
    }
    
    return config;
  }
}

module.exports = nextConfig;
