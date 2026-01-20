"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Save, Edit2, X, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useLanguage } from "@/hooks/use-language"
import type { Language } from "@/lib/i18n/translations"
import { useTheme } from "@/hooks/use-theme"
import { themes, type ThemeStyle } from "@/lib/themes"
import { useGame } from "@/context/GameContext"
import { getAllWords, saveCustomWords, getCustomWords, DEFAULT_WORDS, type WordEntry } from "@/lib/words"

export default function ConfigPage() {
  const [words, setWords] = useState<WordEntry[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newWord, setNewWord] = useState({ word: "", hint: "" })
  const [saved, setSaved] = useState(false)

  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { config, updateConfig } = useGame()

  // Load words from localStorage
  useEffect(() => {
    const allWords = getAllWords()
    setWords(allWords)
  }, [])

  // Save words to localStorage
  const handleSave = () => {
    // Separar palabras default de custom
    const customWords = words.filter(w => {
      return !DEFAULT_WORDS.some(dw => dw.word.toUpperCase() === w.word.toUpperCase())
    })

    const normalized = customWords.map(w => ({
      word: String(w.word ?? "").trim().toUpperCase(),
      hint: String(w.hint ?? "").trim(),
      difficulty: w.difficulty || 'medium',
      category: w.category || 'custom',
    } as WordEntry)).filter(w => w.word && w.hint)

    saveCustomWords(normalized)
    
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAddWord = () => {
    const word = newWord.word.trim()
    const hint = newWord.hint.trim()

    if (!word || !hint) return

    setWords((prev) => [...prev, { 
      word: word.toUpperCase(), 
      hint,
      difficulty: 'medium',
      category: 'custom'
    }])
    setNewWord({ word: "", hint: "" })
  }

  const handleDeleteWord = (index: number) => {
    const wordToDelete = words[index]
    
    // No permitir borrar palabras default
    const isDefault = DEFAULT_WORDS.some(dw => dw.word.toUpperCase() === wordToDelete.word.toUpperCase())
    
    if (isDefault) {
      alert("Cannot delete default words. You can only delete custom words.")
      return
    }

    setWords((prev) => prev.filter((_, i) => i !== index))
    if (editingIndex === index) setEditingIndex(null)
  }

  const handleEditWord = (index: number) => {
    setEditingIndex(index)
  }

  const handleUpdateWord = (index: number, updates: Partial<WordEntry>) => {
    setWords((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], ...updates }
      return updated
    })
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
  }

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
  }

  // Count custom vs default words
  const customWordsCount = words.filter(w => 
    !DEFAULT_WORDS.some(dw => dw.word.toUpperCase() === w.word.toUpperCase())
  ).length
  const defaultWordsCount = words.length - customWordsCount

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back")}
            </Button>
          </Link>

          <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t("configuration")}
          </h1>

          <div className="w-24" />
        </div>

        <div className="space-y-6">
          {/* Game Settings */}
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">{t("gameSettings")}</CardTitle>
              <CardDescription className="text-slate-400">{t("configureRound")}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roundDuration" className="text-slate-300">
                    {t("roundDuration")}
                  </Label>
                  <Input
                    id="roundDuration"
                    type="number"
                    value={config.roundDuration}
                    onChange={(e) => updateConfig({ roundDuration: Number.parseInt(e.target.value) || 180 })}
                    className="bg-slate-800/50 border-purple-500/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revealInterval" className="text-slate-300">
                    {t("autoRevealInterval")}
                  </Label>
                  <Input
                    id="revealInterval"
                    type="number"
                    value={config.revealInterval}
                    onChange={(e) => updateConfig({ revealInterval: Number.parseInt(e.target.value) || 15 })}
                    className="bg-slate-800/50 border-purple-500/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doublePoints" className="text-slate-300">
                    {t("doublePointsDuration")}
                  </Label>
                  <Input
                    id="doublePoints"
                    type="number"
                    value={config.doublePointsDuration}
                    onChange={(e) => updateConfig({ doublePointsDuration: Number.parseInt(e.target.value) || 30 })}
                    className="bg-slate-800/50 border-purple-500/30 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Word Management */}
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{t("wordList")}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {t("manageWords")} ({words.length} total: {defaultWordsCount} default + {customWordsCount} custom)
                  </CardDescription>
                </div>

                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saved ? t("saved") : t("saveChanges")}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Add New Word */}
              <div className="p-4 bg-slate-800/30 rounded-lg border border-purple-500/20">
                <h3 className="text-white font-semibold mb-3">{t("addNewWord")}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder={t("word")}
                    value={newWord.word}
                    onChange={(e) => setNewWord((prev) => ({ ...prev, word: e.target.value }))}
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                  />
                  <Input
                    placeholder={t("hint")}
                    value={newWord.hint}
                    onChange={(e) => setNewWord((prev) => ({ ...prev, hint: e.target.value }))}
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                  />
                </div>

                <Button
                  onClick={handleAddWord}
                  disabled={!newWord.word.trim() || !newWord.hint.trim()}
                  className="mt-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("addWord")}
                </Button>
              </div>

              {/* Word List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {words.map((wordEntry, index) => {
                  const isDefault = DEFAULT_WORDS.some(dw => dw.word.toUpperCase() === wordEntry.word.toUpperCase())

                  return (
                    <div
                      key={`${wordEntry.word}-${index}`}
                      className={`p-3 rounded-lg border transition-colors ${
                        isDefault 
                          ? 'bg-blue-900/20 border-blue-500/30' 
                          : 'bg-slate-800/30 border-slate-700/50 hover:border-purple-500/30'
                      }`}
                    >
                      {editingIndex === index ? (
                        <div className="space-y-2">
                          <Input
                            value={wordEntry.word}
                            onChange={(e) => handleUpdateWord(index, { word: e.target.value.toUpperCase() })}
                            className="bg-slate-800/50 border-purple-500/30 text-white"
                            disabled={isDefault}
                          />
                          <Input
                            value={wordEntry.hint}
                            onChange={(e) => handleUpdateWord(index, { hint: e.target.value })}
                            className="bg-slate-800/50 border-purple-500/30 text-white"
                            disabled={isDefault}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setEditingIndex(null)}
                              size="sm"
                              className="bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              {t("save")}
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-400 hover:bg-slate-800 bg-transparent"
                            >
                              <X className="w-3 h-3 mr-1" />
                              {t("cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold font-display">{wordEntry.word}</p>
                              {isDefault && (
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Default</span>
                              )}
                            </div>
                            <p className="text-slate-400 text-sm">{wordEntry.hint}</p>
                          </div>
                          <div className="flex gap-2">
                            {!isDefault && (
                              <>
                                <Button
                                  onClick={() => handleEditWord(index)}
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteWord(index)}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Theme Selector */}
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-purple-400" />
                <div>
                  <CardTitle className="text-white">Visual Theme</CardTitle>
                  <CardDescription className="text-slate-400">
                    Choose your preferred game style with unique animations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.keys(themes) as ThemeStyle[]).map((themeKey) => {
                  const themeDef = themes[themeKey]
                  const primaryGradient = themeDef.colors.primary
                  const accentColor = themeDef.colors.accent
                  const borderColor = themeDef.colors.border

                  const accentStyle =
                    typeof accentColor === "string" && accentColor.startsWith("#")
                      ? { backgroundColor: accentColor }
                      : undefined

                  const borderStyle =
                    typeof borderColor === "string" && borderColor.startsWith("#")
                      ? { borderColor }
                      : undefined

                  return (
                    <button
                      key={themeKey}
                      onClick={() => setTheme(themeKey)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${
                          theme === themeKey
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-slate-700 bg-slate-800/30 hover:border-purple-500/50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{themeDef.name}</h3>
                        {theme === themeKey && (
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        )}
                      </div>

                      <div className="flex gap-2">
                        <div className={`w-8 h-8 rounded bg-gradient-to-br ${primaryGradient}`} />
                        <div className="w-8 h-8 rounded" style={accentStyle} />
                        <div className="w-8 h-8 rounded border" style={borderStyle} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Language Selector */}
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">{t("language")}</CardTitle>
              <CardDescription className="text-slate-400">{t("selectLanguage")}</CardDescription>
            </CardHeader>

            <CardContent>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="w-full bg-slate-800/50 border border-purple-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="en">{t("english")}</option>
                <option value="es">{t("spanish")}</option>
                <option value="it">{t("italian")}</option>
                <option value="fr">{t("french")}</option>
                <option value="pt">{t("portuguese")}</option>
              </select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
