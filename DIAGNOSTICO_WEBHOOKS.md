# 🔍 DIAGNÓSTICO: Webhooks No Llegan

## 📂 Archivos Involucrados (En Orden de Flujo)

### 1️⃣ **CLOUDFLARE FUNCTIONS** (Backend - Reciben webhooks)

#### `functions/api/event.ts` (Líneas clave: 51-52)
```typescript
// Guarda el evento en KV
if (env.GAME_KV) {
  await env.GAME_KV.put(eventData.id, JSON.stringify(eventData), { expirationTtl: 60 })
}
```
**Función**: Recibe el webhook y lo guarda en Cloudflare KV  
**Problema potencial**: `env.GAME_KV` podría ser `undefined` si no está vinculado

---

#### `functions/api/guess.ts` (Líneas clave: 35-36)
```typescript
// Guarda el guess en KV
if (env.GAME_KV) {
  await env.GAME_KV.put(guess.id, JSON.stringify(guess), { expirationTtl: 60 })
}
```
**Función**: Igual que event.ts pero para intentos de adivinanza  
**Problema potencial**: Mismo que arriba

---

#### `functions/api/pending.ts` (Líneas clave: 14-22, 26-57)
```typescript
// Si no hay KV, retorna vacío
if (!env.GAME_KV) {
  return new Response(JSON.stringify(result), { /* vacío */ })
}

// Lista las keys con prefix
const eventList = await env.GAME_KV.list({ prefix: 'event-' })
```
**Función**: Lee los webhooks pendientes del KV  
**Problema potencial**: Si KV no existe, retorna `{ guesses: [], events: [] }`

---

### 2️⃣ **FRONTEND - POLLING** (Consulta cada 1 segundo)

#### `hooks/use-incoming-webhooks.ts`

**Línea 34**: Detecta si está en producción
```typescript
const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
```
**Problema potencial**: Si el hostname es inesperado, no activa el polling

**Línea 44-73**: Fetch a `/api/pending`
```typescript
const fetchPending = useCallback(async () => {
  if (!enabled || !isProduction) return // ← SE SALE AQUÍ SI NO ES PRODUCCIÓN
  
  const response = await fetch('/api/pending', { 
    method: 'GET',
    cache: 'no-store'
  })
  
  const data: PendingData = await response.json()
  setGuesses(data.guesses || [])
  setEvents(data.events || [])
}, [enabled, isProduction])
```

**Línea 94-100**: Intervalo de 1 segundo
```typescript
useEffect(() => {
  if (!enabled || !isProduction) return // ← O AQUÍ
  
  fetchPending()
  const interval = setInterval(fetchPending, 1000)
  return () => clearInterval(interval)
}, [enabled, isProduction, fetchPending])
```

---

### 3️⃣ **FRONTEND - PROCESAMIENTO** (Ejecuta acciones)

#### `context/GameContext.tsx` (Líneas 345-400)

```typescript
useEffect(() => {
  if (events.length === 0) return // ← SI NO HAY EVENTOS, NO HACE NADA
  
  console.log('🔔 [Webhook] Eventos recibidos:', events)
  
  events.forEach((event) => {
    switch (event.event) {
      case 'reveal_letter':
        if (gameState.isRunning && gameState.currentWord) {
          revealRandomLetter()
        }
        break
      // ...
    }
    
    markProcessed(event.id)
  })
}, [events, ...])
```

---

## 🔍 FLUJO COMPLETO (Paso a Paso)

```
1. Usuario dispara webhook:
   GET https://wordguess-prov2.pages.dev/api/event?user=Test&event=reveal_letter
   
   ↓
   
2. Cloudflare Function (functions/api/event.ts):
   - Recibe el request
   - Valida parámetros
   - Guarda en KV: env.GAME_KV.put("event-123", {...})
   - Retorna: { success: true, data: {...} }
   
   ↓
   
3. Frontend - Polling (hooks/use-incoming-webhooks.ts):
   - Cada 1 segundo hace: fetch('/api/pending')
   - Llama a functions/api/pending.ts
   - Recibe: { guesses: [], events: [...] }
   - Actualiza estado: setEvents(data.events)
   
   ↓
   
4. Frontend - Procesamiento (context/GameContext.tsx):
   - useEffect detecta cambio en 'events'
   - Ejecuta switch (event.event)
   - Llama a revealRandomLetter()
   - Marca como procesado: markProcessed(event.id)
   
   ↓
   
5. Frontend - Eliminar de KV (functions/api/mark-processed.ts):
   - Recibe POST con { key: "event-123" }
   - Elimina de KV: env.GAME_KV.delete(key)
```

