"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Trash2, Palette, Globe, Copy, Check, Webhook } from "lucide-react"
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
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [authToken, setAuthToken] = useState('')
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wordguess-pro.pages.dev'

  useEffect(() => {
    setWords(getAllWords())
    
    // Load webhook config
    const savedWebhook = localStorage.getItem('wordguess_webhook_url')
    const savedToken = localStorage.getItem('wordguess_auth_token')
    if (savedWebhook) setWebhookUrl(savedWebhook)
    if (savedToken) setAuthToken(savedToken)
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(id)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const generateToken = () => {
    const token = Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
    ).join('')
    setAuthToken(token)
    localStorage.setItem('wordguess_auth_token', token)
  }

  const saveWebhookUrl = () => {
    localStorage.setItem('wordguess_webhook_url', webhookUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

        {/* Webhook Endpoints */}
        <Card className={`border-purple-500/30 bg-slate-900/50 backdrop-blur-xl mb-6 ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
              <Webhook className="w-5 h-5" />
              {t('webhookEndpoints')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className={`text-sm ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('webhookDescription')}
            </p>

            {/* Incoming Webhooks */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
                📥 {t('incomingWebhooks')}
              </h3>
              
              <div className="space-y-3">
                {/* Intento de palabra */}
                <div className={`p-3 rounded-lg border ${theme === 'minimal' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-700'}`}>
                  <p className={`text-sm font-semibold mb-2 ${theme === 'minimal' ? 'text-slate-700' : 'text-slate-300'}`}>
                    💬 {t('guessEndpoint')}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 p-2 rounded text-xs break-all ${theme === 'minimal' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-green-400'}`}>
                      {baseUrl}/api/guess?user=<span className="text-yellow-400">{'{'} username{'}'}</span>&word=<span className="text-yellow-400">{'{'} comment{'}'}</span>
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${baseUrl}/api/guess?user={username}&word={comment}`, 'guess')}
                    >
                      {copiedEndpoint === 'guess' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Revelar letra */}
                <div className={`p-3 rounded-lg border ${theme === 'minimal' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-700'}`}>
                  <p className={`text-sm font-semibold mb-2 ${theme === 'minimal' ? 'text-slate-700' : 'text-slate-300'}`}>
                    👁️ {t('revealLetterEvent')}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 p-2 rounded text-xs break-all ${theme === 'minimal' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-green-400'}`}>
                      {baseUrl}/api/event?user=<span className="text-yellow-400">{'{'} username{'}'}</span>&event=reveal_letter
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${baseUrl}/api/event?user={username}&event=reveal_letter`, 'reveal')}
                    >
                      {copiedEndpoint === 'reveal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Doble puntos */}
                <div className={`p-3 rounded-lg border ${theme === 'minimal' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-700'}`}>
                  <p className={`text-sm font-semibold mb-2 ${theme === 'minimal' ? 'text-slate-700' : 'text-slate-300'}`}>
                    🔥 {t('doublePointsEvent')}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 p-2 rounded text-xs break-all ${theme === 'minimal' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-green-400'}`}>
                      {baseUrl}/api/event?user=<span className="text-yellow-400">{'{'} username{'}'}</span>&event=double_points&duration=30
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${baseUrl}/api/event?user={username}&event=double_points&duration=30`, 'double')}
                    >
                      {copiedEndpoint === 'double' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Nueva ronda */}
                <div className={`p-3 rounded-lg border ${theme === 'minimal' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-700'}`}>
                  <p className={`text-sm font-semibold mb-2 ${theme === 'minimal' ? 'text-slate-700' : 'text-slate-300'}`}>
                    🎮 {t('newRoundEvent')}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 p-2 rounded text-xs break-all ${theme === 'minimal' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-green-400'}`}>
                      {baseUrl}/api/event?user=<span className="text-yellow-400">{'{'} username{'}'}</span>&event=nueva_ronda
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${baseUrl}/api/event?user={username}&event=nueva_ronda`, 'newround')}
                    >
                      {copiedEndpoint === 'newround' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Outgoing Webhook */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
                📤 {t('outgoingWebhook')} ({t('optional')})
              </h3>
              <p className={`text-sm mb-3 ${theme === 'minimal' ? 'text-slate-600' : 'text-slate-400'}`}>
                {t('outgoingDescription')}
              </p>
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
            </div>

            {/* Auth Token */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}`}>
                🔒 {t('authToken')}
              </h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Click generate to create a secure token"
                  className={`flex-1 font-mono text-sm ${theme === 'minimal' ? 'bg-white border-slate-300' : 'bg-slate-800 border-purple-500/30 text-white'}`}
                />
                <Button onClick={generateToken} variant="outline">
                  {t('generateToken')}
                </Button>
                {authToken && (
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(authToken, 'token')}
                  >
                    {copiedEndpoint === 'token' ? (
                      <><Check className="w-4 h-4" /></>
                    ) : (
                      <><Copy className="w-4 h-4" /></>
                    )}
                  </Button>
                )}
              </div>
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
