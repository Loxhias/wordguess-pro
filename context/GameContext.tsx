"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useMagicWebhook, MagicWebhookHelpers } from '@/hooks/use-magic-webhook'
import { useIncomingWebhooks } from '@/hooks/use-incoming-webhooks'
import { getAllWords } from '@/lib/words'
import type { Player, Winner, GameState, GameConfig } from '@/types/game'

interface GameContextType {
  // State
  gameState: GameState
  players: Player[]
  config: GameConfig
  
  // Game Actions
  startNewRound: (word?: string, hint?: string) => void
  endRound: (hasWinner: boolean, winnerName?: string, points?: number) => void
  togglePause: () => void
  revealRandomLetter: () => void
  revealAllLetters: () => void
  
  // Player Actions
  addWinner: (playerName: string, points: number) => void
  addPoints: (playerName: string, points: number) => void
  resetPlayers: () => void
  
  // Special Actions
  activateDoublePoints: (duration?: number) => void
  
  // Config
  updateConfig: (newConfig: Partial<GameConfig>) => void
}

// ============================================
// CONTEXT
// ============================================

const GameContext = createContext<GameContextType | undefined>(undefined)

// ============================================
// PROVIDER
// ============================================

const STORAGE_KEYS = {
  PLAYERS: 'wordguess_players',
  CONFIG: 'wordguess_config',
  GAME_STATE: 'wordguess_game_state',
}