---

## ❌ PUNTOS DE FALLO (Diagnóstico)

### ❌ **Punto 1: KV No Vinculado**
**Archivo**: `functions/api/event.ts` línea 51  
**Síntoma**: Webhook retorna `success: true` pero no se guarda en KV  
**Verificar**:
```bash
# Cloudflare Dashboard
Workers & Pages → [Tu Proyecto] → Settings → Functions → KV Namespace Bindings

Debe existir:
Variable name: GAME_KV
KV namespace: GAME_KV (seleccionado)
```

**Test**:
```bash
# Disparar webhook
curl https://wordguess-prov2.pages.dev/api/event?user=Test&event=reveal_letter

# Verificar que se guardó
curl https://wordguess-prov2.pages.dev/api/pending

# Debería retornar:
{
  "guesses": [],
  "events": [
    { "id": "event-...", "event": "reveal_letter", ... }
  ]
}
```

---

### ❌ **Punto 2: Polling No Activo**
**Archivo**: `hooks/use-incoming-webhooks.ts` línea 34  
**Síntoma**: No se hacen requests a `/api/pending`  
**Verificar**:
```javascript
// Abrir Console (F12) en wordguess-prov2.pages.dev/game
// Debería aparecer:
✅ [Polling] Activado en producción (wordguess-prov2.pages.dev)
```

**Si no aparece**:
- El hostname no es reconocido como producción
- O hay un error de JavaScript que impide el useEffect

**Test**:
```javascript
// En Console (F12):
window.location.hostname
// Debe retornar: "wordguess-prov2.pages.dev"
// NO: "localhost" o "127.0.0.1"
```

---

### ❌ **Punto 3: Fetch a `/api/pending` Falla**
**Archivo**: `hooks/use-incoming-webhooks.ts` línea 48  
**Síntoma**: El polling está activo pero no recibe datos  
**Verificar**:
```javascript
// En Console (F12) → Tab "Network"
// Filtrar por "pending"
// Debería aparecer request cada 1 segundo

Request URL: https://wordguess-prov2.pages.dev/api/pending
Status: 200 OK
Response: { "guesses": [], "events": [] }
```

**Si falla con 404**:
- Las Functions no se desplegaron
- La carpeta `functions/` no está en el repositorio

**Si retorna siempre vacío**:
- El KV no está vinculado
- O los webhooks expiraron (TTL 60s)

---

### ❌ **Punto 4: Eventos No Se Procesan**
**Archivo**: `context/GameContext.tsx` línea 345  
**Síntoma**: Los eventos llegan pero no se ejecutan  
**Verificar**:
```javascript
// En Console (F12) debería aparecer:
🔔 [Webhook] Eventos recibidos: [...]
🎯 [Webhook] Procesando evento: reveal_letter Usuario: Test
✅ [Webhook] Revelando letra...

// O si hay error:
⚠️ [Webhook] No hay ronda activa
❌ [Webhook] No hay palabras configuradas
```

**Si no aparece nada**:
- El array `events` está vacío
- El useEffect no se está ejecutando
- Hay un error de JavaScript

---

## 🧪 PLAN DE DIAGNÓSTICO (Hazlo en orden)

### ✅ **Test 1: Verificar que el webhook llegue a Cloudflare**
```bash
curl -v https://wordguess-prov2.pages.dev/api/event?user=Test&event=reveal_letter
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Event received",
  "data": {
    "id": "event-1768949891261-uk4u8rc7i",
    "user": "Test",
    "event": "reveal_letter",
    "timestamp": 1768949891261,
    "processed": false
  }
}
```

✅ **Si recibiste esto: El webhook SÍ llega a Cloudflare**

---

### ✅ **Test 2: Verificar que se guardó en KV**
```bash
# Inmediatamente después (antes de 60s)
curl https://wordguess-prov2.pages.dev/api/pending
```

**Respuesta esperada**:
```json
{
  "guesses": [],
  "events": [
    {
      "id": "event-1768949891261-uk4u8rc7i",
      "user": "Test",
      "event": "reveal_letter",
      ...
    }
  ]
}
```

❌ **Si retorna `{ guesses: [], events: [] }`: EL KV NO ESTÁ VINCULADO**

