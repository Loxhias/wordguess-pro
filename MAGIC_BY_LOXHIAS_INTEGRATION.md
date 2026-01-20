# 🎮 INTEGRACIÓN CON MAGIC BY LOXHIAS - GUÍA RÁPIDA

Esta guía te ayudará a integrar WordGuess Pro dentro de tu aplicación de escritorio **Magic By Loxhias**.

---

## 📦 PASO 1: DEPLOY DEL JUEGO

### Opción Recomendada: Vercel

1. **Crea una cuenta en Vercel** (si no tienes): https://vercel.com
2. **Instala Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Deploy desde la terminal:**
   ```bash
   cd e:\wordle2026
   vercel login
   vercel
   ```

4. **Configura variables de entorno en Vercel:**
   - Ve a: https://vercel.com/tu-usuario/wordguess-pro/settings/environment-variables
   - Añade:
     - `NEXT_PUBLIC_SUPABASE_URL` = Tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Tu key de Supabase

5. **Deploy a producción:**
   ```bash
   vercel --prod
   ```

Tu URL será algo como: `https://wordguess-pro-tu-usuario.vercel.app`

---

## 💻 PASO 2: INTEGRACIÓN EN ELECTRON (MAGIC BY LOXHIAS)

### Opción 1: Ventana Emergente Nativa (Recomendado)

```javascript
// En tu código de Magic By Loxhias

const { BrowserWindow } = require('electron')

// Variable global para la ventana del juego
let wordguessWindow = null
const WORDGUESS_URL = 'https://wordguess-pro-tu-usuario.vercel.app'

/**
 * Abre WordGuess Pro en una ventana independiente
 * Se llama cuando el usuario hace click en "Abrir WordGuess Pro"
 */
function openWordGuessGame() {
  // Si ya está abierta, traerla al frente
  if (wordguessWindow && !wordguessWindow.isDestroyed()) {
    wordguessWindow.focus()
    return
  }

  // Crear nueva ventana
  wordguessWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'WordGuess Pro - Magic By Loxhias',
    backgroundColor: '#0f172a', // Color de fondo mientras carga
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
    autoHideMenuBar: true, // Ocultar barra de menú
    show: false, // No mostrar hasta que cargue
  })

  // Cargar el juego (directo a la página de juego)
  wordguessWindow.loadURL(`${WORDGUESS_URL}/game`)

  // Mostrar cuando esté listo para evitar pantalla blanca
  wordguessWindow.once('ready-to-show', () => {
    wordguessWindow.show()
  })

  // Limpiar referencia al cerrar
  wordguessWindow.on('closed', () => {
    wordguessWindow = null
  })

  // Opcional: DevTools en desarrollo
  if (process.env.NODE_ENV === 'development') {
    wordguessWindow.webContents.openDevTools()
  }

  return wordguessWindow
}

/**
 * Cierra la ventana del juego
 */
function closeWordGuessGame() {
  if (wordguessWindow && !wordguessWindow.isDestroyed()) {
    wordguessWindow.close()
  }
}

// Exportar para usar en otros módulos
module.exports = {
  openWordGuessGame,
  closeWordGuessGame,
  getWordGuessWindow: () => wordguessWindow
}
```

### Opción 2: Integrado en la UI Principal

```javascript
// Si quieres embeber el juego dentro de Magic By Loxhias
// (en lugar de ventana separada)

// En tu HTML principal:
<div id="wordguess-container" class="hidden">
  <div class="wordguess-overlay">
    <button id="close-wordguess" class="close-btn">✕</button>
    <webview 
      id="wordguess-webview"
      src="https://wordguess-pro-tu-usuario.vercel.app/game"
      partition="persist:wordguess"
      allowpopups
    ></webview>
  </div>
</div>

<style>
.wordguess-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

#wordguess-webview {
  width: 90%;
  height: 90%;
  border: 2px solid #8b5cf6;
  border-radius: 12px;
  box-shadow: 0 0 50px rgba(139, 92, 246, 0.5);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10000;
}

.hidden {
  display: none !important;
}
</style>

<script>
// Abrir el juego
function showWordGuess() {
  document.getElementById('wordguess-container').classList.remove('hidden')
}

// Cerrar el juego
function hideWordGuess() {
  document.getElementById('wordguess-container').classList.add('hidden')
}

// Botón de cerrar
document.getElementById('close-wordguess').addEventListener('click', hideWordGuess)
</script>
```

---

