"use client"

import { useEffect, useState, useCallback } from 'react'

interface Guess {
  id: string
  user: string
  word: string
  timestamp: number
  processed: boolean
}

interface GameEvent {
  id: string
  user: string
  event: string
  duration?: number
  timestamp: number
  processed: boolean
}

interface PendingData {
  guesses: Guess[]
  events: GameEvent[]
}

export function useIncomingWebhooks(enabled: boolean = true) {
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [events, setEvents] = useState<GameEvent[]>([])
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Only enable in production (Cloudflare) where Functions are available
    const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    setIsProduction(isProd)
    
    if (isProd) {
      console.log('✅ [Polling] Activado en producción (' + window.location.hostname + ')')
    } else {
      console.log('⏸️ [Polling] Desactivado en localhost (solo funciona en Cloudflare)')
    }
  }, [])

  const fetchPending = useCallback(async () => {
    if (!enabled || !isProduction) return

    try {
      const response = await fetch('/api/pending', { 
        method: 'GET',
        cache: 'no-store'
      })
      if (response.ok) {
        const data: PendingData = await response.json()
        
        // Log solo cuando hay datos nuevos
        if (data.guesses?.length > 0 || data.events?.length > 0) {
          console.log('📥 [Polling] Webhooks recibidos:', {
            guesses: data.guesses?.length || 0,
            events: data.events?.length || 0,
            data
          })
        }
        
        setGuesses(data.guesses || [])
        setEvents(data.events || [])
      }
    } catch (error) {
      // Silently fail in development
      if (isProduction) {
        console.error('Error fetching pending webhooks:', error)
      }
    }
  }, [enabled, isProduction])

  const markProcessed = useCallback(async (id: string) => {
    if (!isProduction) return

    try {
      await fetch('/api/mark-processed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: id }),
        cache: 'no-store'
      })
    } catch (error) {
      // Silently fail in development
      if (isProduction) {
        console.error('Error marking as processed:', error)
      }
    }
  }, [isProduction])

  // Polling every 1 second (only in production)
  useEffect(() => {
    if (!enabled || !isProduction) return

    fetchPending()
    const interval = setInterval(fetchPending, 1000)
    return () => clearInterval(interval)
  }, [enabled, isProduction, fetchPending])

  return {
    guesses,
    events,
    markProcessed,
    refetch: fetchPending
  }
}