export function GameProvider({ children }: { children: ReactNode }) {
  // ============================================
  // WEBHOOKS
  // ============================================
  
  const { sendWebhook, isEnabled: webhookEnabled } = useMagicWebhook()
  const { guesses, events, markProcessed } = useIncomingWebhooks(true)

  // ============================================
  // STATE
  // ============================================

  const [gameState, setGameState] = useState<GameState>({
    currentWord: '',
    currentHint: '',
    revealedIndices: [],
    isActive: false,
    startTime: 0,
    duration: 180,
    timeLeft: 180,
    isRunning: false,
    isFinished: false,
    doublePointsActive: false,
    doublePointsUntil: 0,
    winners: [],
    winner: null,
    winnerPoints: 0,
  })

  const [players, setPlayers] = useState<Player[]>([])

  const [config, setConfig] = useState<GameConfig>({
    roundDuration: 180,
    revealInterval: 15,
    doublePointsDuration: 30,
  })

  // ============================================
  // GAME ACTIONS (BEFORE useEffect)
  // ============================================

  const startNewRound = useCallback((word?: string, hint?: string) => {
    if (!word) {
      console.warn('No word provided for new round')
      return
    }

    const newWord = word.toUpperCase()

    setGameState({
      currentWord: newWord,
      currentHint: hint || '',
      revealedIndices: [],
      isActive: true,
      startTime: Date.now(),
      duration: config.roundDuration,
      timeLeft: config.roundDuration,
      isRunning: true,
      isFinished: false,
      doublePointsActive: false,
      doublePointsUntil: 0,
      winners: [],
      winner: null,
      winnerPoints: 0,
    })

    // 🔥 WEBHOOK: Nueva ronda iniciada
    if (webhookEnabled) {
      MagicWebhookHelpers.roundStart(sendWebhook)(newWord, hint || '', config.roundDuration)
    }
  }, [config.roundDuration, webhookEnabled, sendWebhook])

  const endRound = useCallback((hasWinner: boolean, winnerName?: string, points?: number) => {
    setGameState((prev) => {
      // 🔥 WEBHOOK: Ronda finalizada
      if (webhookEnabled) {
        if (hasWinner && winnerName && points) {
          MagicWebhookHelpers.gameWin(sendWebhook)(winnerName, points, prev.currentWord)
        } else {
          const timeElapsed = prev.duration - prev.timeLeft
          MagicWebhookHelpers.roundEnd(sendWebhook)(prev.currentWord, timeElapsed)
        }
      }

      return {
        ...prev,
        isRunning: false,
        isFinished: true,
        winner: winnerName || null,
        winnerPoints: points || 0,
        revealedIndices: Array.from({ length: prev.currentWord.length }, (_, i) => i),
      }
    })
  }, [webhookEnabled, sendWebhook])

  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isRunning: !prev.isRunning }))
  }, [])

  const revealRandomLetter = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentWord) return prev

      const unrevealedIndices = Array.from({ length: prev.currentWord.length }, (_, i) => i).filter(
        (i) => !prev.revealedIndices.includes(i)
      )

      if (unrevealedIndices.length === 0) return prev

      const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)]
      const letter = prev.currentWord[randomIndex]
      const newRevealedIndices = [...prev.revealedIndices, randomIndex]

      // 🔥 WEBHOOK: Letra revelada
      if (webhookEnabled) {
        MagicWebhookHelpers.letterRevealed(sendWebhook)(
          letter,
          randomIndex,
          newRevealedIndices.length,
          prev.currentWord.length
        )
      }

      return {
        ...prev,
        revealedIndices: newRevealedIndices,
      }
    })
  }, [webhookEnabled, sendWebhook])

  const revealAllLetters = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      revealedIndices: Array.from({ length: prev.currentWord.length }, (_, i) => i),
    }))
  }, [])

  // ============================================
  // PLAYER ACTIONS
  // ============================================

  const addWinner = useCallback((playerName: string, points: number) => {
    setGameState((prev) => ({
      ...prev,
      winners: [...prev.winners, { playerName, timestamp: Date.now(), points }],
    }))
  }, [])

  const addPoints = useCallback((playerName: string, points: number) => {
    setPlayers((prev) => {
      const existingPlayer = prev.find((p) => p.name === playerName)

      if (existingPlayer) {
        return prev.map((p) =>
          p.name === playerName
            ? { ...p, points: p.points + points, lastUpdated: Date.now() }
            : p
        )
      } else {
        return [...prev, { name: playerName, points, lastUpdated: Date.now() }]
      }
    })
  }, [])

  const resetPlayers = useCallback(() => {
    setPlayers([])
    localStorage.removeItem(STORAGE_KEYS.PLAYERS)
  }, [])

  // ============================================
  // SPECIAL ACTIONS
  // ============================================

  const activateDoublePoints = useCallback((duration: number = 30) => {
    setGameState((prev) => ({
      ...prev,
      doublePointsActive: true,
      doublePointsUntil: Date.now() + duration * 1000,
    }))

    // 🔥 WEBHOOK: Puntos dobles activados
    if (webhookEnabled) {
      MagicWebhookHelpers.doublePoints(sendWebhook)(duration)
    }
  }, [webhookEnabled, sendWebhook])

  // ============================================
  // CONFIG
  // ============================================

  const updateConfig = useCallback((newConfig: Partial<GameConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  // ============================================
  // EFFECTS (AFTER all useCallback)
  // ============================================

  // Load from localStorage
  useEffect(() => {
    const savedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS)
    if (savedPlayers) {
      try {
        setPlayers(JSON.parse(savedPlayers))
      } catch (error) {
        console.error('Error loading players:', error)
      }
    }

    const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG)
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig({
          roundDuration: parsedConfig.roundDuration || 180,
          revealInterval: parsedConfig.revealInterval || 15,
          doublePointsDuration: parsedConfig.doublePointsDuration || 30,
        })
      } catch (error) {
        console.error('Error loading config:', error)
      }
    }
  }, [])

  // Save players to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
  }, [players])

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  }, [config])

  // Timer logic
  useEffect(() => {
    if (gameState.isRunning && gameState.timeLeft > 0 && !gameState.isFinished) {
      const timer = setTimeout(() => {
        setGameState((prev) => {
          const newTimeLeft = prev.timeLeft - 1
          
          if (newTimeLeft === 10 && webhookEnabled) {
            MagicWebhookHelpers.timerWarning(sendWebhook)(10)
          }
          
          return { ...prev, timeLeft: newTimeLeft }
        })
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameState.timeLeft === 0 && !gameState.isFinished && gameState.isActive) {
      endRound(false)
    }
  }, [gameState.isRunning, gameState.timeLeft, gameState.isFinished, gameState.isActive, webhookEnabled, sendWebhook, endRound])

  // Auto-reveal logic
  useEffect(() => {
    if (gameState.isRunning && gameState.currentWord && !gameState.isFinished) {
      const elapsed = config.roundDuration - gameState.timeLeft
      const shouldRevealCount = Math.floor(elapsed / config.revealInterval)
      const currentRevealCount = gameState.revealedIndices.length

      if (shouldRevealCount > currentRevealCount && currentRevealCount < gameState.currentWord.length) {
        revealRandomLetter()
      }
    }
  }, [gameState.timeLeft, gameState.isRunning, gameState.currentWord, gameState.isFinished, config.roundDuration, config.revealInterval, revealRandomLetter])

  // Double points check
  useEffect(() => {
    if (gameState.doublePointsActive && Date.now() > gameState.doublePointsUntil) {
      setGameState((prev) => ({ ...prev, doublePointsActive: false }))
    }
  }, [gameState.doublePointsActive, gameState.doublePointsUntil])

  // Process incoming webhooks (guesses)
  useEffect(() => {
    if (guesses.length === 0) return

    guesses.forEach((guess) => {
      const normalizedGuess = guess.word.toUpperCase().trim()
      const currentWord = gameState.currentWord.toUpperCase().trim()

      if (normalizedGuess === currentWord && gameState.isRunning) {
        // ¡Palabra correcta!
        const points = gameState.doublePointsActive ? 200 : 100
        addPoints(guess.user, points)
        endRound(true, guess.user, points)
      }

      // Mark as processed
      markProcessed(guess.id)
    })
  }, [guesses, gameState.currentWord, gameState.isRunning, gameState.doublePointsActive, addPoints, endRound, markProcessed])

  // Process incoming webhooks (events)
  useEffect(() => {
    if (events.length === 0) return

    console.log('🔔 [Webhook] Eventos recibidos:', events)

    events.forEach((event) => {
      console.log('🎯 [Webhook] Procesando evento:', event.event, 'Usuario:', event.user)

      switch (event.event) {
        case 'reveal_letter':
          // Permitir revelar incluso si no hay ronda activa (iniciará una si es necesario)
          if (gameState.isRunning && gameState.currentWord) {
            console.log('✅ [Webhook] Revelando letra...')
            revealRandomLetter()
          } else if (!gameState.isRunning) {
            console.warn('⚠️ [Webhook] No hay ronda activa. Usa /api/event?event=nueva_ronda primero')
            // Auto-iniciar ronda si hay palabras
            const allWords = getAllWords()
            if (allWords.length > 0) {
              const randomWord = allWords[Math.floor(Math.random() * allWords.length)]
              console.log('🚀 [Webhook] Auto-iniciando ronda con palabra:', randomWord.word)
              startNewRound(randomWord.word, randomWord.hint)
              // Revelar después de 500ms
              setTimeout(() => revealRandomLetter(), 500)
            } else {
              console.error('❌ [Webhook] No hay palabras configuradas en /config')
            }
          }
          break
        case 'double_points':
          if (gameState.isRunning) {
            const duration = event.duration || config.doublePointsDuration
            console.log('✅ [Webhook] Activando puntos dobles por', duration, 'segundos')
            activateDoublePoints(duration)
          } else {
            console.warn('⚠️ [Webhook] No hay ronda activa para activar puntos dobles')
          }
          break
        case 'nueva_ronda':
          const allWords = getAllWords()
          if (allWords.length > 0) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)]
            console.log('✅ [Webhook] Iniciando nueva ronda con:', randomWord.word)
            startNewRound(randomWord.word, randomWord.hint)
          } else {
            console.error('❌ [Webhook] No hay palabras configuradas en /config')
          }
          break
        default:
          console.warn('⚠️ [Webhook] Evento desconocido:', event.event)
      }

      // Mark as processed
      markProcessed(event.id)
    })
  }, [events, gameState.isRunning, gameState.currentWord, config.doublePointsDuration, revealRandomLetter, activateDoublePoints, startNewRound, markProcessed])

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: GameContextType = {
    gameState,
    players,
    config,
    startNewRound,
    endRound,
    togglePause,
    revealRandomLetter,
    revealAllLetters,
    addWinner,
    addPoints,
    resetPlayers,
    activateDoublePoints,
    updateConfig,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// ============================================
// HOOK
// ============================================

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
