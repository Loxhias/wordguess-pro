# 🔐 Solución: Webhooks Multi-Usuario (Session ID)

## ❌ **Problema Actual**

Todos los usuarios comparten el mismo KV, por lo que:
- Si Usuario A dispara webhook → Usuario B, C, D también lo reciben
- No hay aislamiento entre instancias del juego

---

## ✅ **Solución: Session ID**

Cada instancia del juego tiene un ID único de sesión que se usa como "namespace".

### **Flujo Mejorado**

```
Usuario A abre: https://wordguess-prov2.pages.dev/game
    ↓
Se genera: sessionId = "user-a-1768950000"
    ↓
Webhooks incluyen sessionId:
    /api/event?session=user-a-1768950000&user=Juan&event=reveal_letter
    ↓
Se guarda en KV: "session-user-a-1768950000-event-123"
    ↓
Polling consulta solo su session:
    /api/pending?session=user-a-1768950000
    ↓
Usuario A recibe SOLO sus webhooks
```

---

## 🔧 **Implementación**

### **PASO 1: Modificar Functions para Soportar Session**

#### `functions/api/event.js` (Actualizado)
```javascript
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const session = url.searchParams.get('session') || 'default'; // ← NUEVO
  const user = url.searchParams.get('user');
  const event = url.searchParams.get('event');
  
  if (!user || !event) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const validEvents = ['reveal_letter', 'double_points', 'nueva_ronda'];
  if (!validEvents.includes(event)) {
    return new Response(JSON.stringify({ error: 'Invalid event' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  
  // Key con session ← NUEVO
  const eventId = `session-${session}-event-${timestamp}-${randomId}`;
  
  const eventData = {
    id: eventId,
    session: session, // ← NUEVO
    user: user.trim(),
    event: event,
    timestamp: timestamp,
    processed: false
  };

  try {
    if (env.GAME_KV) {
      await env.GAME_KV.put(eventId, JSON.stringify(eventData), { expirationTtl: 60 });
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Event received',
        data: eventData
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'KV not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export const onRequestPost = onRequestGet;
```

#### `functions/api/pending.js` (Actualizado)
```javascript
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const session = url.searchParams.get('session') || 'default'; // ← NUEVO

  const result = {
    guesses: [],
    events: []
  };

  if (!env.GAME_KV) {
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Listar solo eventos de esta sesión ← NUEVO
    const eventList = await env.GAME_KV.list({ prefix: `session-${session}-event-` });
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

    // Similar para guesses
    const guessList = await env.GAME_KV.list({ prefix: `session-${session}-guess-` });
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

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, guesses: [], events: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
```

---

### **PASO 2: Generar Session ID en el Frontend**

#### `hooks/use-incoming-webhooks.ts` (Actualizado)
```typescript
"use client"

import { useEffect, useState, useCallback } from 'react'

// ... interfaces existentes ...

export function useIncomingWebhooks(enabled: boolean = true) {
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [events, setEvents] = useState<GameEvent[]>([])
  const [isProduction, setIsProduction] = useState(false)
  const [sessionId, setSessionId] = useState<string>('') // ← NUEVO

  useEffect(() => {
    const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    setIsProduction(isProd)
    
    // Generar o recuperar session ID ← NUEVO
    if (typeof window !== 'undefined') {
      let session = sessionStorage.getItem('game_session_id')
      if (!session) {
        session = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('game_session_id', session)
      }
      setSessionId(session)
      console.log('🎮 [Session] ID:', session)
    }
    
    if (isProd) {
      console.log('✅ [Polling] Activado en producción')
    } else {
      console.log('⏸️ [Polling] Desactivado en localhost')
    }
  }, [])

  const fetchPending = useCallback(async () => {
    if (!enabled || !isProduction || !sessionId) return // ← Esperar sessionId

    try {
      const response = await fetch(`/api/pending?session=${sessionId}`, { // ← Incluir session
        method: 'GET',
        cache: 'no-store'
      })
      if (response.ok) {
        const data: PendingData = await response.json()
        
        if (data.guesses?.length > 0 || data.events?.length > 0) {
          console.log('📥 [Polling] Webhooks recibidos:', {
            guesses: data.guesses?.length || 0,
            events: data.events?.length || 0,
            data
          })
        }
        
        setGuesses(data.guesses || [])
        setEvents(data.events || [])
      }
    } catch (error) {
      if (isProduction) {
        console.error('Error fetching pending webhooks:', error)
      }
    }
  }, [enabled, isProduction, sessionId]) // ← Agregar sessionId a dependencies

  const markProcessed = useCallback(async (id: string) => {
    if (!isProduction) return

    try {
      await fetch('/api/mark-processed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: id }),
        cache: 'no-store'
      })
    } catch (error) {
      if (isProduction) {
        console.error('Error marking as processed:', error)
      }
    }
  }, [isProduction])

  useEffect(() => {
    if (!enabled || !isProduction || !sessionId) return // ← Esperar sessionId

    fetchPending()
    const interval = setInterval(fetchPending, 1000)
    return () => clearInterval(interval)
  }, [enabled, isProduction, sessionId, fetchPending]) // ← Agregar sessionId

  return {
    guesses,
    events,
    markProcessed,
    refetch: fetchPending,
    sessionId // ← EXPORTAR para mostrar en UI
  }
}
```

