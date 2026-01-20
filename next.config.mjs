/** @type {import('next').NextConfig} */
const nextConfig = {
  // No usar 'export' - Cloudflare Pages soporta Next.js completo con API Routes
  images: {
    unoptimized: true,
  },
}

export default nextConfig
