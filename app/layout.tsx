"use client"

import "./globals.css"
import { useEffect } from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fix for Cloudflare Pages hydration
  useEffect(() => {
    // Ensure client-side only code runs after mount
    if (typeof window !== 'undefined') {
      console.log('[App] Mounted on client')
    }
  }, [])

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
