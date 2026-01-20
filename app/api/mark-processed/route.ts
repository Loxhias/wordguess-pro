import { NextRequest, NextResponse } from 'next/server'
import { getWebhookStorage } from '@/lib/webhook-storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key } = body

    if (key) {
      const storage = getWebhookStorage()
      storage.markProcessed(key)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process' 
    }, { status: 500 })
  }
}
