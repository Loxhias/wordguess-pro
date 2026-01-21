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
    // Detectar entorno: producción (Cloudflare) o local (localhost)
    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    const isProd = hostname !== 'localhost' && hostname !== '127.0.0.1'
    setIsProduction(isProd)
    
    if (isProd) {
      console.log('✅ [Polling] Activado en PRODUCCIÓN (' + hostname + ')')
    } else {
      console.log('✅ [Polling] Activado en LOCAL (localhost:3016)')
      console.log('💡 [Polling] Inicia el servidor local: npm run dev:webhooks')
    }
  }, [])

  const fetchPending = useCallback(async () => {
    if (!enabled) return

    try {
      // En local, usar puerto 3016; en producción, usar mismo dominio
      const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
      const baseUrl = isLocal ? 'http://localhost:3016' : ''
      
      const response = await fetch(`${baseUrl}/api/pending`, { 
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
            mode: isLocal ? 'LOCAL' : 'PRODUCCIÓN',
            data
          })
        }
        
        setGuesses(data.guesses || [])
        setEvents(data.events || [])
      }
    } catch (error) {
      // Solo mostrar error si está activo
      if (enabled) {
        console.error('⚠️ [Polling] Error:', error)
        console.log('💡 Asegúrate de que el servidor esté corriendo: npm run dev:webhooks')
      }
    }
  }, [enabled])

  const markProcessed = useCallback(async (id: string) => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
    const baseUrl = isLocal ? 'http://localhost:3016' : ''

    try {
      await fetch(`${baseUrl}/api/mark-processed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: id }),
        cache: 'no-store'
      })
    } catch (error) {
      console.error('Error marking as processed:', error)
    }
  }, [])

  // Polling every 1 second (local y producción)
  useEffect(() => {
    if (!enabled) return

    fetchPending()
    const interval = setInterval(fetchPending, 1000)
    return () => clearInterval(interval)
  }, [enabled, fetchPending])

  return {
    guesses,
    events,
    markProcessed,
    refetch: fetchPending
  }
}
