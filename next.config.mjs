/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['localhost', '127.0.0.1'] : undefined,
}

export default nextConfig
