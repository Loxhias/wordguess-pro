/**
 * WordGuess Integration para Magic By Loxhias
 * 
 * COPIAR ESTE ARCHIVO A TU PROYECTO MAGIC BY LOXHIAS
 * 
 * Uso:
 * 1. const game = new WordGuessIntegration();
 * 2. game.open();
 * 3. game.revealLetter();
 * 4. game.guess('Username', 'PERRO');
 */

class WordGuessIntegration {
  constructor(gameUrl = 'https://wordguess-prov2.pages.dev') {
    this.gameWindow = null;
    this.gameUrl = gameUrl;
    this.isReady = false;
    
    // Escuchar respuestas del juego (opcional)
    window.addEventListener('message', (event) => {
      if (event.data.type === 'GAME_RESPONSE') {
        console.log('[WordGuess] Response:', event.data);
        this.handleGameResponse(event.data);
      }
    });
  }

  /**
   * Abre el juego en una nueva ventana
   * @returns {boolean} true si se abrió correctamente
   */
  open() {
    if (this.gameWindow && !this.gameWindow.closed) {
      console.log('[WordGuess] Game is already open, focusing...');
      this.gameWindow.focus();
      return true;
    }

    console.log('[WordGuess] Opening game...');
    this.gameWindow = window.open(
      this.gameUrl,
      'WordGuessGame',
      'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no'
    );

    if (this.gameWindow) {
      console.log('[WordGuess] ✅ Game opened successfully');
      
      // Esperar a que cargue (2 segundos)
      setTimeout(() => {
        this.isReady = true;
        console.log('[WordGuess] ✅ Game is ready');
      }, 2000);
      
      return true;
    } else {
      console.error('[WordGuess] ❌ Failed to open game. Check popup blocker.');
      return false;
    }
  }

  /**
   * Envía un comando al juego
   * @private
   */
  send(action, data = {}) {
    if (!this.gameWindow || this.gameWindow.closed) {
      console.error('[WordGuess] ❌ Game window is closed. Call open() first.');
      return false;
    }

    if (!this.isReady) {
      console.warn('[WordGuess] ⚠️ Game might not be ready yet. Wait 2 seconds after open().');
    }

    const message = {
      type: 'GAME_ACTION',
      action: action,
      data: data,
      timestamp: Date.now()
    };

    try {
      this.gameWindow.postMessage(message, '*');
      console.log('[WordGuess] 📤 Sent:', action, data);
      return true;
    } catch (error) {
      console.error('[WordGuess] ❌ Error sending message:', error);
      return false;
    }
  }

  /**
   * Revela una letra aleatoria
   */
  revealLetter() {
    console.log('[WordGuess] 👁️ Revealing letter...');
    return this.send('reveal_letter');
  }

  /**
   * Inicia una nueva ronda con palabra aleatoria
   */
  newRound() {
    console.log('[WordGuess] 🎮 Starting new round...');
    return this.send('nueva_ronda');
  }

  /**
   * Activa puntos dobles
   * @param {number} duration - Duración en segundos (default: 30)
   */
  doublePoints(duration = 30) {
    console.log('[WordGuess] 🔥 Activating double points for', duration, 'seconds');
    return this.send('double_points', { duration });
  }

  /**
   * Procesa un intento de adivinanza
   * @param {string} username - Nombre del usuario que adivina
   * @param {string} word - Palabra a adivinar
   */
  guess(username, word) {
    console.log('[WordGuess] 💬 Guess from', username, ':', word);
    return this.send('guess', { 
      user: username.trim(), 
      word: word.toUpperCase().trim() 
    });
  }

  /**
   * Cierra la ventana del juego
   */
  close() {
    if (this.gameWindow && !this.gameWindow.closed) {
      this.gameWindow.close();
      this.gameWindow = null;
      this.isReady = false;
      console.log('[WordGuess] ❌ Game closed');
      return true;
    }
    return false;
  }

  /**
   * Verifica si el juego está abierto
   * @returns {boolean}
   */
  isOpen() {
    return this.gameWindow && !this.gameWindow.closed;
  }

  /**
   * Maneja respuestas del juego (opcional)
   * @private
   */
  handleGameResponse(data) {
    // Aquí puedes manejar eventos que el juego envíe de vuelta
    // Por ejemplo: round_started, round_ended, correct_guess, etc.
    switch (data.event) {
      case 'round_started':
        console.log('[WordGuess] 🎮 Round started:', data.word);
        break;
      case 'correct_guess':
        console.log('[WordGuess] ✅ Correct guess by', data.user);
        break;
      case 'round_ended':
        console.log('[WordGuess] 🏁 Round ended');
        break;
    }
  }
}

// ============================================
// EJEMPLO DE USO
// ============================================

// 1. Crear instancia
const wordGuess = new WordGuessIntegration('https://tu-proyecto.pages.dev/game');

// 2. Abrir el juego
wordGuess.open();

// 3. Esperar 2 segundos y comenzar a usar
setTimeout(() => {
  // Iniciar nueva ronda
  wordGuess.newRound();
  
  // Después de 3 segundos, revelar una letra
  setTimeout(() => {
    wordGuess.revealLetter();
  }, 3000);
  
  // Después de 5 segundos, simular un viewer adivinando
  setTimeout(() => {
    wordGuess.guess('Viewer123', 'PERRO');
  }, 5000);
}, 2000);

// ============================================
// INTEGRACIÓN CON BOTONES
// ============================================

/*
// En tu HTML:
<button onclick="openGame()">🎮 Abrir Juego</button>
<button onclick="newRound()">🔄 Nueva Ronda</button>
<button onclick="revealLetter()">👁️ Revelar Letra</button>
<button onclick="activateDoublePoints()">🔥 Puntos x2</button>
<button onclick="closeGame()">❌ Cerrar</button>

<input id="username" placeholder="Usuario" />
<input id="word" placeholder="Palabra" />
<button onclick="submitGuess()">💬 Adivinar</button>

// En tu JavaScript:
function openGame() {
  wordGuess.open();
}

function newRound() {
  if (wordGuess.isOpen()) {
    wordGuess.newRound();
  } else {
    alert('Abre el juego primero');
  }
}

function revealLetter() {
  wordGuess.revealLetter();
}

function activateDoublePoints() {
  wordGuess.doublePoints(30);
}

function submitGuess() {
  const username = document.getElementById('username').value;
  const word = document.getElementById('word').value;
  
  if (username && word) {
    wordGuess.guess(username, word);
  } else {
    alert('Completa usuario y palabra');
  }
}

function closeGame() {
  wordGuess.close();
}
*/

// ============================================
// INTEGRACIÓN CON TWITCH CHAT
// ============================================

/*
// Ejemplo: Integrar con comandos de chat de Twitch
function onTwitchChatMessage(username, message) {
  // Verificar que el juego esté abierto
  if (!wordGuess.isOpen()) {
    return;
  }

  // Comandos disponibles
  if (message.startsWith('!reveal')) {
    wordGuess.revealLetter();
  } else if (message.startsWith('!2x') || message.startsWith('!double')) {
    wordGuess.doublePoints(30);
  } else if (message.startsWith('!new') || message.startsWith('!round')) {
    wordGuess.newRound();
  } else if (message.startsWith('!guess ')) {
    const word = message.substring(7).trim();
    wordGuess.guess(username, word);
  }
}

// Llamar cuando llegue un mensaje del chat:
// onTwitchChatMessage('Viewer123', '!guess PERRO');
*/

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WordGuessIntegration;
}
