"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Pause, Eye, SkipForward, Lightbulb, Bug, ChevronDown, ChevronUp, Copy, CheckCircle2 } from "lucide-react"
import { GameProvider, useGame } from "@/context/GameContext"
import { getRandomWord, getAllWords } from "@/lib/words"
import { useTheme } from "@/hooks/use-theme"
import { useLanguage } from "@/hooks/use-language"
import { useIncomingWebhooks } from "@/hooks/use-incoming-webhooks"
import { ThemedLetterTile } from "@/components/game/themed-letter-tile"
import { ThemedTimer } from "@/components/game/themed-timer"
import { GameModal } from "@/components/game/game-modal"
import { RankingBoard } from "@/components/game/ranking-board"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function GameContent() {
  const { gameState, startNewRound, revealRandomLetter, togglePause, endRound, players, resetPlayers, config } = useGame()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)
  const [hintRevealed, setHintRevealed] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  
  // Webhooks (opcional - solo para streamers)
  const { guesses, events } = useIncomingWebhooks(true)
  const [isProduction, setIsProduction] = useState(false)
  const [webhookLogs, setWebhookLogs] = useState<string[]>([])

  useEffect(() => {
    const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    setIsProduction(isProd)
  }, [])

  // Track para evitar logs duplicados
  const processedLogIds = React.useRef<Set<string>>(new Set())

  useEffect(() => {
    events.forEach(event => {
      if (!processedLogIds.current.has(event.id)) {
        processedLogIds.current.add(event.id)
        setWebhookLogs(prev => [
          ...prev.slice(-4),
          `${new Date().toLocaleTimeString()} - Evento: ${event.event} (${event.user})`
        ])
      }
    })
  }, [events])

  useEffect(() => {
    guesses.forEach(guess => {
      if (!processedLogIds.current.has(guess.id)) {
        processedLogIds.current.add(guess.id)
        setWebhookLogs(prev => [
          ...prev.slice(-4),
          `${new Date().toLocaleTimeString()} - Intento: ${guess.word} (${guess.user})`
        ])
      }
    })
  }, [guesses])

  // Reset hint cuando cambia la palabra
  useEffect(() => {
    setHintRevealed(false)
  }, [gameState.currentWord])

  // Controlar apertura del modal SOLO UNA VEZ cuando termina la ronda
  const hasShownModal = React.useRef(false)
  
  useEffect(() => {
    if (gameState.isFinished && !hasShownModal.current) {
      hasShownModal.current = true
      setTimeout(() => setModalOpen(true), 1000)
    } else if (!gameState.isFinished) {
      // Resetear cuando inicia nueva ronda
      hasShownModal.current = false
    }
  }, [gameState.isFinished])

  const handleStartRound = () => {
    const word = getRandomWord(gameState.currentWord)
    if (!word) {
      alert(t('addWordsFirst'))
      return
    }
    
    console.log('[UI] Starting new round:', word.word)
    
    // Cerrar modal primero
    setModalOpen(false)
    
    // Pequeño delay para asegurar que el modal se cierra antes de resetear el estado
    setTimeout(() => {
      startNewRound(word.word, word.hint)
    }, 100)
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(id)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const webhookUrls = [
    { id: 'nueva_ronda', name: 'Nueva Ronda', url: `${baseUrl}/api/event?user={username}&event=nueva_ronda` },
    { id: 'reveal', name: 'Revelar Letra', url: `${baseUrl}/api/event?user={username}&event=reveal_letter` },
    { id: 'double', name: 'Puntos Dobles', url: `${baseUrl}/api/event?user={username}&event=double_points&duration=30` },
    { id: 'guess', name: 'Adivinar', url: `${baseUrl}/api/guess?user={username}&word={palabra}` },
  ]

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors[theme]} p-4 transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer */}
            {gameState.currentWord && (
              <div className="flex justify-center">
                <ThemedTimer
                  timeLeft={gameState.timeLeft}
                  totalTime={config.roundDuration}
                  theme={theme}
                />
              </div>
            )}

            {/* Word Display */}
            <Card className={`border-purple-500/30 bg-slate-900/50 backdrop-blur-xl ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
              <CardContent className="p-8">
                {gameState.currentWord ? (
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {gameState.currentWord.split('').map((letter, i) => (
                      <ThemedLetterTile
                        key={`${gameState.currentWord}-${i}-${gameState.startTime}`}
                        letter={letter}
                        revealed={gameState.revealedIndices.includes(i) || gameState.isFinished}
                        isCorrectGuess={gameState.isFinished && gameState.winner !== null}
                        delay={i * 100}
                        theme={theme}
                        wordLength={gameState.currentWord.length}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 mb-6 text-lg">{t('noActiveRound')}</p>
                    <Button
                      onClick={handleStartRound}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {t('startNewRound')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hint */}
            {gameState.currentWord && gameState.currentHint && (
              <Card className={`border-yellow-500/30 bg-slate-900/50 backdrop-blur-xl ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
                <CardContent className="p-6">
                  {!hintRevealed ? (
                    <button
                      onClick={() => setHintRevealed(true)}
                      className="w-full flex items-center justify-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>{t('clickToRevealHint')}</span>
                    </button>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-400 mb-1">{t('hint')}</p>
                        <p className="text-white font-medium">{gameState.currentHint}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Controls */}
            {gameState.currentWord && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={revealRandomLetter}
                  disabled={!gameState.isRunning || gameState.revealedIndices.length >= gameState.currentWord.length}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('revealLetter')}
                </Button>
                <Button
                  onClick={togglePause}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  {gameState.isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      {t('pause')}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {t('resume')}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => endRound(false)}
                  disabled={!gameState.isRunning}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  {t('endRound')}
                </Button>
                <Button
                  onClick={handleStartRound}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t('newRound')}
                </Button>
              </div>
            )}

            {/* Double Points Indicator */}
            {gameState.doublePointsActive && (
              <Card className="border-yellow-500/50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl animate-pulse">
                <CardContent className="p-4 text-center">
                  <p className="text-yellow-400 font-bold text-lg">
                    🔥 {t('doublePointsDuration')} ACTIVE! 🔥
                  </p>
                  <p className="text-yellow-300 text-sm mt-1">
                    {Math.ceil((gameState.doublePointsUntil - Date.now()) / 1000)}s {t('timeLeft')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Ranking */}
          <div className="lg:col-span-1">
            <RankingBoard players={players} onResetRanking={resetPlayers} />
          </div>
        </div>

        {/* Game Modal */}
        <GameModal
          isOpen={modalOpen}
          type={gameState.winner ? "winner" : "no-winner"}
          winner={gameState.winner || undefined}
          word={gameState.currentWord}
          points={gameState.winnerPoints}
          onClose={() => setModalOpen(false)}
          onNewRound={handleStartRound}
        />

        {/* Debug Panel */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          {!debugOpen ? (
            <div className="flex justify-center pb-4">
              <Button
                onClick={() => setDebugOpen(true)}
                size="sm"
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-300 backdrop-blur-sm"
              >
                <Bug className="w-4 h-4 mr-2" />
                Debug Panel
                <ChevronUp className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <Card className="border-t-2 border-purple-500/50 bg-slate-900/95 backdrop-blur-xl rounded-t-xl rounded-b-none">
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <Bug className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Debug Panel - Estado del Juego</h3>
                  </div>
                  <Button
                    onClick={() => setDebugOpen(false)}
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Local Storage */}
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">💾 Almacenamiento</div>
                    <div className="text-sm font-semibold text-green-400">Local (Navegador)</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {getAllWords().length} palabras
                    </div>
                  </div>

                  {/* Game Status */}
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">🎮 Estado</div>
                    <div className={`text-sm font-semibold ${gameState.isRunning ? 'text-green-400' : 'text-yellow-400'}`}>
                      {gameState.isRunning ? 'Jugando' : 'En pausa'}
                    </div>
                    {gameState.currentWord && (
                      <div className="text-xs text-slate-500 mt-1">
                        {gameState.revealedIndices.length}/{gameState.currentWord.length} letras
                      </div>
                    )}
                  </div>

                  {/* Players */}
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">👥 Jugadores</div>
                    <div className="text-sm font-semibold text-purple-400">
                      {players.length} en ranking
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {players.length > 0 ? `Top: ${players[0].name}` : 'Sin jugadores'}
                    </div>
                  </div>

                  {/* Webhooks Status */}
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">🔗 Webhooks</div>
                    <div className={`text-sm font-semibold ${isProduction ? 'text-green-400' : 'text-slate-500'}`}>
                      {isProduction ? 'Activados' : 'Desactivados'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {isProduction ? 'Producción' : 'Solo local'}
                    </div>
                  </div>
                </div>

                {/* Webhooks Section (solo si está en producción) */}
                {isProduction && (
                  <div className="border-t border-slate-700 pt-3">
                    <div className="text-sm text-slate-300 mb-3 flex items-center gap-2">
                      <span className="text-yellow-400">⚡</span>
                      <span className="font-semibold">Webhooks Entrantes</span>
                      <span className="text-xs text-slate-500">(Opcional - Para Streamers)</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {webhookUrls.map((webhook) => (
                        <div key={webhook.id} className="bg-slate-800/50 rounded p-2 flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-24">{webhook.name}:</span>
                          <code className="flex-1 text-xs text-purple-300 truncate">
                            {webhook.url}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(webhook.url, webhook.id)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedUrl === webhook.id ? (
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Webhook Logs */}
                    {webhookLogs.length > 0 && (
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-xs text-slate-400 mb-1">📥 Últimos webhooks:</div>
                        <div className="space-y-1">
                          {webhookLogs.slice(-5).map((log, i) => (
                            <div key={i} className="text-xs text-green-400 font-mono">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Info Note */}
                <div className="border-t border-slate-700 pt-3">
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>
                      ✅ <strong className="text-slate-300">El juego funciona 100% local</strong> - Todos los datos se guardan en tu navegador (LocalStorage).
                    </p>
                    <p>
                      ⚡ <strong className="text-slate-300">Webhooks = Opcional</strong> - Solo si quieres integrar con OBS, Streamlabs, o Magic By Loxhias.
                    </p>
                    {!isProduction && (
                      <p className="text-yellow-400">
                        ⚠️ Webhooks entrantes solo funcionan en producción (Cloudflare). En localhost el juego funciona normalmente sin ellos.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GamePage() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
