// Cloudflare Pages Function - Get pending guesses and events
export async function onRequestGet(context: any) {
  const { env } = context

  const result = {
    guesses: [],
    events: []
  }

  // If KV is not available, return empty arrays (for local dev)
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
    // List all keys with prefix 'guess:'
    const guessList = await env.GAME_KV.list({ prefix: 'guess:' })
    for (const key of guessList.keys) {
      const data = await env.GAME_KV.get(key.name)
      if (data) {
        const guess = JSON.parse(data)
        if (!guess.processed) {
          result.guesses.push({ key: key.name, ...guess })
        }
      }
    }

    // List all keys with prefix 'event:'
    const eventList = await env.GAME_KV.list({ prefix: 'event:' })
    for (const key of eventList.keys) {
      const data = await env.GAME_KV.get(key.name)
      if (data) {
        const event = JSON.parse(data)
        if (!event.processed) {
          result.events.push({ key: key.name, ...event })
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
