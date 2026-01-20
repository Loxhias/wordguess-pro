import { NextRequest, NextResponse } from 'next/server'
import { getWebhookStorage } from '@/lib/webhook-storage'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const user = searchParams.get('user')
  const word = searchParams.get('word')
  
  if (!user || !word) {
    return NextResponse.json({ 
      error: 'Missing parameters',
      required: ['user', 'word']
    }, { status: 400 })
  }

  const storage = getWebhookStorage()
  
  const guess = {
    id: `guess-${Date.now()}-${Math.random()}`,
    user: user.trim(),
    word: word.toUpperCase().trim(),
    timestamp: Date.now(),
    processed: false
  }

  storage.addGuess(guess)

  return NextResponse.json({ 
    success: true,
    message: 'Guess received',
    data: guess
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
