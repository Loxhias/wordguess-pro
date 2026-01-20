# 🚀 Guía Rápida: Webhooks en Cloudflare (JavaScript)

## ✅ **Lo que acabas de crear**

### **📂 Estructura de Archivos**

```
functions/api/          (Cloudflare Functions en JavaScript puro)
├── event.js           → Recibe eventos (reveal_letter, double_points, nueva_ronda)
├── guess.js           → Recibe intentos de adivinanza
├── pending.js         → Lista webhooks pendientes (el "buzón")
└── mark-processed.js  → Marca webhooks como procesados

hooks/
└── use-incoming-webhooks.ts  → Polling cada 1s (ya existente)

context/
└── GameContext.tsx           → Procesa webhooks (ya existente)
```

---

## 🏗️ **Cómo Funciona el "Buzón"**

```
1. Webhook llega:
   GET https://wordguess-prov2.pages.dev/api/event?user=Juan&event=reveal_letter
   
   ↓
   
2. event.js recibe y guarda en KV:
   Key: "event-1768950000-abc123"
   Value: { id, event, user, timestamp, processed: false }
   TTL: 60 segundos (se auto-elimina)
   
   ↓
   
3. Frontend pregunta cada 1 segundo:
   fetch('/api/pending')
   
   ↓
   
4. pending.js lee del KV:
   Retorna: { guesses: [], events: [{...}] }
   
   ↓
   
5. GameContext.tsx procesa:
   - Ejecuta revealRandomLetter()
   - Llama a mark-processed.js
   
   ↓
   
6. mark-processed.js elimina del KV:
   DELETE key "event-1768950000-abc123"
```

---

## 🧪 **Cómo Probar (Paso a Paso)**

### **PASO 1: Verificar KV en Cloudflare**

```
1. Dashboard Cloudflare
2. Workers & Pages → wordguess-prov2
3. Settings → Functions → KV Namespace Bindings
4. Debe existir:
   Variable name: GAME_KV
   KV namespace: GAME_KV
```

✅ **Si existe**: Continúa al PASO 2  
❌ **Si NO existe**: Créalo primero (ver sección "Configurar KV" abajo)

---

### **PASO 2: Desplegar**

```bash
# Build local
npm run build

# Deploy (si tienes auto-deploy en GitHub)
git add .
git commit -m "Add Cloudflare Functions in JavaScript"
git push

# O sube manualmente la carpeta 'out/' + carpeta 'functions/'
```

⚠️ **IMPORTANTE**: La carpeta `functions/` **debe estar en el repositorio** junto con `out/`.

---

### **PASO 3: Probar el Buzón**

#### **Test 1: ¿El webhook llega?**
```bash
curl "https://wordguess-prov2.pages.dev/api/event?user=TestUser&event=reveal_letter"
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Event received and stored",
  "data": {
    "id": "event-1768950123-abc",
    "user": "TestUser",
    "event": "reveal_letter",
    "timestamp": 1768950123456,
    "processed": false
  }
}
```

✅ **Si obtienes esto**: El webhook llega correctamente  
❌ **Si obtienes error**: Ver sección "Troubleshooting" abajo

---

#### **Test 2: ¿Se guardó en el buzón?**
```bash
# Hacerlo INMEDIATAMENTE (antes de 60 segundos)
curl "https://wordguess-prov2.pages.dev/api/pending"
```

**Respuesta esperada**:
```json
{
  "guesses": [],
  "events": [
    {
      "id": "event-1768950123-abc",
      "user": "TestUser",
      "event": "reveal_letter",
      "timestamp": 1768950123456,
      "processed": false
    }
  ]
}
```

✅ **Si ves el evento**: ¡El buzón funciona!  
❌ **Si retorna vacío**: El KV NO está vinculado (ver Troubleshooting)

---

#### **Test 3: ¿El frontend lo detecta?**
```
1. Abre: https://wordguess-prov2.pages.dev/game
2. F12 → Console
3. Deberías ver:
   ✅ [Polling] Activado en producción (wordguess-prov2.pages.dev)

4. Dispara webhook desde otra pestaña:
   https://wordguess-prov2.pages.dev/api/event?user=Test&event=reveal_letter

5. Espera 1-2 segundos
6. En Console deberías ver:
   📥 [Polling] Webhooks recibidos: { events: 1 }
   🔔 [Webhook] Eventos recibidos: [...]
   🎯 [Webhook] Procesando evento: reveal_letter
```

---

## 🔧 **Configurar KV (Si NO lo hiciste antes)**

### **1. Crear KV Namespace**
```
1. Cloudflare Dashboard
2. Menú lateral → Workers & Pages
3. Sección KV
4. "Create a Namespace"
5. Name: GAME_KV
6. "Add"
```

