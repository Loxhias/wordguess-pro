# 🎯 ARQUITECTURA FINAL - EXPORTACIÓN ESTÁTICA

## ✅ CONFIGURACIÓN ACTUAL

**Tipo:** Next.js con exportación estática (`output: 'export'`)
**Deploy:** Cloudflare Pages (archivos HTML estáticos)
**Webhooks:** Client-side salientes únicamente

---

## 📦 ESTRUCTURA

```
wordguess-pro/
├── app/
│   ├── game/page.tsx              ← UI del juego
│   ├── config/page.tsx            ← Configuración
│   ├── layout.tsx                 ← Layout global
│   └── not-found.tsx              ← Página 404
├── context/
│   └── GameContext.tsx            ← Estado del juego
├── hooks/
│   └── use-magic-webhook.ts       ← Webhooks SALIENTES ✅
├── lib/
│   ├── words.ts                   ← Gestión de palabras
│   └── themes.ts                  ← 10 temas visuales
├── components/
│   └── game/                      ← Componentes del juego
└── next.config.mjs                ← output: 'export' ✅
```

---

## 🔄 FLUJO DE WEBHOOKS (CLIENT-SIDE)

### 1. Configuración

Usuario va a `/config` y configura:
```
Webhook URL: https://magic-by-loxhias.com/webhook
```

Se guarda en LocalStorage.

### 2. Lectura Automática

`useMagicWebhook()` hook lee:
```javascript
// Opción 1: URL parameter
?webhook=https://magic-by-loxhias.com/webhook

// Opción 2: LocalStorage
localStorage.getItem('wordguess_webhook_url')
```

### 3. Envío de Eventos

Cuando ocurre un evento en el juego:

```javascript
// Desde el navegador del usuario
fetch('https://magic-by-loxhias.com/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'GAME_WIN',
    timestamp: Date.now(),
    data: {
      playerName: 'loxhias',
      points: 10,
      word: 'JAVASCRIPT'
    }
  })
})
```

---

## 📡 EVENTOS SALIENTES

El juego envía estos eventos automáticamente:

| Evento | Cuándo | Datos |
|--------|--------|-------|
| `GAME_WIN` | Alguien adivina la palabra | playerName, points, word |
| `ROUND_END` | Se acaba el tiempo sin ganador | word, timeElapsed |
| `LETTER_REVEALED` | Se revela una letra | letter, position, revealed, total |
| `ROUND_START` | Nueva ronda comienza | word, hint, duration |
| `DOUBLE_POINTS` | Se activan puntos x2 | duration |
| `TIMER_WARNING` | Quedan 10 segundos | timeLeft |

---

## 💾 ALMACENAMIENTO

**LocalStorage (navegador del usuario):**
```javascript
wordguess_players          // Ranking
wordguess_config           // Configuración (duraciones, idioma)
wordguess_custom_words     // Palabras personalizadas
wordguess_theme            // Tema visual
wordguess_webhook_url      // URL del webhook saliente
```

**NO hay base de datos** - Todo es client-side.

---

## 🚀 BUILD Y DEPLOY

### Build Local:
```bash
npm run build
```

**Genera:** Carpeta `out/` con HTML estático

### Deploy a Cloudflare Pages:

**Método 1: Git (Automático)**
```bash
git add .
git commit -m "Static export ready"
git push
```

Cloudflare desplegará automáticamente.

**Método 2: CLI**
```bash
npx wrangler pages deploy out --project-name=wordguess-pro
```

**Configuración en Cloudflare:**
- Framework: Next.js
- Build command: `npm run build`
- Build output: `out`

---

## 🔧 CÓMO FUNCIONA

### 1. Usuario Abre el Juego
```
https://wordguess-pro.pages.dev/game?webhook=URL_EXTERNA
```

### 2. Juego Carga en el Navegador
- Lee palabras de LocalStorage
- Inicializa GameContext
- Detecta webhook URL del parámetro o LocalStorage

### 3. Usuario Juega
- Inicia ronda
- Timer cuenta atrás
- Letras se revelan automáticamente
- Todo corre en el navegador

### 4. Evento Ocurre
- Alguien gana → Fetch POST al webhook
- Letra se revela → Fetch POST al webhook
- Tiempo agota → Fetch POST al webhook

### 5. Magic By Loxhias Recibe
```
POST https://magic-by-loxhias.com/webhook
{
  "event": "GAME_WIN",
  "data": { ... }
}
```

---

## 🎮 INTEGRACIÓN CON MAGIC BY LOXHIAS

### Desde tu aplicación Desktop (Electron):

```javascript
// Abrir juego con webhook configurado
const gameWindow = new BrowserWindow({
  width: 1200,
  height: 800
})

const webhookUrl = 'http://localhost:3000/game-events' // Tu servidor local
gameWindow.loadURL(
  `https://wordguess-pro.pages.dev/game?webhook=${encodeURIComponent(webhookUrl)}`
)
```

### Recibir eventos en tu servidor:

```javascript
// En Magic By Loxhias
app.post('/game-events', (req, res) => {
  const { event, data } = req.body
  
  switch(event) {
    case 'GAME_WIN':
      console.log(`${data.playerName} ganó con ${data.points} puntos!`)
      // Mostrar alerta en stream
      break
    case 'LETTER_REVEALED':
      console.log(`Letra revelada: ${data.letter}`)
      break
  }
  
  res.json({ success: true })
})
```

---

## ✅ VENTAJAS DE ESTA ARQUITECTURA

1. **100% Estático** - Deploy súper rápido
2. **Gratis** - Cloudflare Pages es gratuito
3. **Sin Servidor** - No hay backend que mantener
4. **Offline-Ready** - Funciona sin internet (después de cargar)
5. **Privado** - Los datos solo están en el navegador del usuario
6. **Seguro** - No hay API que hackear
7. **Rápido** - Todo corre en el cliente

---

## ⚠️ LIMITACIONES

1. **No hay webhooks entrantes** - El juego no puede recibir comandos externos
2. **Datos locales** - Ranking no se comparte entre dispositivos
3. **No persistencia remota** - Si limpian caché, se pierde todo
4. **CORS** - El webhook destino debe aceptar requests desde el navegador

---

## 🔒 SEGURIDAD

### CORS en tu servidor:

```javascript
// Magic By Loxhias debe permitir:
app.use(cors({
  origin: 'https://wordguess-pro.pages.dev',
  methods: ['POST']
}))
```

---

## 📊 RESUMEN

```
┌─────────────────────────────────────┐
│ Usuario abre juego en navegador     │
│ https://wordguess-pro.pages.dev    │
└──────────────┬──────────────────────┘
               │
               │ Juego corre 100% en cliente
               │ Lee/guarda en LocalStorage
               │
               ▼
┌─────────────────────────────────────┐
│ Evento ocurre (victoria, etc.)      │
└──────────────┬──────────────────────┘
               │
               │ fetch() desde navegador
               ▼
┌─────────────────────────────────────┐
│ Magic By Loxhias                    │
│ Recibe webhook y procesa            │
└─────────────────────────────────────┘
```

---

## 🎯 ESTADO FINAL

- ✅ Exportación estática configurada
- ✅ Webhooks client-side funcionando
- ✅ 10 temas visuales
- ✅ 5 idiomas
- ✅ Palabras personalizables
- ✅ Ranking local
- ✅ Sin API Routes
- ✅ Sin base de datos
- ✅ Listo para Cloudflare Pages

**¡Todo funcionando! 🎉**