## 🔌 PASO 3: ENVIAR EVENTOS DESDE TWITCH/DISCORD

### Sistema de Webhooks

```javascript
// En Magic By Loxhias - módulo de chat de Twitch

const WORDGUESS_URL = 'https://wordguess-pro-tu-usuario.vercel.app'

/**
 * Envía un intento de palabra desde el chat de Twitch
 * Llamar cuando alguien escribe: !guess PALABRA
 */
async function sendGuessFromTwitch(username, word) {
  // Limpiar nombre de usuario y palabra
  const cleanUser = encodeURIComponent(username.toLowerCase())
  const cleanWord = encodeURIComponent(word.toUpperCase())
  
  const url = `${WORDGUESS_URL}/api/webhook/user=${cleanUser}/try=${cleanWord}`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    // Si adivinó correctamente
    if (data.correct && data.success) {
      console.log(`✅ ${username} ganó ${data.points} puntos!`)
      
      // AQUÍ: Mostrar alerta en Magic By Loxhias
      showMagicAlert({
        type: 'winner',
        player: username,
        points: data.points,
        word: word
      })
      
      // Opcional: Enviar mensaje al chat de Twitch
      sendTwitchMessage(`🎉 ¡${username} adivinó la palabra y ganó ${data.points} puntos!`)
    } else {
      console.log(`❌ ${username} falló el intento`)
    }
    
    return data
  } catch (error) {
    console.error('Error al enviar intento:', error)
    return null
  }
}

/**
 * Eventos especiales (redención de puntos de canal, bits, suscripciones, etc)
 */
async function triggerGameEvent(username, eventType) {
  const cleanUser = encodeURIComponent(username)
  const url = `${WORDGUESS_URL}/api/webhook/user=${cleanUser}/event=${eventType}`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    console.log(`Evento ${eventType} ejecutado por ${username}`)
    return data
  } catch (error) {
    console.error('Error al ejecutar evento:', error)
    return null
  }
}

// ===== EJEMPLOS DE USO =====

// 1. Chat de Twitch - Usuario intenta adivinar
// Cuando alguien escribe: !guess JAVASCRIPT
client.on('message', (channel, tags, message, self) => {
  if (message.startsWith('!guess ')) {
    const word = message.substring(7).trim()
    sendGuessFromTwitch(tags.username, word)
  }
})

// 2. Redención de puntos de canal - Revelar letra
// Cuando alguien canjea "Revelar Letra" (100 puntos)
client.on('redemption', (redemption) => {
  if (redemption.reward.title === 'Revelar Letra') {
    triggerGameEvent(redemption.user.login, 'reveal_letter')
    sendTwitchMessage(`${redemption.user.login} reveló una letra! 👀`)
  }
})

// 3. Suscripción/Bits - Puntos dobles
// Cuando alguien se suscribe o dona bits
client.on('subscription', (channel, username) => {
  triggerGameEvent(username, 'double_points')
  sendTwitchMessage(`¡Gracias ${username}! ¡Puntos dobles activados por 30s! 🔥`)
})

// 4. Moderador - Cambiar palabra
// Comando de moderador: !nextword
client.on('message', (channel, tags, message, self) => {
  if (message === '!nextword' && tags.mod) {
    triggerGameEvent(tags.username, 'nueva_ronda')
    sendTwitchMessage('Nueva ronda iniciada por un moderador! 🎮')
  }
})
```

---

## 🎨 PASO 4: PERSONALIZACIÓN (OPCIONAL)

### Añadir Logo de Magic By Loxhias

Puedes personalizar el juego editando `app/page.tsx` y reemplazar el título:

```typescript
<h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
  Magic By Loxhias - WordGuess Pro
</h1>
```

### Cambiar Colores del Tema

Edita `lib/themes.ts` para ajustar los colores a tu marca.

---

## 🔐 PASO 5: AUTENTICACIÓN (OPCIONAL)

Si quieres que solo usuarios que compraron puedan acceder:

### En Magic By Loxhias:

```javascript
// Generar token único al vender el producto
function generateWordGuessToken(userId, purchaseId) {
  const tokenData = {
    userId: userId,
    purchaseId: purchaseId,
    productId: 'wordguess-pro',
    purchaseDate: Date.now(),
    expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 año
  }
  
  // Encriptar con tu sistema de licencias
  const token = encryptLicense(tokenData)
  
  return token
}

// Abrir juego con autenticación
function openWordGuessWithAuth(userToken) {
  const gameUrl = `${WORDGUESS_URL}/game?token=${userToken}`
  
  const gameWindow = new BrowserWindow({
    // ... configuración normal
  })
  
  gameWindow.loadURL(gameUrl)
  return gameWindow
}
```

