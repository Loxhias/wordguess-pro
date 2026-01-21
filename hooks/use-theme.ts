"use client"

import { useState, useEffect } from "react"
import type { ThemeStyle } from "@/lib/themes"

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeStyle>("cyberpunk")

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem("wordguess_theme")
      if (saved) {
        setThemeState(saved as ThemeStyle)
      }
    } catch (error) {
      console.error('[Theme] Error loading theme:', error)
    }
  }, [])

  const setTheme = (newTheme: ThemeStyle) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("wordguess_theme", newTheme)
      } catch (error) {
        console.error('[Theme] Error saving theme:', error)
      }
    }
  }

  return { theme, setTheme }
}
