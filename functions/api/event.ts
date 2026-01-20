// Cloudflare Pages Function - Receive event webhooks
export async function onRequestGet(context: any) {
  const { request, env } = context
  const url = new URL(request.url)
  
  const user = url.searchParams.get('user')
  const event = url.searchParams.get('event')
  const duration = url.searchParams.get('duration')
  
  if (!user || !event) {
    return new Response(JSON.stringify({ 
      error: 'Missing parameters',
      required: ['user', 'event']
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const validEvents = ['reveal_letter', 'double_points', 'nueva_ronda']
  if (!validEvents.includes(event)) {
    return new Response(JSON.stringify({ 
      error: 'Invalid event',
      valid: validEvents
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Store event in KV
  const eventData = {
    user: user.trim(),
    event: event,
    duration: duration ? parseInt(duration) : undefined,
    timestamp: Date.now(),
    processed: false
  }

  const key = `event:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
  
  // Store in KV with 60 second TTL (if KV is available)
  if (env.GAME_KV) {
    await env.GAME_KV.put(key, JSON.stringify(eventData), { expirationTtl: 60 })
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Event received',
    data: eventData
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

// Also support POST method
export async function onRequestPost(context: any) {
  return onRequestGet(context)
}
