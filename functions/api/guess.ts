// Cloudflare Pages Function
interface Env {
  GAME_KV?: KVNamespace
}

export async function onRequestGet(context: { request: Request; env: Env }) {
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
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  const guess = {
    id: `guess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    user: user.trim(),
    word: word.toUpperCase().trim(),
    timestamp: Date.now(),
    processed: false
  }

  // Store in KV if available
  if (env.GAME_KV) {
    await env.GAME_KV.put(guess.id, JSON.stringify(guess), { expirationTtl: 60 })
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

export const onRequestPost = onRequestGet
