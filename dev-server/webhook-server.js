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

// Limpiar eventos viejos (TTL simulado: 60 segundos)
setInterval(() => {
  const now = Date.now();
  Object.keys(storage.events).forEach(key => {
    if (now - storage.events[key].timestamp > 60000) {
      delete storage.events[key];
      console.log('🗑️  [LOCAL] Evento expirado:', key);
    }
  });
  Object.keys(storage.guesses).forEach(key => {
    if (now - storage.guesses[key].timestamp > 60000) {
      delete storage.guesses[key];
      console.log('🗑️  [LOCAL] Intento expirado:', key);
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
      required: ['user', 'event'],
      example: '/api/event?user=TestUser&event=reveal_letter'
    });
  }

  const validEvents = ['reveal_letter', 'double_points', 'nueva_ronda'];
  if (!validEvents.includes(event)) {
    return res.status(400).json({
      error: 'Invalid event',
      valid: validEvents,
      received: event
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
  
  console.log('📥 [LOCAL] Webhook recibido:', {
    session,
    user: eventData.user,
    event: eventData.event,
    id: eventId
  });
  
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
      required: ['user', 'word'],
      example: '/api/guess?user=TestUser&word=PERRO'
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
  
  console.log('📥 [LOCAL] Intento recibido:', {
    session,
    user: guessData.user,
    word: guessData.word,
    id: guessId
  });
  
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
      session,
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
      error: 'Missing key parameter',
      example: '{ "key": "event-123456789-abc" }'
    });
  }

  if (storage.events[key]) {
    delete storage.events[key];
    console.log('✅ [LOCAL] Evento procesado y eliminado:', key);
  } else if (storage.guesses[key]) {
    delete storage.guesses[key];
    console.log('✅ [LOCAL] Intento procesado y eliminado:', key);
  }
  
  res.json({ 
    success: true,
    message: 'Marked as processed',
    key
  });
});

// Endpoint de debug
app.get('/api/debug', (req, res) => {
  res.json({
    totalEvents: Object.keys(storage.events).length,
    totalGuesses: Object.keys(storage.guesses).length,
    events: storage.events,
    guesses: storage.guesses
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

const PORT = process.env.WEBHOOK_PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  🏠 Servidor de Webhooks LOCAL            ║
╠═══════════════════════════════════════════╣
║  Puerto: http://localhost:${PORT}         ║
║  Estado: ✅ ACTIVO                        ║
╠═══════════════════════════════════════════╣
║  Endpoints disponibles:                   ║
║  • GET  /api/event?user=X&event=Y         ║
║  • GET  /api/guess?user=X&word=Y          ║
║  • GET  /api/pending?session=X            ║
║  • POST /api/mark-processed               ║
║  • GET  /api/debug (ver storage)          ║
║  • GET  /health (health check)            ║
╠═══════════════════════════════════════════╣
║  📝 Los eventos se guardan en memoria     ║
║  ⏰ TTL: 60 segundos (auto-limpieza)      ║
║  🔄 Polling del frontend cada 1 segundo   ║
╠═══════════════════════════════════════════╣
║  💡 Test rápido:                          ║
║  curl http://localhost:${PORT}/health     ║
╚═══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 [LOCAL] Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 [LOCAL] Cerrando servidor...');
  process.exit(0);
});
