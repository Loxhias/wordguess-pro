import { NextResponse } from 'next/server'
import { getWebhookStorage } from '@/lib/webhook-storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const storage = getWebhookStorage()
    
    const result = {
      guesses: storage.getPendingGuesses(),
      events: storage.getPendingEvents()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching pending:', error)
    return NextResponse.json({ guesses: [], events: [] })
  }
}
