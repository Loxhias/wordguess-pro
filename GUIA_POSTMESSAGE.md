# 🚀 GUÍA COMPLETA: postMessage para Magic By Loxhias

## 🎯 **¿Qué es postMessage?**

Es una API del navegador que permite que **dos ventanas/tabs se comuniquen entre sí** de forma segura.

- **Magic By Loxhias** (ventana padre) → Envía comandos
- **WordGuess Game** (ventana hija) → Recibe y ejecuta comandos

---

## ✅ **VENTAJAS**

- ✅ **Sin servidor** → No necesitas Cloudflare Functions ni KV
- ✅ **Sin costos** → 100% gratis
- ✅ **Instantáneo** → Sin delay
- ✅ **Offline** → Funciona sin internet
- ✅ **Bidireccional** → Puedes recibir respuestas del juego

---

## 📝 **IMPLEMENTACIÓN EN MAGIC BY LOXHIAS**

### **1. Clase de Integración (Recomendado)**

Crea un archivo `wordguess-integration.js` en tu app:

```javascript
class WordGuessIntegration {
  constructor() {
    this.gameWindow = null;
    this.gameUrl = 'https://tu-proyecto.pages.dev/game';
  }

  /**
   * Abre el juego en una nueva ventana
   */
  open() {
    if (this.gameWindow && !this.gameWindow.closed) {
      this.gameWindow.focus();
      return;
    }

    this.gameWindow = window.open(
      this.gameUrl,
      'WordGuessGame',
      'width=1200,height=800,menubar=no,toolbar=no,location=no'
    );

    if (this.gameWindow) {
      console.log('[WordGuess] Game opened successfully');
    } else {
      console.error('[WordGuess] Failed to open game. Check popup blocker.');
    }
  }

  /**
   * Envía un mensaje al juego
   */
  send(action, data = {}) {
    if (!this.gameWindow || this.gameWindow.closed) {
      console.error('[WordGuess] Game window is closed. Open it first.');
      return false;
    }

    const message = {
      type: 'GAME_ACTION',
      action: action,
      data: data,
      timestamp: Date.now()
    };

    try {
      this.gameWindow.postMessage(message, '*');
      console.log('[WordGuess] Sent:', action, data);
      return true;
    } catch (error) {
      console.error('[WordGuess] Error sending message:', error);
      return false;
    }
  }

  /**
   * Revela una letra aleatoria
   */
  revealLetter() {
    return this.send('reveal_letter');
  }

  /**
   * Inicia una nueva ronda
   */
  newRound() {
    return this.send('nueva_ronda');
  }

  /**
   * Activa puntos dobles
   * @param {number} duration - Duración en segundos (default: 30)
   */
  doublePoints(duration = 30) {
    return this.send('double_points', { duration });
  }

  /**
   * Procesa un intento de adivinanza
   * @param {string} username - Nombre del usuario
   * @param {string} word - Palabra a adivinar
   */
  guess(username, word) {
    return this.send('guess', { user: username, word: word });
  }

  /**
   * Cierra el juego
   */
  close() {
    if (this.gameWindow && !this.gameWindow.closed) {
      this.gameWindow.close();
      this.gameWindow = null;
      console.log('[WordGuess] Game closed');
    }
  }

  /**
   * Verifica si el juego está abierto
   */
  isOpen() {
    return this.gameWindow && !this.gameWindow.closed;
  }
}

// Crear instancia global
const wordGuess = new WordGuessIntegration();

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WordGuessIntegration;
}
```

---

### **2. Uso Básico**

```javascript
// Abrir el juego
wordGuess.open();

// Esperar a que cargue (1-2 segundos)
setTimeout(() => {
  // Iniciar nueva ronda
  wordGuess.newRound();
}, 2000);

// Revelar letra (desde botón o comando de chat)
wordGuess.revealLetter();

// Puntos dobles por 30 segundos
wordGuess.doublePoints(30);

// Un viewer adivina
wordGuess.guess('Viewer123', 'PERRO');

// Cerrar el juego
wordGuess.close();
```

