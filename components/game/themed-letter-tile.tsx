"use client"

import { useEffect, useState } from "react"
import { themes, type ThemeStyle } from "@/lib/themes"

interface ThemedLetterTileProps {
  letter: string
  revealed: boolean
  isCorrectGuess?: boolean
  delay?: number
  theme: ThemeStyle
  wordLength: number
}

export function ThemedLetterTile({
  letter,
  revealed,
  isCorrectGuess = false,
  delay = 0,
  theme,
  wordLength,
}: ThemedLetterTileProps) {
  const [showLetter, setShowLetter] = useState(revealed)
  const [animate, setAnimate] = useState(false)
  const themeConfig = themes[theme]

  useEffect(() => {
    if (revealed && !showLetter) {
      setTimeout(() => {
        setAnimate(true)
        setTimeout(() => {
          setShowLetter(true)
        }, 300)
      }, delay)
    }
  }, [revealed, showLetter, delay])

  const getTileSize = () => {
    if (wordLength <= 5) return "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-3xl md:text-4xl lg:text-5xl"
    if (wordLength <= 8) return "w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-2xl md:text-3xl lg:text-4xl"
    if (wordLength <= 12) return "w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 text-xl md:text-2xl lg:text-3xl"
    return "w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 text-lg md:text-xl lg:text-2xl"
  }

  return (
    <div
      className={`
        relative ${getTileSize()}
        rounded-lg border-2 flex items-center justify-center
        transition-all duration-300
        ${
          showLetter
            ? isCorrectGuess
              ? `bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-${themeConfig.colors.accent} ${themeConfig.animations.glowIntensity}`
              : `bg-gradient-to-br from-${themeConfig.colors.accent}/20 to-${themeConfig.colors.accent}/10 border-${themeConfig.colors.accent} ${themeConfig.animations.glowIntensity}`
            : "bg-slate-800/50 border-slate-700"
        }
        ${animate ? themeConfig.animations.letterReveal : ""}
        ${showLetter ? themeConfig.animations.tileEffect : ""}
      `}
      style={{
        boxShadow: showLetter ? `0 0 20px ${themeConfig.colors.glow}` : "none",
      }}
    >
      {showLetter && (
        <span
          className={`
          ${themeConfig.fontFamily} font-bold
          text-${isCorrectGuess ? "green-400" : themeConfig.colors.text}
          animate-slide-up
        `}
        >
          {letter.toUpperCase()}
        </span>
      )}
      {!showLetter && <span className="text-2xl md:text-3xl text-slate-600">?</span>}

      {/* Theme-specific particle effects */}
      {animate && showLetter && (
        <>
          {theme === "cyberpunk" && (
            <>
              <div className="absolute w-2 h-2 bg-purple-500 rounded-full -top-2 left-1/2 animate-particle-float" />
              <div
                className="absolute w-2 h-2 bg-pink-500 rounded-full -top-2 left-1/4 animate-particle-float"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="absolute w-2 h-2 bg-purple-400 rounded-full -top-2 right-1/4 animate-particle-float"
                style={{ animationDelay: "0.2s" }}
              />
            </>
          )}
          {theme === "neon" && (
            <>
              <div className="absolute inset-0 bg-cyan-400/20 rounded-lg animate-ping" />
              <div className="absolute w-full h-0.5 bg-cyan-400 top-1/2 animate-scan-line" />
            </>
          )}
          {theme === "matrix" && (
            <>
              <div className="absolute w-1 h-full bg-green-500/50 left-1/4 animate-matrix-rain" />
              <div
                className="absolute w-1 h-full bg-green-500/50 right-1/4 animate-matrix-rain"
                style={{ animationDelay: "0.3s" }}
              />
            </>
          )}
          {theme === "retro" && (
            <>
              <div className="absolute inset-0 border-2 border-pink-500 rounded-lg animate-retro-expand" />
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-retro-sweep" />
            </>
          )}
          {theme === "galaxy" && (
            <>
              <div className="absolute w-1 h-1 bg-indigo-400 rounded-full top-2 left-2 animate-twinkle" />
              <div
                className="absolute w-1 h-1 bg-purple-400 rounded-full bottom-2 right-2 animate-twinkle"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="absolute w-1 h-1 bg-pink-400 rounded-full top-2 right-2 animate-twinkle"
                style={{ animationDelay: "0.4s" }}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}
