// Cloudflare Pages Function - Leer Webhooks Pendientes
export async function onRequestGet(context) {
  const { env } = context;

  const result = {
    guesses: [],
    events: []
  };

  // Si KV no está disponible, retornar vacío
  if (!env.GAME_KV) {
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  }

  try {
    // Listar todas las claves con prefix 'guess-'
    const guessList = await env.GAME_KV.list({ prefix: 'guess-' });
    for (const key of guessList.keys) {
      const data = await env.GAME_KV.get(key.name);
      if (data) {
        try {
          const guess = JSON.parse(data);
          if (!guess.processed) {
            result.guesses.push(guess);
          }
        } catch (e) {
          console.error('Error parsing guess:', e);
        }
      }
    }

    // Listar todas las claves con prefix 'event-'
    const eventList = await env.GAME_KV.list({ prefix: 'event-' });
    for (const key of eventList.keys) {
      const data = await env.GAME_KV.get(key.name);
      if (data) {
        try {
          const event = JSON.parse(data);
          if (!event.processed) {
            result.events.push(event);
          }
        } catch (e) {
          console.error('Error parsing event:', e);
        }
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error fetching from KV:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Fetch error',
      message: error.message,
      guesses: [],
      events: []
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