---

### **3. Integración con Chat de Twitch (Ejemplo)**

```javascript
// Cuando recibes un comando del chat
function onChatCommand(username, command, args) {
  // Verificar que el juego esté abierto
  if (!wordGuess.isOpen()) {
    console.log('Game is not open');
    return;
  }

  switch (command) {
    case '!reveal':
      wordGuess.revealLetter();
      break;

    case '!2x':
      wordGuess.doublePoints(30);
      break;

    case '!guess':
      const word = args[0];
      if (word) {
        wordGuess.guess(username, word);
      }
      break;

    case '!newround':
      wordGuess.newRound();
      break;
  }
}

// Ejemplo de uso
onChatCommand('Viewer123', '!guess', ['PERRO']);
// → Envía: { type: 'GAME_ACTION', action: 'guess', data: { user: 'Viewer123', word: 'PERRO' } }
```

---

### **4. Integración con Botones de UI**

```html
<!-- En tu HTML de Magic By Loxhias -->
<div class="wordguess-controls">
  <button onclick="wordGuess.open()">🎮 Abrir Juego</button>
  <button onclick="wordGuess.newRound()">🔄 Nueva Ronda</button>
  <button onclick="wordGuess.revealLetter()">👁️ Revelar Letra</button>
  <button onclick="wordGuess.doublePoints(30)">🔥 Puntos x2</button>
  <button onclick="wordGuess.close()">❌ Cerrar</button>
</div>

<div class="wordguess-guess">
  <input id="username" placeholder="Usuario" />
  <input id="word" placeholder="Palabra" />
  <button onclick="submitGuess()">💬 Adivinar</button>
</div>

<script>
  function submitGuess() {
    const username = document.getElementById('username').value;
    const word = document.getElementById('word').value;
    
    if (username && word) {
      wordGuess.guess(username, word);
    }
  }
</script>
```

---

## 🔍 **DEBUGGING**

### **1. Verificar que el Juego Recibe Mensajes**

Abre el juego en Cloudflare y abre la consola (F12). Deberías ver:

```
[PostMessage] 🎧 Listening for messages from Magic By Loxhias...
```

### **2. Enviar Mensaje de Prueba Manualmente**

Desde la consola de **Magic By Loxhias**:

```javascript
// Abrir el juego
const game = window.open('https://tu-proyecto.pages.dev/game', 'test', 'width=1200,height=800');

// Esperar 2 segundos y enviar mensaje
setTimeout(() => {
  game.postMessage({
    type: 'GAME_ACTION',
    action: 'nueva_ronda',
    timestamp: Date.now()
  }, '*');
}, 2000);
```

### **3. Verificar en la Consola del Juego**

Deberías ver:

```
[PostMessage] 📨 Received: nueva_ronda undefined
[PostMessage] 🎮 Starting new round...
[Game] Starting new round: PERRO
```

---

## 🔒 **SEGURIDAD (Producción)**

En el archivo `hooks/use-post-message.ts`, hay una línea comentada:

```typescript
// if (event.origin !== 'https://magic-by-loxhias.com') return
```

**En producción**, descomenta esta línea y reemplaza con tu dominio:

```typescript
if (event.origin !== 'https://tu-dominio-magic.com') return
```

Esto evita que otras páginas envíen comandos falsos al juego.

---

## 🧪 **TESTS**

### **Test 1: Abrir el Juego**

```javascript
wordGuess.open();
// ✅ Se abre una ventana con el juego
```

### **Test 2: Revelar Letra**

```javascript
// 1. Abrir juego
wordGuess.open();

// 2. Esperar 2s (para que cargue)
setTimeout(() => {
  // 3. Iniciar ronda
  wordGuess.newRound();
  
  // 4. Esperar 1s
  setTimeout(() => {
    // 5. Revelar letra
    wordGuess.revealLetter();
    // ✅ En el juego se debe revelar una letra
  }, 1000);
}, 2000);
```

