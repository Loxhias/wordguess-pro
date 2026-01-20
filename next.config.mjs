/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 STATIC EXPORT para Cloudflare Pages
  output: 'export',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Necesario para exportación estática
  images: {
    unoptimized: true,
  },
  
  // Opcional: Configurar trailing slash
  trailingSlash: true,
  
  // Opcional: Deshabilitar optimización de fuentes en build estático
  // (puede causar problemas en algunos hosts estáticos)
  // experimental: {
  //   optimizeFonts: false,
  // },
}

export default nextConfig
