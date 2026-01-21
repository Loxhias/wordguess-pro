"use client"

import { useEffect } from 'react'

interface GameAction {
  type: 'GAME_ACTION'
  action: 'reveal_letter' | 'nueva_ronda' | 'double_points' | 'guess'
  data?: {
    user?: string
    word?: string
    duration?: number
  }
  timestamp: number
}

interface UsePostMessageCallbacks {
  onRevealLetter: () => void
  onNewRound: () => void
  onDoublePoints: (duration: number) => void
  onGuess: (user: string, word: string) => void
}

/**
 * Hook para recibir acciones desde Magic By Loxhias via postMessage
 * 
 * @example
 * usePostMessage({
 *   onRevealLetter: () => console.log('Reveal letter'),
 *   onNewRound: () => console.log('New round'),
 *   onDoublePoints: (duration) => console.log('Double points:', duration),
 *   onGuess: (user, word) => console.log('Guess:', user, word)
 * })
 */
export function usePostMessage({
  onRevealLetter,
  onNewRound,
  onDoublePoints,
  onGuess
}: UsePostMessageCallbacks) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    function handleMessage(event: MessageEvent) {
      // IMPORTANTE: En producción, verifica el origen
      // if (event.origin !== 'https://magic-by-loxhias.com') return
      
      const message = event.data as GameAction
      
      // Verificar que es un mensaje para el juego
      if (message.type !== 'GAME_ACTION') return
      
      console.log('[PostMessage] 📨 Received:', message.action, message.data)
      
      switch (message.action) {
        case 'reveal_letter':
          console.log('[PostMessage] ✨ Revealing letter...')
          onRevealLetter()
          break
          
        case 'nueva_ronda':
          console.log('[PostMessage] 🎮 Starting new round...')
          onNewRound()
          break
          
        case 'double_points':
          const duration = message.data?.duration || 30
          console.log('[PostMessage] 🔥 Activating double points for', duration, 'seconds')
          onDoublePoints(duration)
          break
          
        case 'guess':
          if (message.data?.user && message.data?.word) {
            console.log('[PostMessage] 💬 Processing guess:', message.data.user, '→', message.data.word)
            onGuess(message.data.user, message.data.word)
          } else {
            console.warn('[PostMessage] ⚠️ Guess action missing user or word')
          }
          break
          
        default:
          console.warn('[PostMessage] ⚠️ Unknown action:', message.action)
      }
    }
    
    console.log('[PostMessage] 🎧 Listening for messages from Magic By Loxhias...')
    window.addEventListener('message', handleMessage)
    
    return () => {
      console.log('[PostMessage] 🔇 Stopped listening')
      window.removeEventListener('message', handleMessage)
    }
  }, [onRevealLetter, onNewRound, onDoublePoints, onGuess])
}
