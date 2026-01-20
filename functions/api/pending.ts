// Cloudflare Pages Function
interface Env {
  GAME_KV?: KVNamespace
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context

  const result = {
    guesses: [] as any[],
    events: [] as any[]
  }

  // If KV is not available, return empty (for local dev without KV)
  if (!env.GAME_KV) {
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  try {
    // List all keys with prefix 'guess-'
    const guessList = await env.GAME_KV.list({ prefix: 'guess-' })
    for (const key of guessList.keys) {
      const data = await env.GAME_KV.get(key.name)
      if (data) {
        try {
          const guess = JSON.parse(data)
          if (!guess.processed) {
            result.guesses.push(guess)
          }
        } catch (e) {
          console.error('Error parsing guess:', e)
        }
      }
    }

    // List all keys with prefix 'event-'
    const eventList = await env.GAME_KV.list({ prefix: 'event-' })
    for (const key of eventList.keys) {
      const data = await env.GAME_KV.get(key.name)
      if (data) {
        try {
          const event = JSON.parse(data)
          if (!event.processed) {
            result.events.push(event)
          }
        } catch (e) {
          console.error('Error parsing event:', e)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching from KV:', error)
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
