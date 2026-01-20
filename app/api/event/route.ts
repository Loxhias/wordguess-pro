import { NextRequest, NextResponse } from 'next/server'
import { getWebhookStorage } from '@/lib/webhook-storage'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const user = searchParams.get('user')
  const event = searchParams.get('event')
  const duration = searchParams.get('duration')
  
  if (!user || !event) {
    return NextResponse.json({ 
      error: 'Missing parameters',
      required: ['user', 'event']
    }, { status: 400 })
  }

  const validEvents = ['reveal_letter', 'double_points', 'nueva_ronda']
  if (!validEvents.includes(event)) {
    return NextResponse.json({ 
      error: 'Invalid event',
      valid: validEvents
    }, { status: 400 })
  }

  const storage = getWebhookStorage()

  const eventData = {
    id: `event-${Date.now()}-${Math.random()}`,
    user: user.trim(),
    event: event,
    duration: duration ? parseInt(duration) : undefined,
    timestamp: Date.now(),
    processed: false
  }

  storage.addEvent(eventData)

  return NextResponse.json({ 
    success: true,
    message: 'Event received',
    data: eventData
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
