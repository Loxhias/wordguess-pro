# 🎮 WordGuess Pro - SPA Edition

Una Single Page Application (SPA) completamente estática del juego de adivinanza de palabras, lista para Cloudflare Pages.

## ✨ Características

- 🎯 **100% Client-Side** - Sin servidor necesario
- 💾 **LocalStorage** - Datos persisten en el navegador
- 📡 **Webhooks** - Integración con Magic By Loxhias
- 🎨 **10 Temas Visuales** - Con animaciones únicas
- 🌍 **5 Idiomas** - EN, ES, IT, FR, PT
- 🔤 **48+ Palabras** - Más palabras personalizables
- 🏆 **Ranking** - Sistema de puntos en tiempo real

## 🚀 Deploy Rápido

### Opción 1: Cloudflare Pages (Recomendado)

1. **Fork/Clone este repositorio**
2. **Conecta con Cloudflare Pages:**
   - Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Pages → Create a project → Connect to Git
   - Selecciona este repositorio
   - Configuración:
     - Build command: `npm run build`
     - Build output directory: `out`
   - Deploy!

### Opción 2: Wrangler CLI

```bash
# Instalar Wrangler
npm install -g wrangler

# Login
wrangler login

# Build y Deploy
npm run build
wrangler pages deploy out --project-name=wordguess-pro
```

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Servir build localmente
npx serve out
```

## 🔗 Integración con Magic By Loxhias

### URL con Webhook

```
https://tu-dominio.pages.dev/game?webhook=https://tu-webhook-url/endpoint
```

### Desde Electron

```javascript
const { BrowserWindow } = require('electron')

const GAME_URL = 'https://wordguess-pro.pages.dev'
const WEBHOOK_URL = 'http://localhost:3000/webhook'

function openWordGuess() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  })
  
  win.loadURL(`${GAME_URL}/game?webhook=${encodeURIComponent(WEBHOOK_URL)}`)
}
```

### Eventos Webhook

El juego envía automáticamente estos eventos:

- `GAME_WIN` - Jugador adivina correctamente
- `ROUND_END` - Tiempo agotado
- `LETTER_REVEALED` - Letra revelada
- `ROUND_START` - Nueva ronda
- `DOUBLE_POINTS` - Puntos dobles activados
- `TIMER_WARNING` - 10 segundos restantes

**Formato del payload:**

```json
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

## 📁 Estructura

```
wordguess-pro/
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Home
│   ├── game/              # Juego principal
│   └── config/            # Configuración
├── context/               # React Context (estado global)
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades
│   └── words.ts          # Banco de palabras
├── components/            # Componentes React
└── out/                   # Build estático (generado)
```

## 💾 Persistencia de Datos

Todos los datos se guardan en **LocalStorage**:

- ✅ Ranking de jugadores
- ✅ Configuración del juego
- ✅ Palabras personalizadas
- ✅ Tema seleccionado
- ✅ Idioma

**No hay base de datos** - Todo funciona offline.

## 🎨 Personalización

### Palabras

1. Ir a `/config`
2. Añadir palabras en "Word List"
3. Click "Save Changes"

### Temas

10 temas disponibles:
- Cyberpunk
- Neon Nights
- Matrix
- Retro Wave
- Galaxy
- Ocean Deep
- Sunset Blaze
- Forest Mystic
- Minimal White
- Pure Dark

### Configuración

- **Duración de ronda**: Default 180s
- **Intervalo de revelación**: Default 15s
- **Duración puntos dobles**: Default 30s

## 📊 Tech Stack

- **Framework**: Next.js 16 (Static Export)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State**: React Context + LocalStorage
- **Deployment**: Cloudflare Pages

## 📝 Documentación

- [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) - Guía completa de deployment
- [REFACTORIZACIÓN_COMPLETADA.md](./REFACTORIZACIÓN_COMPLETADA.md) - Cambios técnicos

## 🐛 Troubleshooting

### Build falla

```bash
rm -rf .next out node_modules
npm install
npm run build
```

### Webhooks no funcionan

Verifica que la URL tenga el parámetro `?webhook=`:
```
https://tu-dominio.pages.dev/game?webhook=https://tu-url
```

### Datos no persisten

Los datos se guardan en LocalStorage. Verifica que no haya extensiones bloqueando el almacenamiento.

## 📄 Licencia

MIT

## 🤝 Soporte

Para problemas o preguntas, abre un issue en GitHub.

---

**🎮 ¡Listo para jugar!**

Demo: [https://wordguess-pro.pages.dev](https://wordguess-pro.pages.dev)
