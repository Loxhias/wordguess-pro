/**
 * TIPOS Y INTERFACES CENTRALIZADAS
 * 
 * Este archivo contiene SOLO definiciones de tipos.
 * NO debe importar nada de context/, lib/, hooks/ o components/
 * Es un archivo "hoja" para evitar dependencias circulares.
 */

// ============================================
// PLAYER TYPES
// ============================================

export interface Player {
  name: string
  points: number
  lastUpdated: number
}

export interface Winner {
  playerName: string
  timestamp: number
  points: number
}

// ============================================
// GAME STATE TYPES
// ============================================

export interface GameState {
  currentWord: string
  currentHint: string
  revealedIndices: number[]
  isActive: boolean
  startTime: number
  duration: number
  timeLeft: number
  isRunning: boolean
  isFinished: boolean
  doublePointsActive: boolean
  doublePointsUntil: number
  winners: Winner[]
  winner: string | null
  winnerPoints: number
}

export interface GameConfig {
  roundDuration: number
  revealInterval: number
  doublePointsDuration: number
}

// ============================================
// WORD TYPES
// ============================================

export interface WordEntry {
  word: string
  hint: string
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
}

// ============================================
// WEBHOOK TYPES
// ============================================

export type MagicWebhookEvent =
  | 'GAME_WIN'
  | 'ROUND_END'
  | 'LETTER_REVEALED'
  | 'ROUND_START'
  | 'DOUBLE_POINTS'
  | 'TIMER_WARNING'

export interface WebhookPayload {
  event: MagicWebhookEvent
  timestamp: number
  data: Record<string, any>
}
