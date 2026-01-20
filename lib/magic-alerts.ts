/**
 * Magic Alerts Integration
 * 
 * Este módulo permite enviar eventos desde el juego hacia Magic By Loxhias
 * para mostrar alertas personalizadas en stream.
 * 
 * Configura la variable de entorno NEXT_PUBLIC_MAGIC_ALERTS_WEBHOOK_URL
 * para habilitar esta funcionalidad.
 */

export type MagicAlertEvent = 
  | 'winner'           // Alguien ganó la ronda
  | 'round_start'      // Nueva ronda iniciada
  | 'round_end'        // Ronda finalizada (timeout)
  | 'letter_revealed'  // Letra revelada
  | 'double_points'    // Puntos dobles activados
  | 'timer_warning'    // Quedan 10 segundos
  | 'top_changed'      // El top 3 cambió

interface MagicAlertPayload {
  event: MagicAlertEvent
  timestamp: number
  data: Record<string, any>
}

/**
 * Envía un evento a Magic By Loxhias para mostrar alertas
 */
export async function sendToMagicAlerts(
  eventType: MagicAlertEvent,
  data: Record<string, any> = {}
): Promise<boolean> {
  const magicAlertsUrl = process.env.NEXT_PUBLIC_MAGIC_ALERTS_WEBHOOK_URL

  // Si no está configurado, solo log (no error)
  if (!magicAlertsUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Magic Alerts] Event (not sent, URL not configured):', eventType, data)
    }
    return false
  }

  const payload: MagicAlertPayload = {
    event: eventType,
    timestamp: Date.now(),
    data,
  }

  try {
    const response = await fetch(magicAlertsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    console.log('[Magic Alerts] Event sent successfully:', eventType)
    return true
  } catch (error) {
    console.error('[Magic Alerts] Failed to send event:', error)
    return false
  }
}

/**
 * Helpers para eventos específicos
 */

export const MagicAlerts = {
  /**
   * Alerta cuando alguien gana
   */
  winner: (playerName: string, points: number, word: string) => {
    return sendToMagicAlerts('winner', {
      playerName,
      points,
      word,
    })
  },

  /**
   * Alerta de nueva ronda
   */
  roundStart: (word: string, hint: string, duration: number) => {
    return sendToMagicAlerts('round_start', {
      word,
      hint,
      duration,
    })
  },

  /**
   * Alerta de finalización de ronda
   */
  roundEnd: (hasWinner: boolean, word: string) => {
    return sendToMagicAlerts('round_end', {
      hasWinner,
      word,
    })
  },

  /**
   * Alerta de letra revelada
   */
  letterRevealed: (letter: string, position: number, totalRevealed: number, wordLength: number) => {
    return sendToMagicAlerts('letter_revealed', {
      letter,
      position,
      totalRevealed,
      wordLength,
      progress: Math.round((totalRevealed / wordLength) * 100),
    })
  },

  /**
   * Alerta de puntos dobles activados
   */
  doublePoints: (activatedBy: string, duration: number) => {
    return sendToMagicAlerts('double_points', {
      activatedBy,
      duration,
    })
  },

  /**
   * Alerta de tiempo casi agotado
   */
  timerWarning: (timeLeft: number) => {
    return sendToMagicAlerts('timer_warning', {
      timeLeft,
    })
  },

  /**
   * Alerta cuando cambia el top 3
   */
  topChanged: (newTop: Array<{ name: string; points: number }>) => {
    return sendToMagicAlerts('top_changed', {
      top3: newTop.slice(0, 3),
    })
  },
}

/**
 * Ejemplo de uso en el código del juego:
 * 
 * import { MagicAlerts } from '@/lib/magic-alerts'
 * 
 * // Cuando alguien gana:
 * MagicAlerts.winner('PlayerName', 10, 'JAVASCRIPT')
 * 
 * // Cuando se revela una letra:
 * MagicAlerts.letterRevealed('J', 0, 1, 10)
 * 
 * // Cuando quedan 10 segundos:
 * if (timeLeft === 10) {
 *   MagicAlerts.timerWarning(10)
 * }
 */
