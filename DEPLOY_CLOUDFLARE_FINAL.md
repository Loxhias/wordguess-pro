# 🚀 Guía de Deploy en Cloudflare Pages

## 📦 Pre-requisitos

- Cuenta en [Cloudflare](https://cloudflare.com)
- Repositorio Git (GitHub, GitLab, etc.) con el proyecto
- Node.js y npm instalados localmente

---

## 🛠️ Paso 1: Build Local

```bash
# Instalar dependencias
npm install

# Verificar que el build funcione
npm run build

# ✅ Debe generar la carpeta 'out/' sin errores
```

---

## ☁️ Paso 2: Conectar a Cloudflare Pages

### 2.1 Crear Proyecto
1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. `Workers & Pages` → `Create Application` → `Pages` → `Connect to Git`
3. Autoriza acceso a tu repositorio
4. Selecciona el repositorio del proyecto

### 2.2 Configurar Build
```
Framework preset:      Next.js (Static HTML Export)
Build command:         npm run build
Build output directory: out
Root directory:        /
```

### 2.3 Variables de Entorno (Opcional)
```
NODE_VERSION=18
```

---

## 🗄️ Paso 3: Crear KV Namespace

Las Cloudflare Functions usan **KV** (Key-Value Storage) para almacenar webhooks temporalmente.

### 3.1 Crear KV
1. `Workers & Pages` → `KV`
2. `Create Namespace`
3. Name: `GAME_KV`
4. `Add`

### 3.2 Vincular KV al Proyecto
1. Ve a tu proyecto en `Workers & Pages`
2. `Settings` → `Functions` → `KV Namespace Bindings`
3. `Add binding`:
   - **Variable name**: `GAME_KV`
   - **KV namespace**: `GAME_KV` (selecciona el creado)
4. `Save`

> ⚠️ **Importante**: Sin este paso, los webhooks entrantes NO funcionarán.

---

## 🚀 Paso 4: Deploy

### 4.1 Deploy Automático (Recomendado)
```bash
# Hacer commit y push
git add .
git commit -m "Deploy to Cloudflare"
git push origin main

# Cloudflare detectará el push y construirá automáticamente
```

### 4.2 Deploy Manual
```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Autenticar
wrangler login

# Deploy
npm run build
wrangler pages publish out --project-name=tu-proyecto
```

---

## ✅ Paso 5: Verificar Deploy

### 5.1 Acceder al Sitio
```
https://tu-proyecto.pages.dev
```

### 5.2 Probar Webhooks Entrantes
```bash
# Adivinar palabra (debe retornar JSON)
curl "https://tu-proyecto.pages.dev/api/guess?user=Test&word=HOLA"

# Revelar letra
curl "https://tu-proyecto.pages.dev/api/event?user=Test&event=reveal_letter"
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Guess received",
  "data": { ... }
}
```

### 5.3 Verificar Functions
1. `Workers & Pages` → `[Tu Proyecto]` → `Functions`
2. Deberías ver:
   - `/api/guess`
   - `/api/event`
   - `/api/pending`
   - `/api/mark-processed`

---

## 🎮 Paso 6: Configurar el Juego

### 6.1 Acceder a Configuración
```
https://tu-proyecto.pages.dev/config
```

### 6.2 Agregar Palabras
1. Ve a la sección **"Word List"**
2. Agrega palabras con pistas
3. Guarda cambios

### 6.3 Configurar Webhook Saliente (Opcional)
Si quieres que el juego envíe eventos a **Magic By Loxhias** u otra aplicación:

1. Ve a la sección **"📤 Webhook Saliente"**
2. Pega la URL de tu aplicación:
   ```
   https://magic-by-loxhias.com/webhook
   ```
3. Guarda

### 6.4 Copiar Webhooks Entrantes
1. Ve a la sección **"📥 Webhooks Entrantes"**
2. Copia las URLs para usar en OBS/Streamlabs:
   ```
   https://tu-proyecto.pages.dev/api/guess?user={username}&word={comment}
   https://tu-proyecto.pages.dev/api/event?user={username}&event=reveal_letter
   ```

---

## 🧪 Paso 7: Testing Completo

### Test 1: Juego Manual
1. Ir a `/game`
2. Click en "Nueva Ronda"
3. Verificar que el temporizador funcione
4. Verificar que las letras se revelen automáticamente

### Test 2: Webhook Entrante (Adivinar)
```bash
# Desde otra ventana/navegador
curl "https://tu-proyecto.pages.dev/api/guess?user=TestUser&word=PALABRA_ACTUAL"
```
- El juego debería detectar el intento
- Si es correcto, mostrar pantalla de victoria

### Test 3: Webhook Entrante (Revelar)
```bash
curl "https://tu-proyecto.pages.dev/api/event?user=TestUser&event=reveal_letter"
```
- Una nueva letra debería revelarse inmediatamente

### Test 4: Webhook Saliente
1. Configura un webhook saliente apuntando a [https://webhook.site](https://webhook.site)
2. Juega una ronda
3. Verifica que los eventos lleguen a webhook.site

---

## 🔧 Configuración Avanzada

### Custom Domain
1. `Workers & Pages` → `[Tu Proyecto]` → `Custom domains`
2. `Set up a custom domain`
3. Sigue las instrucciones

### Preview Deployments
Cada branch genera un preview automático:
```
https://[branch].[tu-proyecto].pages.dev
```

### Rollback
1. `Workers & Pages` → `[Tu Proyecto]` → `Deployments`
2. Click en deployment anterior
3. `Rollback to this deployment`

---

## 🐛 Troubleshooting

### Build Falla
```bash
# Limpiar cache local
rm -rf .next out node_modules
npm install
npm run build
```

### Functions No Aparecen
- Verificar que `functions/` esté en la raíz del proyecto
- Verificar que `functions/` esté incluido en Git

### KV No Funciona
1. Verificar que el KV exista
2. Verificar que esté vinculado al proyecto
3. Verificar el nombre de la variable (`GAME_KV`)

### Webhooks No Se Procesan
- Abrir DevTools → Console
- Ver si hay errores de fetch
- Verificar logs en Cloudflare Dashboard

---

## 📊 Monitoreo

### Analytics
```
Workers & Pages → [Tu Proyecto] → Analytics
```
- Requests totales
- Bandwidth usado
- Errores

### Logs en Tiempo Real
```
Workers & Pages → [Tu Proyecto] → Logs
```
- Ver requests a Functions
- Ver errores de ejecución
- Filtrar por endpoint

### Límites del Plan Free
- ✅ 100,000 requests/día
- ✅ Unlimited bandwidth
- ✅ 500 builds/mes
- ✅ 1 concurrent build

---

## 🎯 Próximos Pasos

1. ✅ Deploy funcionando
2. ✅ Webhooks probados
3. 🎮 Integrar con OBS/Streamlabs
4. 🎨 Personalizar temas
5. 📝 Agregar más palabras
6. 🔗 Conectar con Magic By Loxhias

---

## 📚 Recursos Útiles

- [Documentación Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Functions](https://developers.cloudflare.com/pages/functions/)
- [KV Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

## 💡 Tips

- Los cambios en `main` se despliegan automáticamente
- Los preview deployments son ideales para testing
- El KV se sincroniza instantáneamente
- Las Functions tienen cold start de ~50ms
- El polling consume 1 request/segundo (solo en prod)

---

## ✅ Checklist Final

- [ ] Build local exitoso
- [ ] Proyecto conectado a Git
- [ ] KV Namespace creado y vinculado
- [ ] Deploy completado
- [ ] Funciones verificadas (/api/*)
- [ ] Palabras agregadas en /config
- [ ] Webhook saliente configurado (opcional)
- [ ] Webhooks entrantes probados
- [ ] Custom domain configurado (opcional)
- [ ] Monitoreo activo

¡Listo! Tu juego está en producción 🎉
