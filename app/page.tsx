"use client"

import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          WordGuess Pro
        </h1>
        <p className="text-slate-400 text-xl">Professional Word Guessing Game</p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/game" 
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Play Game
          </Link>
          <Link 
            href="/config" 
            className="px-8 py-4 border-2 border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-all"
          >
            Configuration
          </Link>
        </div>
      </div>
    </div>
  )
}
