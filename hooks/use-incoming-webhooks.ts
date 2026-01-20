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

  const fetchPending = useCallback(async () => {
    if (!enabled) return

    try {
      const response = await fetch('/api/pending')
      if (response.ok) {
        const data: PendingData = await response.json()
        setGuesses(data.guesses || [])
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching pending webhooks:', error)
    }
  }, [enabled])

  const markProcessed = useCallback(async (id: string) => {
    try {
      await fetch('/api/mark-processed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: id })
      })
    } catch (error) {
      console.error('Error marking as processed:', error)
    }
  }, [])

  // Polling every 1 second
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
