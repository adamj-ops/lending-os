/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  typescript: {
    // Skip TypeScript checks during build for faster deployment
    // Type errors should be caught in development and CI/CD
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    return [];
  },
  // Vercel optimizations
  serverExternalPackages: ['@neondatabase/serverless'],
  // Environment variables for Vercel
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
