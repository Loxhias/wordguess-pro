import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Orbitron, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { GameProvider } from "@/context/GameContext"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _orbitron = Orbitron({ subsets: ["latin"], variable: "--font-display" })
const _inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "WordGuess Pro - Professional Word Guessing Game",
  description: "Professional word guessing game platform with webhooks, real-time updates, and multi-language support",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${_orbitron.variable} ${_inter.variable}`}>
        <GameProvider>
          {children}
        </GameProvider>
        <Analytics />
      </body>
    </html>
  )
}