### **2. Vincular KV al Proyecto**
```
1. Workers & Pages → wordguess-prov2
2. Settings → Functions
3. KV Namespace Bindings
4. "Add binding"
   - Variable name: GAME_KV (EXACTO, case-sensitive)
   - KV namespace: GAME_KV (seleccionar)
5. "Save"
```

### **3. Re-deploy**
```bash
# Hacer cualquier cambio pequeño y push
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 🐛 **Troubleshooting**

### ❌ **Error: "KV not configured"**
**Causa**: El KV no está vinculado  
**Solución**: Sigue los pasos de "Configurar KV" arriba

---

### ❌ **`/api/pending` retorna vacío siempre**
**Causa**: KV no vinculado o webhook expiró (TTL 60s)  
**Solución**:
1. Verifica el binding en Cloudflare
2. Dispara webhook y consulta `/api/pending` inmediatamente
3. Re-deploy después de configurar KV

---

### ❌ **Error 404 en `/api/event`**
**Causa**: La carpeta `functions/` no está desplegada  
**Solución**:
1. Verifica que `functions/api/*.js` está en el repositorio
2. Asegúrate de hacer `git add functions/`
3. Re-deploy

---

### ❌ **Console no muestra "Polling Activado"**
**Causa**: Estás en localhost o hay un error de JS  
**Solución**:
1. Verifica que estás en `wordguess-prov2.pages.dev` (no localhost)
2. Abre Console y busca errores rojos
3. Verifica que el hook `use-incoming-webhooks` se está usando

---

### ❌ **Webhooks llegan pero no se ejecutan**
**Causa**: No hay palabras o no hay ronda activa  
**Solución**:
1. Ve a `/config` y agrega al menos 1 palabra
2. Inicia ronda: `/api/event?user=Admin&event=nueva_ronda`
3. Luego prueba: `/api/event?user=Test&event=reveal_letter`

---

## 📋 **URLs de Webhooks (Para Copiar)**

### **Eventos del Juego**
```bash
# Nueva ronda
https://wordguess-prov2.pages.dev/api/event?user={username}&event=nueva_ronda

# Revelar letra
https://wordguess-prov2.pages.dev/api/event?user={username}&event=reveal_letter

# Puntos dobles (30 segundos)
https://wordguess-prov2.pages.dev/api/event?user={username}&event=double_points&duration=30
```

### **Adivinanza**
```bash
# Intentar adivinar
https://wordguess-prov2.pages.dev/api/guess?user={username}&word={palabra}
```

⚠️ **Importante**: Reemplaza `{username}` y `{palabra}` con valores reales.

---

## 🎯 **Verificación Final**

### ✅ **Checklist de Deploy**
- [ ] Build exitoso (`npm run build`)
- [ ] Carpeta `out/` generada
- [ ] Carpeta `functions/api/` con 4 archivos `.js`
- [ ] KV Namespace `GAME_KV` creado
- [ ] KV vinculado al proyecto (Variable: GAME_KV)
- [ ] Deploy completado
- [ ] Test 1 exitoso (webhook llega)
- [ ] Test 2 exitoso (se guarda en KV)
- [ ] Test 3 exitoso (frontend lo detecta)

---

## 💡 **Diferencias con la Versión Anterior (TypeScript)**

### **Antes** (.ts):
```typescript
interface Env {
  GAME_KV?: KVNamespace
}
export async function onRequestGet(context: { request: Request; env: Env }) {
  // TypeScript que fallaba en build
}
```

### **Ahora** (.js):
```javascript
export async function onRequestGet(context) {
  const { request, env } = context;
  // JavaScript puro, funciona en Cloudflare sin problemas
}
```

**Ventajas**:
- ✅ No requiere compilación
- ✅ No requiere tipos de Cloudflare
- ✅ Más simple y directo
- ✅ Funciona out-of-the-box

---

## 🎉 **¡Listo para Producción!**

Si pasaste todos los tests, tu sistema de webhooks está funcionando correctamente:

1. ✅ Los webhooks llegan a Cloudflare
2. ✅ Se guardan en el KV
3. ✅ El frontend los detecta (polling)
4. ✅ El juego ejecuta las acciones
5. ✅ Se eliminan del KV (no duplicados)

**¡Felicidades! Tu juego ahora puede recibir comandos externos en tiempo real** 🚀

---

## 📚 **Documentos Relacionados**

- `DIAGNOSTICO_WEBHOOKS.md` - Troubleshooting avanzado
- `ARQUITECTURA_LOCAL_FIRST.md` - Cómo funciona el juego
- `DEPLOY_CLOUDFLARE_FINAL.md` - Guía de deploy
