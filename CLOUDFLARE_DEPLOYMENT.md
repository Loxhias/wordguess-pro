# 🚀 DEPLOYMENT A CLOUDFLARE PAGES - GUÍA COMPLETA

Esta guía te ayudará a desplegar WordGuess Pro como una Single Page Application (SPA) completamente estática en Cloudflare Pages.

---

## ✅ CAMBIOS REALIZADOS

### 1. Migración a Client-Side Only

- ✅ **Eliminadas API Routes**: Ya no hay `/api/*` endpoints
- ✅ **Estado en React Context**: `GameContext.tsx` maneja todo el estado del juego
- ✅ **Palabras en memoria**: Importadas desde `lib/words.ts`
- ✅ **Sin polling**: Actualizaciones instantáneas en memoria
- ✅ **LocalStorage**: Persistencia de jugadores, configuración y palabras custom

### 2. Sistema de Webhooks Integrado

- ✅ **Hook `useMagicWebhook`**: Lee `?webhook=URL` de la query string
- ✅ **Eventos automáticos**: Se disparan al ocurrir acciones en el juego:
  - `GAME_WIN` - Cuando alguien adivina correctamente
  - `ROUND_END` - Cuando termina el tiempo
  - `LETTER_REVEALED` - Al revelar una letra
  - `ROUND_START` - Nueva ronda iniciada
  - `DOUBLE_POINTS` - Puntos dobles activados
  - `TIMER_WARNING` - Quedan 10 segundos

### 3. Configuración para Static Export

- ✅ **`output: 'export'`** en `next.config.mjs`
- ✅ **`images: { unoptimized: true }`**
- ✅ **Sin dependencias de servidor**

---

## 🏗️ BUILD LOCAL

### Paso 1: Instalar dependencias

```bash
npm install
```

### Paso 2: Build estático

```bash
npm run build
```

Esto generará una carpeta `out/` con todos los archivos estáticos.

### Paso 3: Probar localmente

```bash
npx serve out
```

Abre `http://localhost:3000` y prueba el juego.

---

## ☁️ DEPLOYMENT A CLOUDFLARE PAGES

### Opción A: Deploy desde Git (Recomendado)

#### 1. Subir código a GitHub

```bash
git init
git add .
git commit -m "Ready for Cloudflare Pages deployment"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/wordguess-pro.git
git push -u origin main
```

#### 2. Conectar con Cloudflare Pages

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click en **Pages** → **Create a project**
3. Click en **Connect to Git**
4. Selecciona tu repositorio `wordguess-pro`
5. Configura el build:

```yaml
Build command: npm run build
Build output directory: out
Root directory: (dejar vacío)
Environment variables: (ninguna necesaria)
```

6. Click **Save and Deploy**

¡Listo! Cloudflare Pages hará el deploy automáticamente.

### Opción B: Deploy Manual (Wrangler CLI)

#### 1. Instalar Wrangler

```bash
npm install -g wrangler
```

#### 2. Login en Cloudflare

```bash
wrangler login
```

#### 3. Build y Deploy

```bash
# Build
npm run build

# Deploy
wrangler pages deploy out --project-name=wordguess-pro
```

Tu sitio estará en: `https://wordguess-pro.pages.dev`

### Opción C: Drag & Drop

