"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { useMagicWebhook, MagicWebhookHelpers } from '@/hooks/use-magic-webhook'
import { useIncomingWebhooks } from '@/hooks/use-incoming-webhooks'
import { usePostMessage } from '@/hooks/use-post-message'
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

const GameContext = createContext<GameContextType | undefined>(undefined)

const STORAGE_KEYS = {
  PLAYERS: 'wordguess_players',
  CONFIG: 'wordguess_config',
}

export function GameProvider({ children }: { children: ReactNode }) {
  // ============================================
  // WEBHOOKS
  // ============================================
  
  const { sendWebhook, isEnabled: webhookEnabled } = useMagicWebhook()
  const { guesses, events, markProcessed } = useIncomingWebhooks(true)
  
  // Track processed webhook IDs to prevent duplicates
  const processedWebhooks = useRef<Set<string>>(new Set())

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

  // Ref para evitar múltiples revelaciones automáticas
  const lastRevealTime = useRef<number>(0)

  // ============================================
  // GAME ACTIONS
  // ============================================

  const startNewRound = useCallback((word?: string, hint?: string) => {
    if (!word) {
      console.warn('[Game] No word provided for new round')
      return
    }

    const newWord = word.toUpperCase()
    console.log('[Game] Starting new round:', newWord)

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

    // Reset reveal time
    lastRevealTime.current = 0

    // Webhook: Nueva ronda iniciada
    if (webhookEnabled) {
      MagicWebhookHelpers.roundStart(sendWebhook)(newWord, hint || '', config.roundDuration)
    }
  }, [config.roundDuration, webhookEnabled, sendWebhook])

  const endRound = useCallback((hasWinner: boolean, winnerName?: string, points?: number) => {
    setGameState((prev) => {
      // No terminar si ya está terminada
      if (prev.isFinished) {
        console.log('[Game] Round already finished, ignoring endRound call')
        return prev
      }

      console.log('[Game] Ending round. Winner:', hasWinner, winnerName, points)

      // Webhook: Ronda finalizada
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
    setGameState((prev) => {
      console.log('[Game] Toggling pause. Current:', prev.isRunning)
      return { ...prev, isRunning: !prev.isRunning }
    })
  }, [])

  const revealRandomLetter = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentWord) {
        console.log('[Game] Cannot reveal: no current word')
        return prev
      }

      if (prev.isFinished) {
        console.log('[Game] Cannot reveal: round finished')
        return prev
      }

      const unrevealedIndices = Array.from({ length: prev.currentWord.length }, (_, i) => i).filter(
        (i) => !prev.revealedIndices.includes(i)
      )

      if (unrevealedIndices.length === 0) {
        console.log('[Game] All letters already revealed')
        return prev
      }

      const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)]
      const letter = prev.currentWord[randomIndex]
      const newRevealedIndices = [...prev.revealedIndices, randomIndex]

      console.log('[Game] Revealing letter:', letter, 'at position:', randomIndex)

      // Webhook: Letra revelada
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
    setGameState((prev) => {
      console.log('[Game] Activating double points for', duration, 'seconds')
      return {
        ...prev,
        doublePointsActive: true,
        doublePointsUntil: Date.now() + duration * 1000,
      }
    })

    // Webhook: Puntos dobles activados
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
  // EFFECTS
  // ============================================

  // Load from localStorage (only once)
  useEffect(() => {
    const savedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS)
    if (savedPlayers) {
      try {
        setPlayers(JSON.parse(savedPlayers))
      } catch (error) {
        console.error('[Storage] Error loading players:', error)
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
        console.error('[Storage] Error loading config:', error)
      }
    }
  }, [])

  // Save players to localStorage
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
    }
  }, [players])

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  }, [config])

  // Timer logic
  useEffect(() => {
    if (!gameState.isRunning || gameState.timeLeft <= 0 || gameState.isFinished) {
      return
    }

    const timer = setTimeout(() => {
      setGameState((prev) => {
        const newTimeLeft = prev.timeLeft - 1
        
        // Timer warning at 10 seconds
        if (newTimeLeft === 10 && webhookEnabled) {
          MagicWebhookHelpers.timerWarning(sendWebhook)(10)
        }
        
        return { ...prev, timeLeft: newTimeLeft }
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [gameState.isRunning, gameState.timeLeft, gameState.isFinished, webhookEnabled, sendWebhook])

  // End round when time reaches 0
  useEffect(() => {
    if (gameState.timeLeft === 0 && !gameState.isFinished && gameState.isActive) {
      console.log('[Game] Time is up, ending round')
      endRound(false)
    }
  }, [gameState.timeLeft, gameState.isFinished, gameState.isActive, endRound])

  // Auto-reveal logic
  useEffect(() => {
    if (!gameState.isRunning || !gameState.currentWord || gameState.isFinished) {
      return
    }

    const elapsed = config.roundDuration - gameState.timeLeft
    const shouldRevealCount = Math.floor(elapsed / config.revealInterval)
    const currentRevealCount = gameState.revealedIndices.length

    // Solo revelar si:
    // 1. Debería revelar más letras según el tiempo
    // 2. Aún hay letras por revelar
    // 3. No ha revelado en el último segundo (evitar múltiples revelaciones)
    if (shouldRevealCount > currentRevealCount && 
        currentRevealCount < gameState.currentWord.length &&
        Date.now() - lastRevealTime.current > 1000) {
      lastRevealTime.current = Date.now()
      revealRandomLetter()
    }
  }, [gameState.isRunning, gameState.currentWord, gameState.isFinished, gameState.timeLeft, gameState.revealedIndices.length, config.roundDuration, config.revealInterval, revealRandomLetter])

  // Double points check
  useEffect(() => {
    if (!gameState.doublePointsActive) return

    const checkInterval = setInterval(() => {
      if (Date.now() > gameState.doublePointsUntil) {
        console.log('[Game] Double points expired')
        setGameState((prev) => ({ ...prev, doublePointsActive: false }))
      }
    }, 1000)

    return () => clearInterval(checkInterval)
  }, [gameState.doublePointsActive, gameState.doublePointsUntil])

  // Process incoming webhooks (guesses) - SOLO UNA VEZ POR GUESS
  useEffect(() => {
    if (guesses.length === 0) return

    guesses.forEach((guess) => {
      // Skip if already processed
      if (processedWebhooks.current.has(guess.id)) {
        return
      }

      console.log('[Webhook] Processing guess:', guess.id, guess.word, 'from', guess.user)
      processedWebhooks.current.add(guess.id)

      const normalizedGuess = guess.word.toUpperCase().trim()
      const currentWord = gameState.currentWord.toUpperCase().trim()

      if (normalizedGuess === currentWord && gameState.isRunning && !gameState.isFinished) {
        console.log('[Webhook] ✅ Correct guess!')
        const points = gameState.doublePointsActive ? 200 : 100
        addPoints(guess.user, points)
        endRound(true, guess.user, points)
      } else {
        console.log('[Webhook] ❌ Wrong guess or game not active')
      }

      // Mark as processed in backend
      markProcessed(guess.id)
    })
  }, [guesses])

  // Process incoming webhooks (events) - SOLO UNA VEZ POR EVENTO
  useEffect(() => {
    if (events.length === 0) return

    events.forEach((event) => {
      // Skip if already processed
      if (processedWebhooks.current.has(event.id)) {
        return
      }

      console.log('[Webhook] Processing event:', event.id, event.event, 'from', event.user)
      processedWebhooks.current.add(event.id)

      switch (event.event) {
        case 'reveal_letter':
          if (gameState.isRunning && gameState.currentWord && !gameState.isFinished) {
            console.log('[Webhook] ✅ Revealing letter')
            revealRandomLetter()
          } else {
            console.warn('[Webhook] ⚠️ Cannot reveal: game not active')
          }
          break

        case 'double_points':
          if (gameState.isRunning && !gameState.isFinished) {
            const duration = event.duration || config.doublePointsDuration
            console.log('[Webhook] ✅ Activating double points')
            activateDoublePoints(duration)
          } else {
            console.warn('[Webhook] ⚠️ Cannot activate double points: game not active')
          }
          break

        case 'nueva_ronda':
          const allWords = getAllWords()
          if (allWords.length > 0) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)]
            console.log('[Webhook] ✅ Starting new round')
            startNewRound(randomWord.word, randomWord.hint)
          } else {
            console.error('[Webhook] ❌ No words configured')
          }
          break

        default:
          console.warn('[Webhook] ⚠️ Unknown event:', event.event)
      }

      // Mark as processed in backend
      markProcessed(event.id)
    })
  }, [events])

  // Cleanup processed webhooks periodically (keep only last 100)
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (processedWebhooks.current.size > 100) {
        const arr = Array.from(processedWebhooks.current)
        processedWebhooks.current = new Set(arr.slice(-100))
      }
    }, 60000) // Every minute

    return () => clearInterval(cleanup)
  }, [])

  // ============================================
  // POST MESSAGE (Magic By Loxhias)
  // ============================================

  usePostMessage({
    onRevealLetter: () => {
      if (gameState.isRunning && gameState.currentWord && !gameState.isFinished) {
        console.log('[PostMessage] ✅ Revealing letter')
        revealRandomLetter()
      } else {
        console.warn('[PostMessage] ⚠️ Cannot reveal: game not active')
      }
    },
    onNewRound: () => {
      const allWords = getAllWords()
      if (allWords.length > 0) {
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)]
        console.log('[PostMessage] ✅ Starting new round with:', randomWord.word)
        startNewRound(randomWord.word, randomWord.hint)
      } else {
        console.error('[PostMessage] ❌ No words configured. Add words in /config')
      }
    },
    onDoublePoints: (duration) => {
      if (gameState.isRunning && !gameState.isFinished) {
        console.log('[PostMessage] ✅ Activating double points')
        activateDoublePoints(duration)
      } else {
        console.warn('[PostMessage] ⚠️ Cannot activate double points: game not active')
      }
    },
    onGuess: (user, word) => {
      const normalizedGuess = word.toUpperCase().trim()
      const currentWord = gameState.currentWord.toUpperCase().trim()

      if (normalizedGuess === currentWord && gameState.isRunning && !gameState.isFinished) {
        console.log('[PostMessage] ✅ Correct guess!')
        const points = gameState.doublePointsActive ? 200 : 100
        addPoints(user, points)
        endRound(true, user, points)
      } else if (!gameState.isRunning) {
        console.warn('[PostMessage] ⚠️ Game not active')
      } else if (gameState.isFinished) {
        console.warn('[PostMessage] ⚠️ Round already finished')
      } else {
        console.log('[PostMessage] ❌ Wrong guess:', normalizedGuess, '!=', currentWord)
      }
    }
  })

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

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
