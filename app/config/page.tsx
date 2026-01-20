"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Trash2, Palette, Globe, Webhook } from "lucide-react"
import { GameProvider, useGame } from "@/context/GameContext"
import { getAllWords, saveCustomWords } from "@/lib/words"
import { useTheme } from "@/hooks/use-theme"
import { useLanguage } from "@/hooks/use-language"
import { themes, type ThemeStyle } from "@/lib/themes"
import type { WordEntry } from "@/types/game"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

function ConfigContent() {
  const { config, updateConfig } = useGame()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [words, setWords] = useState<WordEntry[]>([])
  const [newWord, setNewWord] = useState({ word: '', hint: '' })
  const [saved, setSaved] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null)

  // Get current deployment URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:7777'

  const incomingWebhooks = [
    {
      name: 'Adivinar Palabra',
      url: `${baseUrl}/api/guess?user={username}&word={comment}`,
      description: 'Envía el intento de un usuario. Reemplaza {username} con el nombre y {comment} con la palabra.'
    },
    {
      name: 'Revelar Letra',
      url: `${baseUrl}/api/event?user={username}&event=reveal_letter`,
      description: 'Revela una letra aleatoria. Reemplaza {username} con el nombre del usuario.'
    },
    {
      name: 'Puntos Dobles',
      url: `${baseUrl}/api/event?user={username}&event=double_points&duration=30`,
      description: 'Activa puntos dobles por X segundos (duration).'
    },
    {
      name: 'Nueva Ronda',
      url: `${baseUrl}/api/event?user={username}&event=nueva_ronda`,
      description: 'Inicia una nueva ronda con una palabra aleatoria.'
    }
  ]

  useEffect(() => {
    setWords(getAllWords())
    
    // Load webhook URL
    const savedWebhook = localStorage.getItem('wordguess_webhook_url')
    if (savedWebhook) setWebhookUrl(savedWebhook)
  }, [])

  const handleSave = () => {
    saveCustomWords(words)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAdd = () => {
    if (!newWord.word || !newWord.hint) return
    setWords([...words, { word: newWord.word.toUpperCase(), hint: newWord.hint, category: 'custom' }])
    setNewWord({ word: '', hint: '' })
  }

  const handleDelete = (index: number) => {
    setWords(words.filter((_, i) => i !== index))
  }

  const saveWebhookUrl = () => {
    localStorage.setItem('wordguess_webhook_url', webhookUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const copyWebhook = (url: string, name: string) => {
    navigator.clipboard.writeText(url)
    setCopiedWebhook(name)
    setTimeout(() => setCopiedWebhook(null), 2000)
  }

  const themeColors = {
    cyberpunk: 'from-slate-900 via-purple-900 to-slate-900',
    neon: 'from-slate-950 via-blue-950 to-slate-950',
    matrix: 'from-black via-green-950 to-black',
    retro: 'from-purple-950 via-pink-900 to-orange-950',
    galaxy: 'from-indigo-950 via-purple-950 to-slate-950',
    ocean: 'from-blue-950 via-teal-950 to-slate-950',
    sunset: 'from-orange-950 via-red-950 to-slate-950',
    forest: 'from-emerald-950 via-green-950 to-slate-950',
    minimal: 'from-white via-slate-50 to-slate-100',
    dark: 'from-black via-zinc-950 to-black',
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors[theme]} p-4 transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          {t('configuration')}
        </h1>

        {/* Theme Selector */}
        <Card className={`border-purple-500/30 bg-slate-900/50 backdrop-blur-xl mb-6 ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
              <Palette className="w-5 h-5" />
              {t('theme') || 'Theme'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(Object.keys(themes) as ThemeStyle[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => setTheme(themeKey)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${theme === themeKey 
                      ? 'border-purple-500 bg-purple-500/20 scale-105' 
                      : 'border-slate-700 bg-slate-800/30 hover:border-purple-500/50'
                    }
                  `}
                >
                  <div className={`w-full h-12 rounded mb-2 bg-gradient-to-br ${themeColors[themeKey]}`} />
                  <p className={`text-sm font-medium ${theme === 'minimal' && theme !== themeKey ? 'text-slate-700' : 'text-white'}`}>
                    {themes[themeKey].name}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language Selector */}
        <Card className={`border-purple-500/30 bg-slate-900/50 backdrop-blur-xl mb-6 ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
              <Globe className="w-5 h-5" />
              {t('language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm mb-4 ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('selectLanguage')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { code: 'en', name: t('english'), flag: '🇬🇧' },
                { code: 'es', name: t('spanish'), flag: '🇪🇸' },
                { code: 'it', name: t('italian'), flag: '🇮🇹' },
                { code: 'fr', name: t('french'), flag: '🇫🇷' },
                { code: 'pt', name: t('portuguese'), flag: '🇵🇹' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${language === lang.code 
                      ? 'border-purple-500 bg-purple-500/20 scale-105' 
                      : 'border-slate-700 bg-slate-800/30 hover:border-purple-500/50'
                    }
                  `}
                >
                  <div className="text-3xl mb-1">{lang.flag}</div>
                  <p className={`text-sm font-medium ${theme === 'minimal' && language !== lang.code ? 'text-slate-700' : 'text-white'}`}>
                    {lang.name}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outgoing Webhook Configuration */}
        <Card className={`border-purple-500/30 bg-slate-900/50 backdrop-blur-xl mb-6 ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
              <Webhook className="w-5 h-5" />
              📤 Webhook Saliente (Outgoing)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
              El juego enviará eventos a esta URL cuando ocurran acciones importantes.
            </p>
            
            <div>
              <Label className={`mb-2 block ${theme === 'minimal' ? 'text-slate-700' : 'text-slate-300'}`}>
                URL del Webhook
              </Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://your-app.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className={`flex-1 ${theme === 'minimal' ? 'bg-white border-slate-300' : 'bg-slate-800 border-purple-500/30 text-white'}`}
                />
                <Button onClick={saveWebhookUrl} className="bg-purple-500 hover:bg-purple-600">
                  <Save className="w-4 h-4 mr-2" />
                  {saved ? t('saved') : t('save')}
                </Button>
              </div>
              <p className={`text-xs mt-2 ${theme === 'minimal' ? 'text-slate-500' : 'text-slate-500'}`}>
                💡 Eventos: GAME_WIN, ROUND_END, LETTER_REVEALED, ROUND_START, DOUBLE_POINTS, TIMER_WARNING
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Incoming Webhooks */}
        <Card className={`border-purple-500/30 bg-slate-900/50 backdrop-blur-xl mb-6 ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
              <Webhook className="w-5 h-5" />
              📥 Webhooks Entrantes (Incoming)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
              Usa estas URLs para enviar acciones al juego desde aplicaciones externas (OBS, Streamlabs, etc.)
            </p>

            <div className="space-y-3">
              {incomingWebhooks.map((webhook) => (
                <div
                  key={webhook.name}
                  className={`p-4 rounded-lg border ${
                    theme === 'minimal'
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-800/30 border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-semibold ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
                      {webhook.name}
                    </h4>
                    <Button
                      onClick={() => copyWebhook(webhook.url, webhook.name)}
                      size="sm"
                      variant="ghost"
                      className={copiedWebhook === webhook.name ? 'text-green-400' : 'text-purple-400'}
                    >
                      {copiedWebhook === webhook.name ? '✓ Copiado' : '📋 Copiar'}
                    </Button>
                  </div>
                  <p className={`text-xs mb-2 ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {webhook.description}
                  </p>
                  <code className={`block p-2 rounded text-xs overflow-x-auto ${
                    theme === 'minimal'
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-slate-900/50 text-purple-300'
                  }`}>
                    {webhook.url}
                  </code>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${theme === 'minimal' ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-500/30'}`}>
              <p className={`text-sm ${theme === 'minimal' ? 'text-blue-900' : 'text-blue-300'}`}>
                💡 <strong>Tip:</strong> Reemplaza <code>{'{username}'}</code> con el nombre del usuario y <code>{'{comment}'}</code> con la palabra a adivinar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card className={`border-purple-500/30 bg-slate-900/50 backdrop-blur-xl mb-6 ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
          <CardHeader>
            <CardTitle className={theme === 'minimal' ? 'text-slate-900' : 'text-white'}>
              {t('gameSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm mb-4 ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('configureRound')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className={theme === 'minimal' ? 'text-slate-700' : 'text-slate-300'}>
                  {t('roundDuration')}
                </Label>
                <Input
                  type="number"
                  value={config.roundDuration}
                  onChange={(e) => updateConfig({ roundDuration: parseInt(e.target.value) })}
                  className={`mt-2 ${theme === 'minimal' ? 'bg-white border-slate-300' : 'bg-slate-800 border-purple-500/30 text-white'}`}
                />
              </div>
              <div>
                <Label className={theme === 'minimal' ? 'text-slate-700' : 'text-slate-300'}>
                  {t('autoRevealInterval')}
                </Label>
                <Input
                  type="number"
                  value={config.revealInterval}
                  onChange={(e) => updateConfig({ revealInterval: parseInt(e.target.value) })}
                  className={`mt-2 ${theme === 'minimal' ? 'bg-white border-slate-300' : 'bg-slate-800 border-purple-500/30 text-white'}`}
                />
              </div>
              <div>
                <Label className={theme === 'minimal' ? 'text-slate-700' : 'text-slate-300'}>
                  {t('doublePointsDuration')}
                </Label>
                <Input
                  type="number"
                  value={config.doublePointsDuration}
                  onChange={(e) => updateConfig({ doublePointsDuration: parseInt(e.target.value) })}
                  className={`mt-2 ${theme === 'minimal' ? 'bg-white border-slate-300' : 'bg-slate-800 border-purple-500/30 text-white'}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Words */}
        <Card className={`border-purple-500/30 bg-slate-900/50 backdrop-blur-xl ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className={theme === 'minimal' ? 'text-slate-900' : 'text-white'}>
                {t('wordList')} ({words.length} {t('words')})
              </CardTitle>
              <Button
                onClick={handleSave}
                className={`${saved ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'}`}
              >
                <Save className="w-4 h-4 mr-2" />
                {saved ? t('saved') : t('saveChanges')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-sm mb-4 ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('manageWords')}
            </p>

            {/* Add Word */}
            <Card className={`mb-4 ${theme === 'minimal' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-700'}`}>
              <CardContent className="p-4">
                <h3 className={`text-sm font-semibold mb-3 ${theme === 'minimal' ? 'text-slate-700' : 'text-white'}`}>
                  {t('addNewWord')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input
                    type="text"
                    placeholder={t('word')}
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    className={theme === 'minimal' ? 'bg-white border-slate-300' : 'bg-slate-800 border-purple-500/30 text-white'}
                  />
                  <Input
                    type="text"
                    placeholder={t('hint')}
                    value={newWord.hint}
                    onChange={(e) => setNewWord({ ...newWord, hint: e.target.value })}
                    className={theme === 'minimal' ? 'bg-white border-slate-300' : 'bg-slate-800 border-purple-500/30 text-white'}
                  />
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={!newWord.word || !newWord.hint}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addWord')}
                </Button>
              </CardContent>
            </Card>

            {/* Word List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {words.length === 0 ? (
                <div className={`text-center py-8 ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
                  <p className="text-lg mb-2">📝 {t('noWordsYet')}</p>
                  <p className="text-sm">{t('addWordsFirst')}</p>
                </div>
              ) : (
                words.map((word, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-lg border ${
                      theme === 'minimal'
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-800/30 border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-lg mb-1 ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
                          {word.word}
                        </p>
                        <p className={`text-sm ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
                          {word.hint}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDelete(i)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfigPage() {
  return (
    <GameProvider>
      <ConfigContent />
    </GameProvider>
  )
}
