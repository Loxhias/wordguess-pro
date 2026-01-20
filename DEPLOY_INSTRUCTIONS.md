# 📦 INSTRUCCIONES DE DEPLOY - PASO A PASO

Esta guía te llevará desde el código actual hasta tener el juego funcionando en Cloudflare Pages.

---

## ✅ PASO 1: PREPARAR REPOSITORIO EN GITHUB

### 1.1 Inicializar Git (si no está inicializado)

```bash
git init
git branch -M main
```

### 1.2 Agregar archivos al staging

```bash
git add .
```

### 1.3 Hacer commit

```bash
git commit -m "feat: SPA version ready for Cloudflare Pages"
```

### 1.4 Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com/new)
2. Nombre del repositorio: `wordguess-pro`
3. Descripción: "Word guessing game - SPA edition"
4. Público o Privado (tu elección)
5. **NO** marcar "Initialize with README" (ya lo tienes)
6. Click **Create repository**

### 1.5 Conectar con GitHub

```bash
# Reemplaza TU-USUARIO con tu username de GitHub
git remote add origin https://github.com/TU-USUARIO/wordguess-pro.git
git push -u origin main
```

---

## ☁️ PASO 2: DEPLOY EN CLOUDFLARE PAGES

### Opción A: Deploy desde GitHub (Recomendado)

#### 2.1 Ir a Cloudflare Dashboard

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Si no tienes cuenta, créala (es gratis)
3. Click en **Pages** en el menú lateral

#### 2.2 Crear Proyecto

1. Click en **Create a project**
2. Click en **Connect to Git**
3. Autoriza Cloudflare a acceder a tu GitHub
4. Selecciona el repositorio `wordguess-pro`

#### 2.3 Configurar Build

```yaml
Framework preset: Next.js
Build command: npm run build
Build output directory: out
Root directory: (dejar vacío)
```

#### 2.4 Variables de Entorno

**No necesitas ninguna** - Déjalas vacías.

#### 2.5 Deploy

1. Click **Save and Deploy**
2. Espera 2-3 minutos
3. ¡Listo! Tu URL será: `https://wordguess-pro-XXX.pages.dev`

### Opción B: Deploy con Wrangler CLI

#### 2.1 Instalar Wrangler

```bash
npm install -g wrangler
```

#### 2.2 Login en Cloudflare

```bash
wrangler login
```

Se abrirá tu navegador para autorizar.

#### 2.3 Build

```bash
npm run build
```

Verifica que se creó la carpeta `out/`.

#### 2.4 Deploy

```bash
wrangler pages deploy out --project-name=wordguess-pro
```

Tu URL será: `https://wordguess-pro.pages.dev`

---

## 🎮 PASO 3: CONFIGURAR DOMINIO PERSONALIZADO (OPCIONAL)

### 3.1 En Cloudflare Pages

1. Ve a tu proyecto en Pages
2. Click en **Custom domains**
3. Click **Set up a custom domain**
4. Ingresa tu dominio: `wordguess.tu-dominio.com`
5. Sigue las instrucciones para configurar DNS

### 3.2 DNS Records

Si tu dominio está en Cloudflare:
- Se configurará automáticamente

Si tu dominio está en otro proveedor:
- Añade un CNAME record apuntando a `wordguess-pro.pages.dev`

---

## 🔗 PASO 4: INTEGRAR CON MAGIC BY LOXHIAS

### 4.1 URL Final

Una vez deployado, tu URL será algo como:

```
https://wordguess-pro-abc123.pages.dev
```

### 4.2 URL con Webhook

Para integrar con Magic By Loxhias:

```
https://wordguess-pro-abc123.pages.dev/game?webhook=https://TU-WEBHOOK-URL
```

### 4.3 Código en Electron

```javascript
const { BrowserWindow } = require('electron')

const GAME_URL = 'https://wordguess-pro-abc123.pages.dev'
const WEBHOOK_URL = 'http://localhost:3000/magic-alerts'

function openWordGuess() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'WordGuess Pro',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  })
  
  const gameUrlWithWebhook = `${GAME_URL}/game?webhook=${encodeURIComponent(WEBHOOK_URL)}`
  win.loadURL(gameUrlWithWebhook)
  
  return win
}

// Exportar
module.exports = { openWordGuess }
```