---

### **PASO 3: Mostrar Session ID en el Debug Panel**

#### `app/game/page.tsx` (Actualizado)
```typescript
function GameContent() {
  // ... código existente ...
  
  const { guesses, events, sessionId } = useIncomingWebhooks(true) // ← Obtener sessionId
  
  // ... en el debug panel ...
  
  return (
    <div>
      {/* Debug Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {debugOpen && (
          <Card>
            <CardContent>
              {/* Session ID */}
              <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                <div className="text-xs text-slate-400 mb-1">🎮 Session ID</div>
                <code className="text-xs text-purple-300">{sessionId}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(sessionId, 'session')}
                  className="ml-2"
                >
                  📋
                </Button>
              </div>
              
              {/* URLs con Session */}
              {isProduction && sessionId && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">URLs de Webhooks (Con tu Session):</p>
                  {[
                    {
                      name: 'Nueva Ronda',
                      url: `${baseUrl}/api/event?session=${sessionId}&user={username}&event=nueva_ronda`
                    },
                    {
                      name: 'Revelar Letra',
                      url: `${baseUrl}/api/event?session=${sessionId}&user={username}&event=reveal_letter`
                    }
                  ].map((webhook) => (
                    <div key={webhook.name} className="bg-slate-800/50 rounded p-2">
                      <span className="text-xs text-slate-400">{webhook.name}:</span>
                      <code className="text-xs text-purple-300 block mt-1">{webhook.url}</code>
                      <Button size="sm" onClick={() => copyToClipboard(webhook.url, webhook.name)}>
                        📋 Copiar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

---

## 🎯 **Resultado**

### **Antes** (Todos comparten):
```
Usuario A: https://wordguess-prov2.pages.dev/game
Webhook: /api/event?user=Juan&event=reveal_letter
    ↓
Usuario B, C, D también lo reciben ❌
```

### **Después** (Aislado por sesión):
```
Usuario A: https://wordguess-prov2.pages.dev/game
Session: session-1768950000-abc
Webhook: /api/event?session=session-1768950000-abc&user=Juan&event=reveal_letter
    ↓
SOLO Usuario A lo recibe ✅
```

---

## 📋 **Ventajas de Session ID**

✅ **Aislamiento**: Cada instancia del juego es independiente  
✅ **Multi-usuario**: Múltiples personas pueden usar el juego simultáneamente  
✅ **Streamer-friendly**: Cada streamer tiene su propio "buzón"  
✅ **Simple**: Solo agregar parámetro `session` en URLs  
✅ **Compatible**: Funciona con la arquitectura actual (solo modificaciones menores)

---

## 🔄 **Casos de Uso**

### **Caso 1: Streamer Solo**
```
Streamer abre el juego → Session: stream-abc123
Sus viewers envían webhooks con session=stream-abc123
Solo su juego responde
```

### **Caso 2: Múltiples Streamers**
```
Streamer A: session=streamer-a-123
Streamer B: session=streamer-b-456
Streamer C: session=streamer-c-789

Cada uno recibe SOLO sus webhooks
```

### **Caso 3: Testing**
```
Tab 1: session=test-1
Tab 2: session=test-2

Cada tab es independiente para testing
```

---

## ⚠️ **Limitación: TTL 60 Segundos**

Con Session ID, cada sesión tiene sus propios eventos en KV.

**Consideración**:
- Si tienes 100 sesiones activas
- Y cada una tiene 5 eventos
- = 500 keys en KV
- Pero se auto-eliminan después de 60s

**Límites de Cloudflare KV (Free tier)**:
- ✅ Unlimited keys
- ✅ 100,000 read operations/day
- ✅ 1,000 write operations/day

Con 10 usuarios activos:
- Write: ~10 webhooks/min = 600/hora = 14,400/día ❌ (excede límite)
- Read: 10 users × 60 polling/min = 36,000/hora ✅ (dentro del límite)

**Solución**: Limitar writes o usar plan pago.

---

## 🎯 **Recomendación**

**Para tu caso (Magic By Loxhias)**:
- Implementa Session ID
- Cada usuario que compra el juego tiene su propia instancia
- Su session ID se genera al abrir
- Los webhooks incluyen su session ID
- Aislamiento garantizado

**Implementación**: Sigue los 3 pasos de arriba 👆