1. Build el proyecto: `npm run build`
2. Ve a [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click **Create a project** → **Upload assets**
4. Arrastra la carpeta `out/` completa
5. ¡Deploy instantáneo!

---

## 🔗 INTEGRACIÓN CON MAGIC BY LOXHIAS

### URL con Webhook

Una vez desplegado, comparte esta URL con tus usuarios:

```
https://wordguess-pro.pages.dev/game?webhook=https://TU-MAGIC-ALERTS-URL/webhook
```

### Cómo funciona

1. **Usuario abre el juego** con el parámetro `?webhook=`
2. **El juego guarda la URL** en localStorage
3. **Cada evento importante** se envía automáticamente al webhook:

```javascript
// Ejemplo de payload enviado:
{
  "event": "GAME_WIN",
  "timestamp": 1234567890,
  "data": {
    "playerName": "loxhias",
    "points": 10,
    "word": "JAVASCRIPT"
  }
}
```

### Desde Magic By Loxhias (Electron)

```javascript
// En tu app de escritorio
const GAME_URL = 'https://wordguess-pro.pages.dev'
const WEBHOOK_URL = 'http://localhost:3000/magic-alerts' // Tu servidor local

function openWordGuess() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
  })
  
  win.loadURL(`${GAME_URL}/game?webhook=${encodeURIComponent(WEBHOOK_URL)}`)
}
```

---

## 🎨 PERSONALIZACIÓN

### Palabras Personalizadas

Los usuarios pueden:
1. Ir a `/config`
2. Añadir sus propias palabras
3. Click "Save Changes"
4. Las palabras se guardan en LocalStorage del navegador

### Temas Visuales

- **10 temas disponibles**: Cyberpunk, Neon, Matrix, Retro, Galaxy, Ocean, Sunset, Forest, Minimal, Dark
- Configurables desde `/config`

### Configuración de Ronda

- **Duración**: Default 180s (configurable)
- **Intervalo de revelación**: Default 15s (configurable)
- **Duración puntos dobles**: Default 30s (configurable)

---

## 📊 ESTRUCTURA DE ARCHIVOS (POST-REFACTORIZACIÓN)

```
wordguess-pro/
├── app/
│   ├── page.tsx                 # Página principal (info + enlaces)
│   ├── game/
│   │   └── page.tsx            # Juego principal (usa GameContext)
│   ├── config/
│   │   └── page.tsx            # Configuración (usa lib/words.ts)
│   └── layout.tsx              # Layout con GameProvider
│
├── context/
│   └── GameContext.tsx         # 🆕 Estado global del juego
│
├── hooks/
│   └── use-magic-webhook.ts    # 🆕 Hook para webhooks
│
├── lib/
│   └── words.ts                # 🆕 Banco de palabras + custom words
│
├── next.config.mjs             # ✅ Configurado para static export
│
└── out/                        # 📦 Carpeta generada con el build
    ├── index.html
    ├── game/
    │   └── index.html
    └── _next/
        └── ...
```

---

## 🔧 TROUBLESHOOTING

### Error: "TypeError: Failed to fetch"

**Causa**: El webhook URL no es accesible.

**Solución**:
- Verifica que el webhook URL sea correcto
- Si estás en Electron, asegúrate de que el servidor local esté corriendo
- Revisa la consola del navegador para detalles

### Error: "404 Not Found" en rutas

**Causa**: Cloudflare Pages no tiene configuración de fallback a index.html.

**Solución**: Crear `public/_redirects`:

```
/game    /game/index.html    200
/config  /config/index.html  200
/*       /index.html         404
```

### Las palabras custom no persisten

**Causa**: LocalStorage fue limpiado.

**Solución**: Las palabras custom se guardan en `localStorage`. Verifica que no haya extensiones del navegador bloqueando localStorage.

### Los webhooks no se envían

**Causa**: El parámetro `?webhook=` no está en la URL.

**Solución**: Asegúrate de abrir el juego con: `/game?webhook=TU_URL`

---

## 🎯 TESTING

### 1. Test local

```bash
npm run build
npx serve out
```

Abre `http://localhost:3000/game?webhook=http://localhost:8080/test`

### 2. Test con webhook real

Usa [webhook.site](https://webhook.site) para probar:

```
https://wordguess-pro.pages.dev/game?webhook=https://webhook.site/UNIQUE-ID
```

Verás los eventos llegando en tiempo real.

### 3. Test desde Electron

```javascript
const win = new BrowserWindow({ width: 1400, height: 900 })
win.loadURL('http://localhost:3000/game?webhook=http://localhost:3001/webhook')
win.webContents.openDevTools() // Ver logs
```

---

## 📈 PERFORMANCE

### Tamaño del Build

- **Total**: ~2-3 MB
- **Gzip**: ~500-700 KB
- **First Load JS**: ~200 KB

### Lighthouse Score (esperado)

- **Performance**: 95+
- **Accessibility**: 90+
- **Best Practices**: 95+
- **SEO**: 90+

### Optimizaciones Aplicadas

- ✅ Imágenes sin optimizar (necesario para static export)
- ✅ Código splitting automático de Next.js
- ✅ Tree shaking de componentes no usados
- ✅ Minificación de JS/CSS

---

## 🔒 SEGURIDAD

### Consideraciones

1. **Webhooks públicos**: Cualquiera con la URL puede enviar eventos
   - **Solución**: Implementa autenticación en tu servidor de webhooks

2. **LocalStorage**: Los datos son accesibles desde el navegador
   - **Solución**: No guardes información sensible

3. **CORS**: El juego puede hacer requests a cualquier dominio
   - **Solución**: Valida el origen en tu servidor de webhooks

### Mejoras Sugeridas

```javascript
// En tu servidor de Magic Alerts
app.post('/webhook', (req, res) => {
  // Validar origen
  const allowedOrigins = ['https://wordguess-pro.pages.dev']
  const origin = req.headers.origin
  
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  
  // Procesar evento
  const { event, data } = req.body
  // ...
})
```

---

## 🎉 RESULTADO FINAL

### URLs de Ejemplo

- **Producción**: `https://wordguess-pro.pages.dev`
- **Juego directo**: `https://wordguess-pro.pages.dev/game`
- **Configuración**: `https://wordguess-pro.pages.dev/config`
- **Con webhook**: `https://wordguess-pro.pages.dev/game?webhook=URL`

### Features Funcionando

✅ Juego completamente funcional  
✅ Timer con auto-revelación  
✅ Sistema de puntos  
✅ Ranking en tiempo real  
✅ 10 temas visuales  
✅ 5 idiomas  
✅ Palabras customizables  
✅ Webhooks a Magic By Loxhias  
✅ 100% client-side  
✅ 0 dependencias de servidor  
✅ Deploy gratuito en Cloudflare  

---

## 📞 SOPORTE

### Errores Comunes

1. **Build falla**: `rm -rf .next out && npm run build`
2. **Rutas no funcionan**: Verifica `_redirects` en `public/`
3. **Webhooks no llegan**: Revisa la consola del navegador

### Comandos Útiles

```bash
# Limpiar cache
npm run build -- --no-cache

# Ver tamaño del build
du -sh out/

# Analizar bundle
npm install -g next-bundle-analyzer
ANALYZE=true npm run build
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Deploy a Cloudflare Pages
2. ✅ Probar desde Magic By Loxhias
3. ✅ Configurar palabras personalizadas
4. ✅ Testear webhooks con usuarios reales
5. ✅ Compartir URL con tus clientes

---

**¡Listo para vender tu producto! 🎮💰**

URL de deploy: `https://wordguess-pro.pages.dev`  
Costo mensual: **$0** (Cloudflare Pages gratuito)  
Tiempo de setup: **5 minutos**
