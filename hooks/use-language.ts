"use client"

import { useState, useEffect } from "react"
import type { Language } from "@/lib/i18n/translations"
import { getTranslation, translations } from "@/lib/i18n/translations"

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedConfig = localStorage.getItem("wordguess_config")
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      setLanguage(config.language || "en")
    }
  }, [])

  const t = (key: keyof (typeof translations)["en"]) => {
    return getTranslation(language, key)
  }

  return { language, setLanguage, t }
}