✅ **Si retorna el evento: El KV funciona**

---

### ✅ **Test 3: Verificar polling en el navegador**
```javascript
// 1. Abre: https://wordguess-prov2.pages.dev/game
// 2. F12 → Console
// 3. Busca el mensaje:
✅ [Polling] Activado en producción (wordguess-prov2.pages.dev)
```

❌ **Si ves `⏸️ [Polling] Desactivado`: No está en producción**

✅ **Si ves `✅ [Polling] Activado`: El polling funciona**

---

### ✅ **Test 4: Verificar que el polling consulte `/api/pending`**
```javascript
// 1. F12 → Tab "Network"
// 2. Filtrar por "pending"
// 3. Esperar 2-3 segundos
// 4. Deberías ver requests cada 1 segundo
```

❌ **Si no aparecen requests**: El intervalo no se está ejecutando

✅ **Si aparecen**: El polling funciona

---

### ✅ **Test 5: Verificar que los eventos lleguen al estado**
```javascript
// 1. Dispara webhook desde otra pestaña
// 2. Vuelve a la pestaña del juego
// 3. Espera 1-2 segundos
// 4. En Console debería aparecer:
📥 [Polling] Webhooks recibidos: { guesses: 0, events: 1, data: {...} }
🔔 [Webhook] Eventos recibidos: [...]
```

❌ **Si no aparece**: Los eventos no llegan al estado

✅ **Si aparece**: Los eventos se reciben

---

### ✅ **Test 6: Verificar procesamiento**
```javascript
// Debería aparecer:
🎯 [Webhook] Procesando evento: reveal_letter Usuario: Test
✅ [Webhook] Revelando letra...
// Y en el juego debería revelarse una letra
```

❌ **Si no pasa**: Hay un problema en el procesamiento

---

## 📋 CHECKLIST DE REQUISITOS

- [ ] Carpeta `functions/` existe en el repositorio
- [ ] Carpeta `functions/api/` contiene 4 archivos (.ts)
- [ ] KV Namespace `GAME_KV` creado en Cloudflare
- [ ] KV vinculado al proyecto (Settings → Functions)
- [ ] Variable del binding es exactamente `GAME_KV`
- [ ] Deploy completado sin errores
- [ ] Página abierta en `wordguess-prov2.pages.dev` (no localhost)
- [ ] Console muestra "Polling Activado"
- [ ] Network muestra requests a `/api/pending` cada 1s
- [ ] Al menos 1 palabra configurada en `/config`
- [ ] Ronda iniciada en `/game`

---

## 🎯 RESULTADO ESPERADO

Si todo funciona:

1. **Disparas webhook**:
   ```
   GET /api/event?user=Test&event=reveal_letter
   → { success: true, data: {...} }
   ```

2. **En Console (1-2s después)**:
   ```
   📥 [Polling] Webhooks recibidos: { events: 1 }
   🔔 [Webhook] Eventos recibidos: [...]
   🎯 [Webhook] Procesando evento: reveal_letter
   ✅ [Webhook] Revelando letra...
   ```

3. **En el juego**:
   - Una letra se revela automáticamente
   - El panel de debug muestra el log

---

## 💡 SOLUCIÓN MÁS PROBABLE

**Si `/api/pending` retorna vacío:**
```
El KV no está vinculado correctamente.

Solución:
1. Cloudflare Dashboard
2. Workers & Pages → [Tu Proyecto]
3. Settings → Functions → KV Namespace Bindings
4. Add binding:
   - Variable name: GAME_KV
   - KV namespace: GAME_KV
5. Save
6. Re-deploy (hacer un push o manual redeploy)
```

---

## 🔧 COMANDOS ÚTILES PARA DEBUG

```bash
# Ver si el webhook llega
curl https://wordguess-prov2.pages.dev/api/event?user=Test&event=reveal_letter

# Ver si se guardó en KV (hacerlo inmediatamente)
curl https://wordguess-prov2.pages.dev/api/pending

# Ver logs de Cloudflare
# Dashboard → Workers & Pages → [Proyecto] → Logs → Real-time logs
```

---

## 📞 SIGUIENTE PASO

**Haz Test 1 y Test 2** y dime qué resultado obtienes:

1. Dispara el webhook
2. Consulta `/api/pending`
3. ¿Qué retorna?

Con eso sabremos exactamente dónde está el problema 🎯
