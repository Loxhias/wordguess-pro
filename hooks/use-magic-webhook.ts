"use client"

import { useEffect, useState, useCallback } from 'react'
import type { MagicWebhookEvent, WebhookPayload } from '@/types/game'

/**
 * Hook para integración con Magic By Loxhias via Webhooks
 * 
 * Lee el parámetro ?webhook= de la URL y envía eventos al endpoint especificado.
 * 
 * @example
 * // En el componente:
 * const { sendWebhook, webhookUrl, isEnabled } = useMagicWebhook()
 * 
 * // Enviar evento:
 * sendWebhook('GAME_WIN', { playerName: 'loxhias', points: 10, word: 'JAVASCRIPT' })
 */
export function useMagicWebhook() {
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)

  // Leer webhook URL de la query string al montar
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const webhook = params.get('webhook')

    if (webhook) {
      // Decodificar la URL si está encoded
      const decodedWebhook = decodeURIComponent(webhook)
      setWebhookUrl(decodedWebhook)
      setIsEnabled(true)
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('magic_webhook_url', decodedWebhook)
      
      console.log('[Magic Webhook] Enabled:', decodedWebhook)
    } else {
      // Intentar cargar de localStorage
      const savedWebhook = localStorage.getItem('magic_webhook_url')
      if (savedWebhook) {
        setWebhookUrl(savedWebhook)
        setIsEnabled(true)
        console.log('[Magic Webhook] Loaded from storage:', savedWebhook)
      }
    }
  }, [])

  /**
   * Envía un evento al webhook de Magic By Loxhias
   */
  const sendWebhook = useCallback(async (
    event: MagicWebhookEvent,
    data: Record<string, any> = {}
  ): Promise<boolean> => {
    if (!isEnabled || !webhookUrl) {
      console.log('[Magic Webhook] Disabled or no URL configured')
      return false
    }

    const payload: WebhookPayload = {
      event,
      timestamp: Date.now(),
      data,
    }

    try {
      console.log('[Magic Webhook] Sending:', event, data)
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('[Magic Webhook] Success:', event)
      return true
    } catch (error) {
      console.error('[Magic Webhook] Error:', error)
      return false
    }
  }, [webhookUrl, isEnabled])

  /**
   * Desactiva el webhook
   */
  const disableWebhook = useCallback(() => {
    setIsEnabled(false)
    setWebhookUrl(null)
    localStorage.removeItem('magic_webhook_url')
    console.log('[Magic Webhook] Disabled')
  }, [])

  /**
   * Activa el webhook manualmente con una URL
   */
  const enableWebhook = useCallback((url: string) => {
    setWebhookUrl(url)
    setIsEnabled(true)
    localStorage.setItem('magic_webhook_url', url)
    console.log('[Magic Webhook] Enabled manually:', url)
  }, [])

  return {
    sendWebhook,
    webhookUrl,
    isEnabled,
    disableWebhook,
    enableWebhook,
  }
}

/**
 * Helpers para eventos específicos
 * Facilita el envío de eventos con la estructura correcta
 */
export const MagicWebhookHelpers = {
  /**
   * Evento: Jugador ganó la ronda
   */
  gameWin: (sendWebhook: ReturnType<typeof useMagicWebhook>['sendWebhook']) => 
    (playerName: string, points: number, word: string) => {
      return sendWebhook('GAME_WIN', {
        playerName,
        points,
        word,
        timestamp: Date.now(),
      })
    },

  /**
   * Evento: Ronda finalizada sin ganador (timeout)
   */
  roundEnd: (sendWebhook: ReturnType<typeof useMagicWebhook>['sendWebhook']) => 
    (word: string, timeElapsed: number) => {
      return sendWebhook('ROUND_END', {
        word,
        timeElapsed,
        reason: 'timeout',
      })
    },

  /**
   * Evento: Letra revelada
   */
  letterRevealed: (sendWebhook: ReturnType<typeof useMagicWebhook>['sendWebhook']) => 
    (letter: string, position: number, totalRevealed: number, wordLength: number) => {
      return sendWebhook('LETTER_REVEALED', {
        letter,
        position,
        totalRevealed,
        wordLength,
        progress: Math.round((totalRevealed / wordLength) * 100),
      })
    },

  /**
   * Evento: Nueva ronda iniciada
   */
  roundStart: (sendWebhook: ReturnType<typeof useMagicWebhook>['sendWebhook']) => 
    (word: string, hint: string, duration: number) => {
      return sendWebhook('ROUND_START', {
        word,
        hint,
        duration,
      })
    },

  /**
   * Evento: Puntos dobles activados
   */
  doublePoints: (sendWebhook: ReturnType<typeof useMagicWebhook>['sendWebhook']) => 
    (duration: number) => {
      return sendWebhook('DOUBLE_POINTS', {
        duration,
        activatedAt: Date.now(),
      })
    },

  /**
   * Evento: Advertencia de tiempo (quedan 10 segundos)
   */
  timerWarning: (sendWebhook: ReturnType<typeof useMagicWebhook>['sendWebhook']) => 
    (timeLeft: number) => {
      return sendWebhook('TIMER_WARNING', {
        timeLeft,
      })
    },
}
