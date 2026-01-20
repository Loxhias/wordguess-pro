// Cloudflare Pages Function - Receive guess webhooks
export async function onRequestGet(context: any) {
  const { request, env } = context
  const url = new URL(request.url)
  
  const user = url.searchParams.get('user')
  const word = url.searchParams.get('word')
  
  if (!user || !word) {
    return new Response(JSON.stringify({ 
      error: 'Missing parameters',
      required: ['user', 'word']
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Store guess in KV with timestamp
  const guess = {
    user: user.trim(),
    word: word.toUpperCase().trim(),
    timestamp: Date.now(),
    processed: false
  }

  const key = `guess:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
  
  // Store in KV with 60 second TTL (if KV is available)
  if (env.GAME_KV) {
    await env.GAME_KV.put(key, JSON.stringify(guess), { expirationTtl: 60 })
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Guess received',
    data: guess
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