---

## 🧪 PASO 5: TESTING

### 5.1 Test Básico

Abre la URL en tu navegador:
```
https://wordguess-pro-abc123.pages.dev
```

Verifica:
- ✅ Página principal carga
- ✅ Click en "Game" funciona
- ✅ Click en "Configuration" funciona

### 5.2 Test de Juego

1. Ve a `/game`
2. Click "Start New Round"
3. Verifica que el timer cuenta
4. Verifica que se revelan letras automáticamente
5. Click "Reveal" manualmente
6. Verifica que funciona

### 5.3 Test de Configuración

1. Ve a `/config`
2. Añade una palabra personalizada
3. Click "Save Changes"
4. Vuelve a `/game`
5. Inicia nueva ronda
6. Verifica que puede salir tu palabra

### 5.4 Test de Webhook

1. Ve a [webhook.site](https://webhook.site)
2. Copia tu URL única (ej: `https://webhook.site/abc-123`)
3. Abre el juego con:
   ```
   https://wordguess-pro-abc123.pages.dev/game?webhook=https://webhook.site/abc-123
   ```
4. Juega una ronda
5. Verifica en webhook.site que llegaron los eventos

---

## 📊 PASO 6: MONITOREO

### 6.1 Analytics de Cloudflare

1. Ve a tu proyecto en Cloudflare Pages
2. Click en **Analytics**
3. Verás:
   - Requests por día
   - Bandwidth usado
   - Países de origen
   - Errores (si hay)

### 6.2 Logs

Para ver errores en producción:
1. Abre DevTools en tu navegador (F12)
2. Ve a la pestaña **Console**
3. Busca errores en rojo

---

## 🔄 PASO 7: ACTUALIZACIONES FUTURAS

### 7.1 Hacer cambios en el código

```bash
# Edita los archivos que necesites
# Por ejemplo: agregar más palabras en lib/words.ts

git add .
git commit -m "feat: agregar más palabras"
git push origin main
```

### 7.2 Auto-Deploy

Cloudflare Pages detectará el push y:
1. Hará build automáticamente
2. Deployará la nueva versión
3. Te notificará por email

¡No necesitas hacer nada más!

---

## 🎯 CHECKLIST FINAL

Antes de compartir con clientes:

- [ ] Build funciona sin errores
- [ ] Deploy en Cloudflare completado
- [ ] URL de producción funciona
- [ ] Juego funciona correctamente
- [ ] Palabras se pueden agregar/editar
- [ ] Temas visuales funcionan
- [ ] Webhooks se envían correctamente (test con webhook.site)
- [ ] LocalStorage guarda datos
- [ ] README.md actualizado con tu URL
- [ ] Documentación para usuarios creada

---

## 💰 COSTO

**Total: $0/mes**

Cloudflare Pages incluye:
- ✅ 500 builds por mes
- ✅ Bandwidth ilimitado
- ✅ SSL gratis
- ✅ CDN global
- ✅ Rollbacks automáticos
- ✅ Preview deployments

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Build failed"

```bash
# Limpiar todo
rm -rf .next out node_modules

# Reinstalar
npm install

# Build nuevamente
npm run build
```

### Error: "404 Not Found" en rutas

Verifica que existe el archivo `public/_redirects`.

### Webhooks no llegan

1. Verifica que la URL tenga `?webhook=`
2. Abre DevTools → Console
3. Busca errores de CORS o fetch

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs en Cloudflare Pages
2. Abre DevTools en el navegador
3. Busca errores en la consola
4. Verifica que `npm run build` funcione localmente

---

## 🎉 ¡LISTO!

Tu juego está en producción en:
```
https://wordguess-pro.pages.dev
```

Comparte esta URL con tus clientes agregando el parámetro `?webhook=`:
```
https://wordguess-pro.pages.dev/game?webhook=https://tu-servidor/webhook
```

**¡Éxito con las ventas! 🚀💰**
