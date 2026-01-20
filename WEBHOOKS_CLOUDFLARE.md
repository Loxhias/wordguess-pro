# 🚀 Webhooks en Cloudflare Pages

## 📦 Arquitectura Final

Este proyecto combina:
- **Frontend estático** (Next.js con `output: 'export'`)
- **Cloudflare Functions** (Edge Functions para webhooks)
- **Polling en cliente** (solo en producción)

```
┌─────────────────────────────────────────────┐
│         Cloudflare Pages Deployment          │
├─────────────────────────────────────────────┤
│  out/                                        │
│  ├── index.html         (Frontend estático) │
│  ├── _next/static/...                       │
│  └── ...                                     │
│                                              │
│  functions/api/         (Edge Functions)    │
│  ├── guess.ts          (Recibe intentos)   │
│  ├── event.ts          (Recibe eventos)    │
│  ├── pending.ts        (Consulta cola)     │
│  └── mark-processed.ts (Marca procesados)  │
└─────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Webhooks

### 📤 Salientes (Outgoing)
El juego **envía** eventos a una URL externa configurada por el usuario:

```typescript
// Eventos que el juego dispara automáticamente:
- GAME_WIN          → Cuando un jugador adivina
- ROUND_END         → Cuando termina el tiempo
- LETTER_REVEALED   → Al revelar una letra
- ROUND_START       → Al iniciar nueva ronda
- DOUBLE_POINTS     → Al activar puntos dobles
- TIMER_WARNING     → 10 segundos restantes
```

### 📥 Entrantes (Incoming)
Aplicaciones externas **envían** acciones al juego:

#### 1️⃣ Adivinar Palabra
```
GET /api/guess?user={username}&word={comment}
```
- Envía el intento de un usuario
- Si la palabra es correcta, el jugador gana

#### 2️⃣ Revelar Letra
```
GET /api/event?user={username}&event=reveal_letter
```
- Revela una letra aleatoria de la palabra actual

#### 3️⃣ Puntos Dobles
```
GET /api/event?user={username}&event=double_points&duration=30
```
- Activa puntos dobles por X segundos

#### 4️⃣ Nueva Ronda
```
GET /api/event?user={username}&event=nueva_ronda
```
- Inicia una nueva ronda con palabra aleatoria

---

## 🏗️ Implementación

### Cloudflare Functions (`functions/api/*.ts`)
- Se ejecutan en el **edge** de Cloudflare
- Reciben webhooks y los almacenan en **Cloudflare KV**
- Soportan GET y POST
- CORS habilitado (`Access-Control-Allow-Origin: *`)

### Hook de Polling (`hooks/use-incoming-webhooks.ts`)
```typescript
const { guesses, events, markProcessed } = useIncomingWebhooks(true)
```
- **Solo se activa en producción** (no en localhost)
- Hace polling cada 1 segundo a `/api/pending`
- Procesa automáticamente las acciones recibidas
- Marca como procesadas las acciones completadas

### Contexto del Juego (`context/GameContext.tsx`)
- Integra `useIncomingWebhooks`
- Procesa automáticamente guesses y events
- Ejecuta acciones del juego según los webhooks

---

## ⚙️ Configuración en Cloudflare

### 1. Crear KV Namespace
```bash
# Desde Cloudflare Dashboard
Workers & Pages → KV → Create Namespace
Name: GAME_KV
```

### 2. Vincular KV al Proyecto
```bash
# Settings → Functions → KV Namespace Bindings
Variable name: GAME_KV
KV namespace: GAME_KV (seleccionar el creado)
```

### 3. Deploy
```bash
npm run build
# Subir carpeta 'out/' a Cloudflare Pages
# Las Functions se detectan automáticamente desde 'functions/'
```

---

## 🧪 Testing Local

### ⚠️ Limitaciones en Desarrollo
Las Cloudflare Functions **NO funcionan en localhost** con `npm run dev`.

Para probar webhooks localmente:

#### Opción A: Usar Wrangler (Cloudflare CLI)
```bash
npm install -g wrangler
wrangler pages dev out --kv GAME_KV
```

#### Opción B: Desplegar en Cloudflare Preview
```bash
# Conectar repositorio a Cloudflare Pages
# Cada push crea un preview deployment con Functions funcionando
```

---

## 📋 Ejemplo de Uso

### Desde OBS / Streamlabs

1. Configura un **Browser Source** apuntando a tu juego:
```
https://tu-juego.pages.dev/?webhook=https://tu-servidor.com/webhook
```

2. Usa **Chat Commands** para disparar webhooks:
```
!adivinar PALABRA
→ GET https://tu-juego.pages.dev/api/guess?user=Usuario&word=PALABRA

!revelar
→ GET https://tu-juego.pages.dev/api/event?user=Usuario&event=reveal_letter

!doble
→ GET https://tu-juego.pages.dev/api/event?user=Usuario&event=double_points&duration=30
```

### Desde Código
```javascript
// Adivinar
fetch('https://tu-juego.pages.dev/api/guess?user=Juan&word=PERRO')

// Revelar letra
fetch('https://tu-juego.pages.dev/api/event?user=Maria&event=reveal_letter')

// Puntos dobles
fetch('https://tu-juego.pages.dev/api/event?user=Admin&event=double_points&duration=60')

// Nueva ronda
fetch('https://tu-juego.pages.dev/api/event?user=Admin&event=nueva_ronda')
```

---

## 🔐 Seguridad

### Rate Limiting
Las Cloudflare Functions tienen rate limiting automático por IP.

### Validación
Todos los webhooks validan:
- Parámetros requeridos
- Valores permitidos (events válidos)
- Formato de datos

### KV Expiration
Los datos se auto-eliminan después de 60 segundos (configurable en cada Function):
```typescript
await env.GAME_KV.put(key, value, { expirationTtl: 60 })
```

---

## 📊 Monitoreo

### Cloudflare Dashboard
```
Workers & Pages → [Tu Proyecto] → Analytics
- Requests por endpoint
- Latencia promedio
- Errores
```

### Console Logs
Los logs se ven en:
```
Workers & Pages → [Tu Proyecto] → Logs
```

---

## 🐛 Troubleshooting

### Webhooks no funcionan en localhost
✅ **Normal**. Las Functions solo funcionan en Cloudflare. Usa Wrangler o deploya.

### Error 404 en /api/*
❌ Verificar que la carpeta `functions/` esté en la raíz del proyecto
❌ Verificar que el deployment incluya la carpeta `functions/`

### Webhooks no se procesan
❌ Verificar que KV esté vinculado correctamente
❌ Revisar logs en Cloudflare Dashboard
❌ Verificar que el juego esté corriendo (no en pausa)

### Build falla con error de KVNamespace
❌ Verificar que `functions/` esté excluido del `tsconfig.json` principal
❌ Verificar que `functions/tsconfig.json` tenga los tipos de Cloudflare

---

## 📚 Recursos

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

## ✅ Checklist de Deploy

- [ ] Build exitoso (`npm run build`)
- [ ] Carpeta `out/` generada
- [ ] Carpeta `functions/` en el proyecto
- [ ] KV Namespace creado en Cloudflare
- [ ] KV vinculado al proyecto (Settings → Functions)
- [ ] Deploy a Cloudflare Pages
- [ ] Probar webhooks desde navegador
- [ ] Configurar URL de webhook saliente en `/config`
