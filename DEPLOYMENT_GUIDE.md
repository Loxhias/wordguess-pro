# 🚀 GUÍA DE DEPLOYMENT - WORDGUESS PRO PARA MAGIC BY LOXHIAS

## 📋 ÍNDICE
1. [Preparación del Proyecto](#1-preparación-del-proyecto)
2. [Configuración de Supabase](#2-configuración-de-supabase)
3. [Deployment en Vercel/Supabase](#3-deployment-en-vercelsupabase)
4. [Integración con Magic By Loxhias](#4-integración-con-magic-by-loxhias)
5. [Configuración de Ventana Emergente](#5-configuración-de-ventana-emergente)
6. [Testing y Validación](#6-testing-y-validación)

---

## 1. PREPARACIÓN DEL PROYECTO

### 1.1 Crear archivo de variables de entorno

```bash
# Copiar el ejemplo
cp .env.local.example .env.local
```

### 1.2 Configurar Supabase Project

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto o usa uno existente
3. Ve a **Settings** → **API**
4. Copia las credenciales:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3 Editar `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZXdjcnpvbmJxcnZvamRybGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY3MDU1MDAsImV4cCI6MjAxMjI4MTUwMH0...
```

---

## 2. CONFIGURACIÓN DE SUPABASE

### 2.1 Base de Datos (OPCIONAL)

El juego actualmente usa **in-memory state** y **localStorage**. Si deseas persistencia real entre sesiones:

#### Opción A: Sin base de datos (estado volátil)
✅ **Ya funciona así por defecto**
- Estado se pierde al reiniciar el servidor
- Ideal para sesiones de streaming individuales

#### Opción B: Persistencia en Supabase (recomendado para producción)

**Crear tablas necesarias:**

```sql
-- Tabla de estado del juego
CREATE TABLE game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_word TEXT,
  current_hint TEXT,
  revealed_indices INTEGER[],
  is_active BOOLEAN DEFAULT false,
  start_time BIGINT,
  duration INTEGER DEFAULT 180,
  double_points_active BOOLEAN DEFAULT false,
  double_points_until BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de jugadores
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de palabras personalizadas
CREATE TABLE custom_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  hint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_players_points ON players(points DESC);
CREATE INDEX idx_game_state_active ON game_state(is_active);

-- RLS (Row Level Security) - Permitir acceso público
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON game_state FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON game_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON game_state FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON players FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON custom_words FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON custom_words FOR INSERT WITH CHECK (true);
```

### 2.2 Storage (para datos del juego)

Si prefieres mantener el sistema actual de archivos JSON:

1. Ve a **Storage** en Supabase
2. Crea un bucket llamado `wordguess-data`
3. Configura permisos públicos

---

## 3. DEPLOYMENT EN VERCEL/SUPABASE

### Opción A: Vercel (Recomendado)

#### 3.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Login y Deploy

```bash
# Login en Vercel
vercel login

# Deploy del proyecto
vercel

# Seguir el wizard:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No
# - Project name? wordguess-pro
# - Directory? ./
# - Override settings? No
```

#### 3.3 Configurar Variables de Entorno en Vercel

```bash
# Vía CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# O desde el Dashboard:
# https://vercel.com/tu-usuario/wordguess-pro/settings/environment-variables
```

#### 3.4 Deploy a Producción

```bash
vercel --prod
```

Tu URL será: `https://wordguess-pro.vercel.app`

### Opción B: Netlify

```bash
# Instalar CLI
npm install -g netlify-cli

# Login y deploy
netlify login
netlify deploy --prod

# Configurar variables de entorno desde:
# https://app.netlify.com/sites/TU-SITE/settings/deploys#environment
```

### Opción C: Supabase Edge Functions

Crear `supabase/functions/wordguess/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Proxy a tu aplicación Next.js
  return new Response("WordGuess Pro", {
    headers: { "Content-Type": "text/html" },
  })
})
```

---

## 4. INTEGRACIÓN CON MAGIC BY LOXHIAS

### 4.1 Configuración de CORS

Para permitir que Magic By Loxhias se comunique con el juego:

**Crear `middleware.ts` en la raíz del proyecto:**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Permitir origen desde Magic By Loxhias (Electron app)
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Permitir iframe embedding
  response.headers.delete('X-Frame-Options')
  response.headers.set('Content-Security-Policy', "frame-ancestors 'self' *")

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

### 4.2 Webhooks desde Magic By Loxhias

**Endpoint de producción:**
```
https://tu-dominio.vercel.app/api/webhook/user=NOMBRE/try=PALABRA
```

**Ejemplo de integración en Magic By Loxhias (JavaScript):**

```javascript
// Desde tu app Electron
const WORDGUESS_URL = 'https://wordguess-pro.vercel.app'

// Enviar intento de palabra desde chat de Twitch
async function sendGuessFromChat(username, word) {
  const url = `${WORDGUESS_URL}/api/webhook/user=${encodeURIComponent(username)}/try=${encodeURIComponent(word)}`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.correct) {
      // Mostrar alerta en Magic By Loxhias
      showAlert({
        type: 'winner',
        player: username,
        points: data.points,
        word: word
      })
    }
    
    return data
  } catch (error) {
    console.error('Error sending guess:', error)
  }
}

// Eventos especiales (redención de puntos de canal, etc)
async function triggerSpecialEvent(username, eventType) {
  const url = `${WORDGUESS_URL}/api/webhook/user=${encodeURIComponent(username)}/event=${eventType}`
  
  const response = await fetch(url)
  return await response.json()
}

// Ejemplos de uso:
// sendGuessFromChat('loxhias', 'JAVASCRIPT')
// triggerSpecialEvent('viewer123', 'reveal_letter')
// triggerSpecialEvent('subscriber456', 'double_points')
```

### 4.3 Comunicación Bidireccional

Si necesitas que el juego notifique a Magic By Loxhias:

**Agregar a `lib/magic-alerts.ts`:**

```typescript
export async function sendToMagicAlerts(eventType: string, data: any) {
  const magicAlertsUrl = process.env.NEXT_PUBLIC_MAGIC_ALERTS_WEBHOOK_URL
  
  if (!magicAlertsUrl) {
    console.warn('[Magic Alerts] URL not configured')
    return
  }

  try {
    await fetch(magicAlertsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        timestamp: Date.now(),
        ...data
      })
    })
  } catch (error) {
    console.error('[Magic Alerts] Failed to send event:', error)
  }
}
```

---

## 5. CONFIGURACIÓN DE VENTANA EMERGENTE

### 5.1 En Magic By Loxhias (Electron)

**Opción A: BrowserWindow (ventana nativa)**

```javascript
const { BrowserWindow } = require('electron')

function openWordGuessGame() {
  const gameWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'WordGuess Pro',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    // Opcional: quitar barra de herramientas
    autoHideMenuBar: true,
    // Opcional: ventana sin bordes
    // frame: false,
    // transparent: true
  })

  gameWindow.loadURL('https://wordguess-pro.vercel.app/game')
  
  // Opcional: abrir DevTools en desarrollo
  if (process.env.NODE_ENV === 'development') {
    gameWindow.webContents.openDevTools()
  }

  return gameWindow
}

// Uso: 
// Botón en tu app: "Abrir WordGuess Pro"
// Al hacer click: openWordGuessGame()
```

**Opción B: WebView (embebido en la UI)**

```javascript
// En tu HTML de Magic By Loxhias
<div id="wordguess-container" style="display: none;">
  <webview 
    id="wordguess-webview" 
    src="https://wordguess-pro.vercel.app/game"
    style="width: 100%; height: 100vh;"
    allowpopups
  ></webview>
</div>

<script>
  function showWordGuess() {
    document.getElementById('wordguess-container').style.display = 'block'
  }
  
  function hideWordGuess() {
    document.getElementById('wordguess-container').style.display = 'none'
  }
</script>
```

**Opción C: Modal Overlay**

```javascript
// Crear overlay modal dentro de Magic By Loxhias
function createWordGuessModal() {
  const modal = document.createElement('div')
  modal.id = 'wordguess-modal'
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
  `
  
  const iframe = document.createElement('iframe')
  iframe.src = 'https://wordguess-pro.vercel.app/game'
  iframe.style.cssText = `
    width: 90%;
    height: 90%;
    border: 2px solid #8b5cf6;
    border-radius: 12px;
    box-shadow: 0 0 50px rgba(139, 92, 246, 0.5);
  `
  
  // Botón de cerrar
  const closeBtn = document.createElement('button')
  closeBtn.textContent = '✕'
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 20px;
    cursor: pointer;
  `
  closeBtn.onclick = () => modal.remove()
  
  modal.appendChild(iframe)
  modal.appendChild(closeBtn)
  document.body.appendChild(modal)
}

// Uso:
// Al comprar el producto → createWordGuessModal()
```

### 5.2 Autenticación de Usuarios

Si quieres validar que solo usuarios que compraron puedan acceder:

**En Magic By Loxhias:**

```javascript
// Generar token único al comprar
function generateGameToken(userId) {
  const token = btoa(JSON.stringify({
    userId: userId,
    productId: 'wordguess-pro',
    purchaseDate: Date.now(),
    expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 año
  }))
  
  return token
}

// Abrir juego con token
function openGameWithAuth(userToken) {
  const gameUrl = `https://wordguess-pro.vercel.app/game?token=${userToken}`
  // ... usar BrowserWindow o webview con esta URL
}
```

**En el juego (modificar `app/game/page.tsx`):**

```typescript
// Al cargar la página, validar token
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  
  if (token) {
    // Validar token (puedes guardarlo en localStorage)
    localStorage.setItem('wordguess_auth_token', token)
  }
}, [])
```

---

## 6. TESTING Y VALIDACIÓN

### 6.1 Test Local

```bash
# Instalar dependencias
npm install

# Correr en local
npm run dev

# Abrir en navegador
# http://localhost:3015
```

### 6.2 Test de Webhooks

```bash
# Test 1: Enviar intento
curl -X GET "http://localhost:3015/api/webhook/user=TestUser/try=JAVASCRIPT"

# Test 2: Revelar letra
curl -X GET "http://localhost:3015/api/webhook/user=Admin/event=reveal_letter"

# Test 3: Puntos dobles
curl -X GET "http://localhost:3015/api/webhook/user=VIP/event=double_points"
```

### 6.3 Test en Producción

Una vez deployado:

```bash
# Reemplazar URL con tu dominio
curl -X GET "https://wordguess-pro.vercel.app/api/webhook/user=TestUser/try=JAVASCRIPT"
```

### 6.4 Checklist de Validación

- [ ] El juego carga correctamente en navegador
- [ ] Los webhooks responden correctamente
- [ ] La ventana emergente se abre desde Magic By Loxhias
- [ ] Los eventos de Twitch/Discord llegan al juego
- [ ] El ranking se actualiza en tiempo real
- [ ] Las palabras personalizadas se guardan
- [ ] Los temas visuales funcionan correctamente
- [ ] El multi-idioma funciona

---

## 🎯 FLUJO COMPLETO DE INTEGRACIÓN

```
┌─────────────────────────────────────────────────────┐
│  USUARIO COMPRA EN MAGIC BY LOXHIAS                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Se genera token de acceso único                    │
│  Se guarda en base de datos de Magic By Loxhias     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Usuario hace click en "Abrir WordGuess Pro"       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Electron abre BrowserWindow con:                   │
│  https://wordguess-pro.vercel.app/game?token=XXX    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Juego valida token y permite acceso                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Usuario configura palabras y empieza a jugar      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Chat de Twitch envía comandos:                     │
│  !guess JAVASCRIPT                                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Magic By Loxhias procesa y envía webhook:         │
│  GET /api/webhook/user=viewer/try=JAVASCRIPT        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Juego procesa, actualiza UI, muestra ganador      │
│  (polling cada 2s sincroniza el estado)             │
└─────────────────────────────────────────────────────┘
```

---

## 📦 ARCHIVOS A CREAR/MODIFICAR

### Crear estos archivos:

1. `.env.local` (copiar de `.env.local.example`)
2. `middleware.ts` (para CORS)
3. `lib/magic-alerts.ts` (opcional, para webhooks de salida)

### Modificar (opcional):

1. `app/game/page.tsx` - Añadir validación de token
2. `lib/persist.ts` - Cambiar a Supabase Storage si se necesita
3. `lib/game-state.ts` - Cambiar a Supabase DB si se necesita persistencia real

---

## 🚨 PROBLEMAS COMUNES

### Error: "Supabase credentials not configured"
**Solución:** Asegúrate de tener las variables de entorno configuradas en Vercel.

### Error: "Failed to fetch" desde Magic By Loxhias
**Solución:** Verifica que CORS esté configurado correctamente (middleware.ts).

### Error: "X-Frame-Options deny"
**Solución:** Asegúrate de haber removido/modificado los headers en middleware.ts.

### El estado se pierde al refrescar
**Solución:** Implementa persistencia en Supabase Database (sección 2.1 Opción B).

---

## 📞 SOPORTE

Para dudas específicas de integración:
- Revisa WEBHOOK_GUIDE.md para detalles de webhooks
- Revisa README.md para configuración general
- Contacta al desarrollador de Magic By Loxhias

---

**¡Listo para vender tu producto! 🎮🚀**
