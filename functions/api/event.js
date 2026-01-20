// Cloudflare Pages Function - Recibir Webhook
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
  const event = url.searchParams.get('event');
  const duration = url.searchParams.get('duration');
  
  // Validar parámetros
  if (!user || !event) {
    return new Response(JSON.stringify({ 
      error: 'Missing parameters',
      required: ['user', 'event'],
      example: '/api/event?user=TestUser&event=reveal_letter'
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Validar eventos permitidos
  const validEvents = ['reveal_letter', 'double_points', 'nueva_ronda'];
  if (!validEvents.includes(event)) {
    return new Response(JSON.stringify({ 
      error: 'Invalid event',
      valid: validEvents,
      received: event
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Crear objeto del evento
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const eventData = {
    id: `event-${timestamp}-${randomId}`,
    user: user.trim(),
    event: event,
    duration: duration ? parseInt(duration) : undefined,
    timestamp: timestamp,
    processed: false
  };

  // Guardar en KV con TTL de 60 segundos
  try {
    if (env.GAME_KV) {
      await env.GAME_KV.put(
        eventData.id, 
        JSON.stringify(eventData), 
        { expirationTtl: 60 }
      );
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Event received and stored',
        data: eventData
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
