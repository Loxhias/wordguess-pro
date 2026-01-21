# 🏠 Webhooks en Local (Sin Cloudflare)

## 🎯 **El Problema**

Actualmente los webhooks requieren:
- ❌ Estar desplegado en Cloudflare
- ❌ Tener KV configurado
- ❌ No funcionan en `localhost`

**Esto hace que sea difícil desarrollar y probar localmente.**

---

## ✅ **Solución: Servidor Local Mock**

Crear un servidor Node.js simple que simule las Cloudflare Functions.

### **Arquitectura Local**

```
┌─────────────────────────────────────┐
│     LOCALHOST (Todo en tu PC)       │
├─────────────────────────────────────┤
│                                     │
│  Frontend (Next.js)                 │
│  http://localhost:7777              │
│           ↕                         │
│  Servidor Mock (Express)            │
│  http://localhost:3000/api/...     │
│           ↕                         │
│  Memoria RAM (en lugar de KV)       │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔧 **Implementación**

### **PASO 1: Instalar Dependencias**

```bash
npm install --save-dev express cors
```

---

### **PASO 2: Crear Servidor Mock**

#### `dev-server/webhook-server.js`
```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Storage en memoria (simula KV)
const storage = {
  events: {},
  guesses: {}
};

// Limpiar eventos viejos (TTL simulado)
setInterval(() => {
  const now = Date.now();
  Object.keys(storage.events).forEach(key => {
    if (now - storage.events[key].timestamp > 60000) {
      delete storage.events[key];
    }
  });
  Object.keys(storage.guesses).forEach(key => {
    if (now - storage.guesses[key].timestamp > 60000) {
      delete storage.guesses[key];
    }
  });
}, 5000);

// GET/POST /api/event
app.get('/api/event', (req, res) => handleEvent(req, res));
app.post('/api/event', (req, res) => handleEvent(req, res));

