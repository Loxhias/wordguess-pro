// Cloudflare Pages Function - Marcar Webhook como Procesado
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Leer el body del POST
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return new Response(JSON.stringify({ 
        error: 'Missing key parameter',
        example: '{ "key": "event-123456789-abc" }'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Eliminar del KV
    if (env.GAME_KV) {
      await env.GAME_KV.delete(key);
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Event marked as processed and deleted',
        key: key
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
      error: 'Processing error',
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
