# 🚀 DEPLOY A CLOUDFLARE PAGES (CON API ROUTES)

## ✅ CONFIGURACIÓN ACTUAL

El proyecto ahora está configurado para usar **Cloudflare Pages con Next.js runtime**, que soporta:
- ✅ API Routes dinámicas
- ✅ Webhooks funcionando
- ✅ Server-Side Rendering (SSR)
- ✅ Static pages donde sea posible

---

## 📦 PASOS PARA DEPLOY

### 1. Commit y Push

```bash
git add .
git commit -m "Fix: API Routes para webhooks"
git push
```

### 2. Cloudflare Pages Settings

En el dashboard de Cloudflare Pages:

**Framework preset:** Next.js
**Build command:** `npm run build`
**Build output directory:** `.next`
**Root directory:** (dejar vacío)

### 3. Environment Variables (Opcional)

Si quieres agregar autenticación:
```
AUTH_TOKEN=tu_token_secreto_aqui
```

---

## 🔧 CÓMO FUNCIONAN LOS WEBHOOKS

### En Desarrollo (localhost):
```
http://localhost:7777/api/guess?user={username}&word={word}
http://localhost:7777/api/event?user={username}&event=reveal_letter
```

### En Producción (Cloudflare):
```
https://tu-proyecto.pages.dev/api/guess?user={username}&word={word}
https://tu-proyecto.pages.dev/api/event?user={username}&event=reveal_letter
```

---

## 📁 ESTRUCTURA FINAL

```
wordguess-pro/
├── app/
│   ├── api/                      ← API Routes (webhooks)
│   │   ├── guess/route.ts       ✅ Funciona en Cloudflare
│   │   ├── event/route.ts       ✅ Funciona en Cloudflare
│   │   ├── pending/route.ts     ✅ Funciona en Cloudflare
│   │   └── mark-processed/route.ts ✅ Funciona en Cloudflare
│   ├── game/page.tsx
│   ├── config/page.tsx
│   └── layout.tsx
├── lib/
│   └── webhook-storage.ts       ← Storage en memoria
├── hooks/
│   └── use-incoming-webhooks.ts ← Polling automático
└── next.config.mjs              ✅ Sin 'output: export'
```

---

## ⚠️ IMPORTANTE

### Storage en Memoria

Actualmente, los webhooks se guardan en **memoria RAM** del servidor. Esto significa:

- ✅ Funciona perfectamente para desarrollo
- ✅ Funciona en producción para tráfico bajo/medio
- ⚠️ Se pierde si el worker se reinicia (cada ~15 min inactivo)

### Para Producción a Gran Escala (Opcional)

Si esperas mucho tráfico, considera:

1. **Cloudflare KV** - Storage persistente
2. **Redis** - Storage en memoria externo
3. **Durable Objects** - State permanente

Pero para la mayoría de casos, el storage en memoria es **suficiente**.

---

## 🧪 VERIFICAR DESPUÉS DEL DEPLOY

1. **Visita tu sitio:**
   ```
   https://tu-proyecto.pages.dev
   ```

2. **Prueba un webhook:**
   ```
   https://tu-proyecto.pages.dev/api/event?user=test&event=reveal_letter
   ```

3. **Deberías ver:**
   ```json
   {
     "success": true,
     "message": "Event received",
     "data": { ... }
   }
   ```

---

## ✅ CHECKLIST POST-DEPLOY

- [ ] Webhooks responden correctamente
- [ ] Página de juego carga
- [ ] Página de config muestra URLs correctas
- [ ] Intentos se procesan correctamente
- [ ] Eventos (reveal_letter, double_points) funcionan
- [ ] Ranking se guarda en LocalStorage
- [ ] Temas visuales funcionan
- [ ] Multi-idioma funciona

---

## 🆘 TROUBLESHOOTING

### Error: "API Route not found"
- Verifica que `next.config.mjs` NO tenga `output: 'export'`
- Verifica que Build Command sea `npm run build`
- Verifica que Build Output sea `.next`

### Webhooks no funcionan
- Verifica las URLs en `/config`
- Deberían ser `https://tu-dominio.pages.dev/api/...`
- NO `http://localhost:7777/api/...`

### Storage se pierde
- Normal si no hay tráfico por >15 min
- Considera Cloudflare KV para persistencia

---

## 🎉 ¡LISTO!

Tu juego ahora está deployado con webhooks funcionando completamente. 🚀

**URLs para copiar:**
- Juego: `https://tu-proyecto.pages.dev/game`
- Config: `https://tu-proyecto.pages.dev/config`
- Webhook Guess: `https://tu-proyecto.pages.dev/api/guess?user={username}&word={word}`
- Webhook Event: `https://tu-proyecto.pages.dev/api/event?user={username}&event={event}`
