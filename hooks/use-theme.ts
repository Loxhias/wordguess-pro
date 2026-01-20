"use client"

import { useState, useEffect } from "react"
import type { ThemeStyle } from "@/lib/themes"

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeStyle>("cyberpunk")

  useEffect(() => {
    const saved = localStorage.getItem("wordguess_theme")
    if (saved) {
      setThemeState(saved as ThemeStyle)
    }
  }, [])

  const setTheme = (newTheme: ThemeStyle) => {
    setThemeState(newTheme)
    localStorage.setItem("wordguess_theme", newTheme)
  }

  return { theme, setTheme }
}
