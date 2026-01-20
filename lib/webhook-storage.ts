// In-memory storage for webhooks (development)
// In production, use Cloudflare KV or Redis

export interface StoredGuess {
  id: string
  user: string
  word: string
  timestamp: number
  processed: boolean
}

export interface StoredEvent {
  id: string
  user: string
  event: string
  duration?: number
  timestamp: number
  processed: boolean
}

class WebhookStorage {
  private guesses: StoredGuess[] = []
  private events: StoredEvent[] = []

  addGuess(guess: StoredGuess) {
    this.guesses.push(guess)
    
    // Auto cleanup after 60 seconds
    setTimeout(() => {
      this.guesses = this.guesses.filter(g => g.id !== guess.id)
    }, 60000)
  }

  addEvent(event: StoredEvent) {
    this.events.push(event)
    
    // Auto cleanup after 60 seconds
    setTimeout(() => {
      this.events = this.events.filter(e => e.id !== event.id)
    }, 60000)
  }

  getPendingGuesses(): StoredGuess[] {
    return this.guesses.filter(g => !g.processed)
  }

  getPendingEvents(): StoredEvent[] {
    return this.events.filter(e => !e.processed)
  }

  markProcessed(id: string) {
    const guess = this.guesses.find(g => g.id === id)
    if (guess) guess.processed = true
    
    const event = this.events.find(e => e.id === id)
    if (event) event.processed = true
  }

  clear() {
    this.guesses = []
    this.events = []
  }
}

// Singleton instance
let storage: WebhookStorage | null = null

export function getWebhookStorage(): WebhookStorage {
  if (!storage) {
    storage = new WebhookStorage()
  }
  return storage
}
