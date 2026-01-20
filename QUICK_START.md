# ⚡ QUICK START - WORDGUESS PRO PARA MAGIC BY LOXHIAS

Guía ultra-rápida para tener el juego funcionando en 10 minutos.

---

## 🚀 OPCIÓN 1: DEPLOY RÁPIDO (SIN CONFIGURACIÓN)

### Paso 1: Deploy en Vercel (3 minutos)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login en Vercel
vercel login

# 3. Deploy (desde la carpeta del proyecto)
cd e:\wordle2026
vercel --prod
```

**¡Listo!** Tu URL será: `https://wordle2026.vercel.app` (o similar)

### Paso 2: Probar (1 minuto)

Abre en tu navegador:
- Página principal: `https://tu-url.vercel.app`
- Juego directo: `https://tu-url.vercel.app/game`

### Paso 3: Integrar en Magic By Loxhias (5 minutos)

```javascript
// En Magic By Loxhias - crear botón
const { BrowserWindow } = require('electron')

function openWordGuess() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: { nodeIntegration: false }
  })
  
  win.loadURL('https://TU-URL.vercel.app/game')
}

// Usar: openWordGuess()
```

**✅ ¡YA FUNCIONA!** El juego está online y puede abrirse desde tu app.

---

## 🔧 OPCIÓN 2: CON SUPABASE (PARA PERSISTENCIA)

### Paso 1: Crear proyecto Supabase (2 minutos)

1. Ve a https://supabase.com
2. Crea cuenta gratis
3. Click en "New Project"
4. Espera 2 minutos a que se cree

### Paso 2: Ejecutar SQL (1 minuto)

1. En Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copia y pega todo el contenido de `supabase-setup.sql`
4. Click **Run**

### Paso 3: Copiar credenciales (1 minuto)

1. En Supabase → **Settings** → **API**
2. Copia:
   - **Project URL**
   - **anon public key**

### Paso 4: Configurar en Vercel (2 minutos)

```bash
# Añadir variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Pega tu URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Pega tu key

# Re-deploy
vercel --prod
```

**✅ ¡LISTO CON PERSISTENCIA!** Ahora los datos se guardan en Supabase.

---

## 📡 WEBHOOKS: ENVIAR DESDE TWITCH

### Código mínimo en Magic By Loxhias:

```javascript
const GAME_URL = 'https://TU-URL.vercel.app'

// Cuando alguien escribe: !guess PALABRA
async function enviarIntento(username, palabra) {
  const url = `${GAME_URL}/api/webhook/user=${username}/try=${palabra}`
  const res = await fetch(url)
  const data = await res.json()
  
  if (data.correct) {
    console.log(`${username} ganó ${data.points} puntos!`)
  }
}

// Ejemplo:
enviarIntento('loxhias', 'JAVASCRIPT')
```

---

## 🎮 COMANDOS DE TWITCH

| Comando | Webhook URL |
|---------|-------------|
| `!guess PALABRA` | `/api/webhook/user=NOMBRE/try=PALABRA` |
| Revelar letra | `/api/webhook/user=NOMBRE/event=reveal_letter` |
| Puntos dobles | `/api/webhook/user=NOMBRE/event=double_points` |
| Nueva ronda | `/api/webhook/user=NOMBRE/event=nueva_ronda` |

---

## 📝 CONFIGURAR PALABRAS

1. Abre: `https://TU-URL.vercel.app/config`
2. Sección "Word List"
3. Añade palabras y hints
4. Click "Save Changes"

---

## ❓ PROBLEMAS COMUNES

### No carga en Electron
**Solución:** Añade esto al crear BrowserWindow:
```javascript
webPreferences: {
  webSecurity: false  // Solo en desarrollo
}
```

### Webhooks no funcionan
**Solución:** Verifica que la URL esté correcta:
```javascript
console.log(`${GAME_URL}/api/webhook/user=test/try=test`)
// Abre esa URL en navegador para probar
```

### Quiero cambiar el puerto en local
**Solución:** Edita `package.json`:
```json
"scripts": {
  "dev": "cross-env PORT=3016 next dev"
}
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- **Deploy detallado:** Ver `DEPLOYMENT_GUIDE.md`
- **Integración completa:** Ver `MAGIC_BY_LOXHIAS_INTEGRATION.md`
- **Webhooks:** Ver `WEBHOOK_GUIDE.md`

---

**¿Listo en menos de 10 minutos? ¡A vender! 💰**