### **Test 3: Adivinar Palabra**

```javascript
// Suponiendo que la palabra es "PERRO"
wordGuess.open();
setTimeout(() => {
  wordGuess.newRound();
  setTimeout(() => {
    wordGuess.guess('TestUser', 'PERRO');
    // ✅ El juego debe terminar la ronda con TestUser como ganador
  }, 1000);
}, 2000);
```

---

## 📊 **FLUJO COMPLETO**

```
┌──────────────────────────────────────────────┐
│  MAGIC BY LOXHIAS (App de Escritorio)       │
│                                              │
│  1. Usuario hace clic en "Abrir Juego"      │
│     → wordGuess.open()                       │
│                                              │
│  2. Se abre ventana del navegador           │
│     → window.open(...)                       │
│     → Guarda referencia: gameWindow          │
│                                              │
│  3. Viewer escribe !reveal en chat          │
│     → wordGuess.revealLetter()               │
│                                              │
│  4. Envía mensaje a la ventana del juego    │
│     → gameWindow.postMessage({               │
│         type: 'GAME_ACTION',                 │
│         action: 'reveal_letter'              │
│       }, '*')                                │
└──────────────────────────────────────────────┘
                    │
                    │ postMessage
                    ▼
┌──────────────────────────────────────────────┐
│  WORDGUESS GAME (Ventana del Navegador)     │
│                                              │
│  1. Hook usePostMessage escucha              │
│     → window.addEventListener('message')     │
│                                              │
│  2. Recibe mensaje                           │
│     → handleMessage(event)                   │
│                                              │
│  3. Verifica tipo y acción                   │
│     → if (type === 'GAME_ACTION')            │
│     → if (action === 'reveal_letter')        │
│                                              │
│  4. Ejecuta callback                         │
│     → onRevealLetter()                       │
│                                              │
│  5. Revela letra en el juego                 │
│     → revealRandomLetter()                   │
│                                              │
│  6. UI se actualiza ✨                       │
└──────────────────────────────────────────────┘
```

---

## 🎯 **RESUMEN**

### **En Magic By Loxhias**:
1. Copiar `wordguess-integration.js`
2. Usar `wordGuess.open()` para abrir
3. Usar `wordGuess.revealLetter()`, `wordGuess.guess()`, etc.

### **En el Juego (WordGuess)**:
- ✅ Ya está implementado
- ✅ Hook `usePostMessage` ya integrado en `GameContext`
- ✅ Escucha automáticamente mensajes de Magic By Loxhias

### **Sin Configuración Adicional**:
- ❌ No necesitas Cloudflare KV
- ❌ No necesitas Cloudflare Functions
- ❌ No necesitas servidor backend

**¡Solo abrir el juego y enviar mensajes!** 🚀

---

## 📚 **COMANDOS DISPONIBLES**

| Comando | Acción | Ejemplo |
|---------|--------|---------|
| `wordGuess.open()` | Abre el juego | `wordGuess.open()` |
| `wordGuess.newRound()` | Inicia nueva ronda | `wordGuess.newRound()` |
| `wordGuess.revealLetter()` | Revela letra | `wordGuess.revealLetter()` |
| `wordGuess.doublePoints(30)` | Activa x2 puntos | `wordGuess.doublePoints(30)` |
| `wordGuess.guess(user, word)` | Adivina palabra | `wordGuess.guess('User', 'PERRO')` |
| `wordGuess.close()` | Cierra el juego | `wordGuess.close()` |
| `wordGuess.isOpen()` | Verifica si está abierto | `if (wordGuess.isOpen()) {...}` |

---

## 🎉 **¡LISTO!**

Ahora Magic By Loxhias puede controlar el juego directamente con **postMessage**, sin necesidad de servidor intermedio.

**Próximo paso**: Copiar `wordguess-integration.js` a tu app Magic By Loxhias y probar.
