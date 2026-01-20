// Cloudflare Pages Function - Recibir Intento de Adivinanza
export async function onRequestGet(context) {
  return handleRequest(context);
}

export async function onRequestPost(context) {
  return handleRequest(context);
}

async function handleRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const user = url.searchParams.get('user');
  const word = url.searchParams.get('word');
  
  // Validar parámetros
  if (!user || !word) {
    return new Response(JSON.stringify({ 
      error: 'Missing parameters',
      required: ['user', 'word'],
      example: '/api/guess?user=TestUser&word=PERRO'
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Crear objeto del intento
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const guess = {
    id: `guess-${timestamp}-${randomId}`,
    user: user.trim(),
    word: word.toUpperCase().trim(),
    timestamp: timestamp,
    processed: false
  };

  // Guardar en KV con TTL de 60 segundos
  try {
    if (env.GAME_KV) {
      await env.GAME_KV.put(
        guess.id, 
        JSON.stringify(guess), 
        { expirationTtl: 60 }
      );
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Guess received and stored',
        data: guess
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      return new Response(JSON.stringify({ 
        error: 'KV not configured',
        message: 'GAME_KV namespace is not bound to this function'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Storage error',
      message: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
