/** @type {import('next').NextConfig} */
const nextConfig = {
  // Solo usar export en build de producción, no en desarrollo
  // Esto permite usar API Routes en desarrollo
  ...(process.env.NODE_ENV === 'production' && process.env.BUILD_STATIC === 'true' ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
