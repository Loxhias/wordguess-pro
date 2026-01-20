"use client"

import { Clock } from "lucide-react"
import { themes, type ThemeStyle } from "@/lib/themes"

interface ThemedTimerProps {
  timeLeft: number
  totalTime: number
  theme: ThemeStyle
}

export function ThemedTimer({ timeLeft, totalTime, theme }: ThemedTimerProps) {
  const themeConfig = themes[theme]
  const percentage = (timeLeft / totalTime) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const getColorClass = () => {
    if (percentage > 50) return themeConfig.colors.accent
    if (percentage > 20) return "yellow-400"
    return "red-400"
  }

  const getTimerShape = () => {
    switch (theme) {
      case "cyberpunk":
      case "neon":
        return "rounded-none" // Square/sharp edges
      case "matrix":
        return "rounded-sm" // Slightly rounded
      case "retro":
        return "rounded-3xl" // Very rounded
      case "galaxy":
        return "rounded-full" // Circle
      case "ocean":
        return "rounded-2xl" // Rounded
      case "sunset":
        return "rounded-xl" // Medium rounded
      case "forest":
        return "rounded-2xl" // Rounded
      case "minimal":
        return "rounded-lg" // Clean rounded
      case "dark":
        return "rounded-md" // Subtle rounded
      default:
        return "rounded-full"
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`
        relative w-32 h-32 md:w-40 md:h-40 ${getTimerShape()}
        border-4 border-${getColorClass()}
        flex items-center justify-center
        bg-${themeConfig.colors.cardBg} backdrop-blur-xl
        transition-all duration-300
        ${themeConfig.animations.glowIntensity}
        ${percentage <= 20 ? "animate-pulse" : ""}
      `}
        style={{
          boxShadow: `0 0 30px ${themeConfig.colors.glow}`,
        }}
      >
        {theme === "cyberpunk" && (
          <>
            <div className="absolute top-0 left-0 w-2 h-2 bg-purple-500" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-pink-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-pink-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-purple-500" />
          </>
        )}
        {theme === "neon" && (
          <div className="absolute inset-0 bg-cyan-400/10 animate-pulse" style={{ borderRadius: "inherit" }} />
        )}
        {theme === "matrix" && (
          <>
            <div className="absolute w-full h-0.5 bg-green-500/30 top-1/4" />
            <div className="absolute w-full h-0.5 bg-green-500/30 top-3/4" />
          </>
        )}
        {theme === "retro" && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-orange-500/20"
            style={{ borderRadius: "inherit" }}
          />
        )}
        {theme === "galaxy" && (
          <>
            <div className="absolute w-1 h-1 bg-purple-400 rounded-full top-4 left-8 animate-twinkle" />
            <div
              className="absolute w-1 h-1 bg-indigo-400 rounded-full top-8 right-6 animate-twinkle"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="absolute w-1 h-1 bg-pink-400 rounded-full bottom-6 left-10 animate-twinkle"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}

        <div className="relative z-10 text-center">
          <Clock className={`w-6 h-6 mx-auto mb-2 opacity-70 text-${getColorClass()}`} />
          <div className={`${themeConfig.fontFamily} text-4xl md:text-5xl font-bold text-${getColorClass()}`}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        {(theme === "galaxy" || theme === "ocean" || theme === "minimal") && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${percentage * 2.83} 283`}
              className={`transition-all duration-1000 opacity-30 text-${getColorClass()}`}
            />
          </svg>
        )}
      </div>
    </div>
  )
}
