// Cloudflare Pages Function
interface Env {
  GAME_KV?: KVNamespace
}

export async function onRequestGet(context: { request: Request; env: Env }) {
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
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  const validEvents = ['reveal_letter', 'double_points', 'nueva_ronda']
  if (!validEvents.includes(event)) {
    return new Response(JSON.stringify({ 
      error: 'Invalid event',
      valid: validEvents
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  const eventData = {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    user: user.trim(),
    event: event,
    duration: duration ? parseInt(duration) : undefined,
    timestamp: Date.now(),
    processed: false
  }

  // Store in KV if available
  if (env.GAME_KV) {
    await env.GAME_KV.put(eventData.id, JSON.stringify(eventData), { expirationTtl: 60 })
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

export const onRequestPost = onRequestGet
