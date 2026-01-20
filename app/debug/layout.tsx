import React from 'react'
import { GameProvider } from '@/context/GameContext'

export default function DebugLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <GameProvider>
      {children}
    </GameProvider>
  )
}