function handleEvent(req, res) {
  const { session = 'default', user, event, duration } = req.query;
  
  if (!user || !event) {
    return res.status(400).json({
      error: 'Missing parameters',
      required: ['user', 'event']
    });
  }

  const validEvents = ['reveal_letter', 'double_points', 'nueva_ronda'];
  if (!validEvents.includes(event)) {
    return res.status(400).json({
      error: 'Invalid event',
      valid: validEvents
    });
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const eventId = `session-${session}-event-${timestamp}-${randomId}`;
  
  const eventData = {
    id: eventId,
    session,
    user: user.trim(),
    event,
    duration: duration ? parseInt(duration) : undefined,
    timestamp,
    processed: false
  };

  storage.events[eventId] = eventData;
  
  console.log('📥 [LOCAL] Webhook recibido:', eventData);
  
  res.json({
    success: true,
    message: 'Event received (local)',
    data: eventData
  });
}

// GET/POST /api/guess
app.get('/api/guess', (req, res) => handleGuess(req, res));
app.post('/api/guess', (req, res) => handleGuess(req, res));

function handleGuess(req, res) {
  const { session = 'default', user, word } = req.query;
  
  if (!user || !word) {
    return res.status(400).json({
      error: 'Missing parameters',
      required: ['user', 'word']
    });
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const guessId = `session-${session}-guess-${timestamp}-${randomId}`;
  
  const guessData = {
    id: guessId,
    session,
    user: user.trim(),
    word: word.toUpperCase().trim(),
    timestamp,
    processed: false
  };

  storage.guesses[guessId] = guessData;
  
  console.log('📥 [LOCAL] Intento recibido:', guessData);
  
  res.json({
    success: true,
    message: 'Guess received (local)',
    data: guessData
  });
}

// GET /api/pending
app.get('/api/pending', (req, res) => {
  const { session = 'default' } = req.query;
  
  const result = {
    guesses: Object.values(storage.guesses)
      .filter(g => g.session === session && !g.processed),
    events: Object.values(storage.events)
      .filter(e => e.session === session && !e.processed)
  };
  
  if (result.guesses.length > 0 || result.events.length > 0) {
    console.log('📤 [LOCAL] Enviando pendientes:', {
      guesses: result.guesses.length,
      events: result.events.length
    });
  }
  
  res.json(result);
});

// POST /api/mark-processed
app.post('/api/mark-processed', (req, res) => {
  const { key } = req.body;
  
  if (!key) {
    return res.status(400).json({
      error: 'Missing key parameter'
    });
  }

  if (storage.events[key]) {
    delete storage.events[key];
    console.log('✅ [LOCAL] Evento procesado:', key);
  } else if (storage.guesses[key]) {
    delete storage.guesses[key];
    console.log('✅ [LOCAL] Intento procesado:', key);
  }
  
  res.json({ success: true });
});

// Endpoint de debug
app.get('/api/debug', (req, res) => {
  res.json({
    events: Object.keys(storage.events).length,
    guesses: Object.keys(storage.guesses).length,
    storage
  });
});

const PORT = process.env.WEBHOOK_PORT || 3016;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  🏠 Servidor de Webhooks LOCAL            ║
╠═══════════════════════════════════════════╣
║  Puerto: http://localhost:${PORT}         ║
║  Estado: ACTIVO                           ║
╠═══════════════════════════════════════════╣
║  Endpoints:                               ║
║  • GET  /api/event?user=X&event=Y         ║
║  • GET  /api/guess?user=X&word=Y          ║
║  • GET  /api/pending?session=X            ║
║  • POST /api/mark-processed               ║
║  • GET  /api/debug (ver storage)          ║
╠═══════════════════════════════════════════╣
║  📝 Los eventos se guardan en memoria     ║
║  ⏰ TTL: 60 segundos (auto-limpieza)      ║
╚═══════════════════════════════════════════╝
  `);
});
```

---

### **PASO 3: Agregar Script al package.json**

```json
{
  "scripts": {
    "dev": "cross-env PORT=7777 next dev",
    "dev:webhooks": "node dev-server/webhook-server.js",
    "dev:full": "concurrently \"npm run dev\" \"npm run dev:webhooks\"",
    "build": "next build"
  }
}
```

Si quieres ejecutar ambos a la vez, instala:
```bash
npm install --save-dev concurrently
```

---

### **PASO 4: Modificar use-incoming-webhooks.ts para Detectar Local**

```typescript
"use client"

import { useEffect, useState, useCallback } from 'react'

// ... interfaces ...

export function useIncomingWebhooks(enabled: boolean = true) {
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [events, setEvents] = useState<GameEvent[]>([])
  const [isProduction, setIsProduction] = useState(false)
  const [isLocal, setIsLocal] = useState(false) // ← NUEVO
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    const isProd = hostname !== 'localhost' && hostname !== '127.0.0.1'
    const isLoc = hostname === 'localhost' || hostname === '127.0.0.1'
    
    setIsProduction(isProd)
    setIsLocal(isLoc)
    
    // Generar session ID
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
      console.log('✅ [Polling] Activado en PRODUCCIÓN (Cloudflare)')
    } else if (isLoc) {
      console.log('✅ [Polling] Activado en LOCAL (http://localhost:3000)')
    }
  }, [])

  const fetchPending = useCallback(async () => {
    if (!enabled || !sessionId) return
    if (!isProduction && !isLocal) return // Solo activo en prod o local

    try {
      // Usar puerto 3000 en local, mismo dominio en producción
      const baseUrl = isLocal ? 'http://localhost:3000' : ''
      
      const response = await fetch(`${baseUrl}/api/pending?session=${sessionId}`, {
        method: 'GET',
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data: PendingData = await response.json()
        
        if (data.guesses?.length > 0 || data.events?.length > 0) {
          console.log('📥 [Polling] Webhooks recibidos:', {
            guesses: data.guesses?.length || 0,
            events: data.events?.length || 0,
            mode: isLocal ? 'LOCAL' : 'PRODUCCIÓN',
            data
          })
        }
        
        setGuesses(data.guesses || [])
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching pending webhooks:', error)
    }
  }, [enabled, isProduction, isLocal, sessionId])

  const markProcessed = useCallback(async (id: string) => {
    const baseUrl = isLocal ? 'http://localhost:3000' : ''
    
    try {
      await fetch(`${baseUrl}/api/mark-processed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: id }),
        cache: 'no-store'
      })
    } catch (error) {
      console.error('Error marking as processed:', error)
    }
  }, [isLocal])

  useEffect(() => {
    if (!enabled || !sessionId) return
    if (!isProduction && !isLocal) return

    fetchPending()
    const interval = setInterval(fetchPending, 1000)
    return () => clearInterval(interval)
  }, [enabled, isProduction, isLocal, sessionId, fetchPending])

  return {
    guesses,
    events,
    markProcessed,
    refetch: fetchPending,
    sessionId,
    isLocal // ← EXPORTAR para mostrar en UI
  }
}
```

---

## 🚀 **Cómo Usar**

### **Desarrollo Local (Con Webhooks)**

```bash
# Terminal 1: Servidor de webhooks
npm run dev:webhooks