---

## 📊 PASO 6: MONITOREO Y ANALYTICS

### Ver actividad en tiempo real

```javascript
// Consultar eventos recientes
async function getRecentGameEvents() {
  const response = await fetch(`${WORDGUESS_URL}/api/webhook/events`)
  const data = await response.json()
  return data.events // Últimos 50 eventos
}

// Consultar ranking actual
async function getCurrentRanking() {
  const response = await fetch(`${WORDGUESS_URL}/api/players`)
  const players = await response.json()
  return players // Lista ordenada por puntos
}

// Consultar estado del juego
async function getGameState() {
  const response = await fetch(`${WORDGUESS_URL}/api/game/state`)
  const state = await response.json()
  return state
}

// Ejemplo: Mostrar top 3 en overlay de OBS
setInterval(async () => {
  const ranking = await getCurrentRanking()
  const top3 = ranking.slice(0, 3)
  
  updateOBSOverlay({
    top1: top3[0]?.name || 'N/A',
    top2: top3[1]?.name || 'N/A',
    top3: top3[2]?.name || 'N/A',
  })
}, 5000) // Actualizar cada 5 segundos
```

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [ ] Deploy del juego en Vercel completado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Función `openWordGuessGame()` añadida a Magic By Loxhias
- [ ] Botón "Abrir WordGuess Pro" en la UI
- [ ] Webhooks integrados con chat de Twitch/Discord
- [ ] Sistema de redención de puntos conectado
- [ ] Probado en local y en producción
- [ ] Documentación para usuarios finales creada

---

## 🚀 EJEMPLO COMPLETO DE INTEGRACIÓN

```javascript
// ============================================
// MAGIC BY LOXHIAS - WORDGUESS PRO MODULE
// ============================================

const { BrowserWindow } = require('electron')

class WordGuessIntegration {
  constructor(config) {
    this.gameUrl = config.gameUrl || 'https://wordguess-pro.vercel.app'
    this.window = null
  }

  // Abrir juego
  open() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.focus()
      return
    }

    this.window = new BrowserWindow({
      width: 1400,
      height: 900,
      title: 'WordGuess Pro',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
      autoHideMenuBar: true,
    })

    this.window.loadURL(`${this.gameUrl}/game`)
    this.window.once('ready-to-show', () => this.window.show())
    this.window.on('closed', () => this.window = null)
  }

  // Cerrar juego
  close() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close()
    }
  }

  // Enviar intento
  async sendGuess(username, word) {
    const url = `${this.gameUrl}/api/webhook/user=${encodeURIComponent(username)}/try=${encodeURIComponent(word)}`
    const response = await fetch(url)
    return await response.json()
  }

  // Ejecutar evento
  async triggerEvent(username, eventType) {
    const url = `${this.gameUrl}/api/webhook/user=${encodeURIComponent(username)}/event=${eventType}`
    const response = await fetch(url)
    return await response.json()
  }

  // Obtener ranking
  async getRanking() {
    const response = await fetch(`${this.gameUrl}/api/players`)
    return await response.json()
  }
}

// Exportar
module.exports = WordGuessIntegration

// ===== USO EN MAGIC BY LOXHIAS =====

const WordGuess = new WordGuessIntegration({
  gameUrl: 'https://wordguess-pro.vercel.app'
})

// Botón en UI
document.getElementById('btn-open-wordguess').addEventListener('click', () => {
  WordGuess.open()
})

// Chat de Twitch
twitchClient.on('message', async (channel, tags, message) => {
  if (message.startsWith('!guess ')) {
    const word = message.substring(7).trim()
    const result = await WordGuess.sendGuess(tags.username, word)
    
    if (result.correct) {
      showAlert(`¡${tags.username} ganó ${result.points} puntos!`)
    }
  }
})
```

---

## 📞 SOPORTE

Si tienes problemas con la integración:
1. Verifica que el juego esté corriendo en Vercel
2. Revisa la consola de desarrollador en Electron
3. Asegúrate de que CORS esté habilitado (middleware.ts)
4. Contacta al soporte técnico de Magic By Loxhias

---

**¡Listo para vender tu producto integrado! 🎮💰**