# Terminal 2: Next.js
npm run dev

# O ambos a la vez:
npm run dev:full
```

Ahora:
- Frontend: `http://localhost:7777`
- Webhooks: `http://localhost:3016/api/...`

---

### **Probar Webhooks en Local**

```bash
# Disparar webhook local
curl "http://localhost:3016/api/event?session=session-123&user=TestUser&event=reveal_letter"

# Ver pendientes
curl "http://localhost:3016/api/pending?session=session-123"

# Debug (ver todo el storage)
curl "http://localhost:3016/api/debug"
```

En el navegador:
```
1. Abre: http://localhost:7777/game
2. F12 → Console
3. Deberías ver: ✅ [Polling] Activado en LOCAL
4. Dispara webhook desde otra pestaña
5. Verás los logs en ambas consoles (servidor + navegador)
```

---

## 🎯 **Ventajas de Desarrollo Local**

✅ **Sin Cloudflare**: No necesitas desplegar para probar  
✅ **Sin KV**: Todo en memoria RAM  
✅ **Más rápido**: No hay latencia de red  
✅ **Logs visibles**: Ves todo en la terminal  
✅ **Debugging fácil**: Puedes usar breakpoints en el servidor  
✅ **Gratis**: No consume límites de Cloudflare  

---

## 🔄 **Flujo Completo**

### **Desarrollo** (Local)
```
1. npm run dev:full
2. Desarrollas y pruebas localmente
3. Webhooks a http://localhost:3016
4. Todo funciona sin internet
```

### **Producción** (Cloudflare)
```
1. npm run build
2. Deploy a Cloudflare
3. Webhooks a https://wordguess-prov2.pages.dev
4. Usa KV real
```

**El código detecta automáticamente el entorno** ✅

---

## 📊 **Comparación**

| Feature | Local (Mock) | Producción (Cloudflare) |
|---------|--------------|-------------------------|
| Setup | ✅ Instalar Express | ⚠️ Configurar KV |
| Velocidad | ⚡ Instantáneo | 🌍 ~50ms latencia |
| Persistencia | ❌ Solo en RAM | ✅ KV (TTL 60s) |
| Costo | 💰 Gratis | 💰 Free tier limits |
| Multi-usuario | ✅ Con session ID | ✅ Con session ID |
| Deploy | ❌ Solo local | ✅ Global CDN |

---

## 🎯 **Recomendación**

**Usa ambos**:
- 🏠 **Local** durante desarrollo (rápido, fácil)
- ☁️ **Cloudflare** en producción (escalable, global)

El código se adapta automáticamente según el entorno.

---

## 🐛 **Troubleshooting Local**

### ❌ "EADDRINUSE: address already in use"
**Causa**: Puerto 3016 ocupado  
**Solución**:
```bash
# Windows
netstat -ano | findstr :3016
taskkill /PID <PID> /F

# O cambiar a otro puerto
WEBHOOK_PORT=3017 npm run dev:webhooks
```

### ❌ "fetch failed" en el navegador
**Causa**: CORS o servidor no corriendo  
**Solución**:
1. Verifica que el servidor esté corriendo (`npm run dev:webhooks`)
2. Verifica que el puerto sea 3000
3. Revisa la consola del servidor para errores

### ❌ "No veo logs de webhooks"
**Causa**: El hook usa producción por defecto  
**Solución**: Verifica en Console que diga "LOCAL" no "PRODUCCIÓN"

---

## ✅ **Checklist de Setup Local**

- [ ] `npm install --save-dev express cors concurrently`
- [ ] Crear `dev-server/webhook-server.js`
- [ ] Actualizar `package.json` con scripts
- [ ] Modificar `hooks/use-incoming-webhooks.ts`
- [ ] Ejecutar `npm run dev:full`
- [ ] Probar webhook: `curl http://localhost:3000/api/event?...`
- [ ] Verificar en Console: "✅ [Polling] Activado en LOCAL"

---

## 🎉 **Resultado**

**Ahora puedes desarrollar completamente offline**:
- ✅ Sin cuenta de Cloudflare
- ✅ Sin configurar KV
- ✅ Sin deploys para probar
- ✅ Todo en tu máquina

**Y cuando estés listo**: Deploy a Cloudflare y todo sigue funcionando 🚀
