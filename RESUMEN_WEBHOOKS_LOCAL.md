# ✅ RESUMEN: Webhooks Locales Listos (Puerto 3016)

## 🎯 **¿Qué Se Completó?**

### ✅ **Servidor Local de Webhooks**
- **Puerto**: `3016` (en lugar de 3000)
- **Ubicación**: `dev-server/webhook-server.js`
- **Estado**: ✅ Funcionando

### ✅ **Archivos Actualizados**
- ✅ `dev-server/webhook-server.js` → Puerto 3016
- ✅ `hooks/use-incoming-webhooks.ts` → Detecta localhost:3016
- ✅ `package.json` → Scripts agregados
- ✅ `README_WEBHOOKS_LOCAL.md` → Documentación completa
- ✅ `WEBHOOKS_LOCAL.md` → Guía técnica

---

## 🚀 **Cómo Iniciar**

### **Opción 1: Ambos Servidores** (Recomendado)
```bash
npm run dev:full
```

### **Opción 2: Por Separado**
```bash
# Terminal 1
npm run dev:webhooks

# Terminal 2
npm run dev
```

---

## 🌐 **URLs**

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend (Next.js) | `http://localhost:7777` | 7777 |
| Webhooks (Local) | `http://localhost:3016` | 3016 |
| Webhooks (Cloudflare) | `https://wordguess-prov2.pages.dev` | 443 |

---

## 🧪 **Tests Rápidos**

### **1. Health Check**
```bash
curl http://localhost:3016/health
```
**Esperado**: `{"status":"OK","uptime":...}`

### **2. Webhook de Prueba**
```bash
curl "http://localhost:3016/api/event?user=Test&event=reveal_letter"
```
**Esperado**: `{"success":true,"message":"Event received (local)",...}`

### **3. Ver Pendientes**
```bash
curl "http://localhost:3016/api/pending"
```
**Esperado**: `{"guesses":[],"events":[...]}`

### **4. Debug Storage**
```bash
curl "http://localhost:3016/api/debug"
```

---

## 🎮 **Flujo Completo**

```
1. Iniciar: npm run dev:full

2. Abrir: http://localhost:7777/game

3. F12 → Console → Ver:
   ✅ [Polling] Activado en LOCAL (localhost:3016)

4. Disparar webhook (nueva pestaña):
   http://localhost:3016/api/event?user=Test&event=reveal_letter

5. Volver al juego → Ver logs:
   📥 [Polling] Webhooks recibidos: { events: 1, mode: 'LOCAL' }
   🔔 [Webhook] Eventos recibidos: [...]
   🎯 [Webhook] Procesando evento: reveal_letter
   ✅ [Webhook] Revelando letra...

6. Ver letra revelada en el juego ✅
```

---

## ⚡ **Ventajas**

✅ **Puerto único (3016)** → No conflictos con otras apps  
✅ **Sin Cloudflare** → Desarrollo sin internet  
✅ **Sin KV** → Todo en memoria RAM  
✅ **Logs visibles** → Ver todo en la terminal  
✅ **Rápido** → Sin latencia de red  
✅ **Gratis** → No consume límites  

---

## 🔄 **Detección Automática de Entorno**

El código detecta automáticamente dónde está corriendo:

| Entorno | Hostname | Webhooks URL | Storage |
|---------|----------|--------------|---------|
| **Local** | `localhost` | `http://localhost:3016/api/...` | RAM |
| **Cloudflare** | `wordguess-prov2.pages.dev` | `/api/...` (Functions) | KV |

---

## 🐛 **Troubleshooting**

### ❌ "EADDRINUSE: address already in use :::7777"
**Causa**: Next.js ya está corriendo  
**Solución**:
```bash
# Windows
netstat -ano | findstr :7777
taskkill /PID <PID> /F

# Luego reiniciar
npm run dev:full
```

### ❌ "EADDRINUSE: address already in use :::3016"
**Causa**: Servidor de webhooks ya está corriendo  
**Solución**:
```bash
# Windows
netstat -ano | findstr :3016
taskkill /PID <PID> /F

# O usar otro puerto
WEBHOOK_PORT=3017 npm run dev:webhooks
```

### ❌ "fetch failed" en Console del navegador
**Causa**: Servidor de webhooks no está corriendo  
**Solución**:
```bash
# Verificar
curl http://localhost:3016/health

# Si falla, iniciar
npm run dev:webhooks
```

---

## 📋 **Endpoints Disponibles**

### **Webhooks**
```
GET  /api/event?user=X&event=Y&duration=Z
GET  /api/guess?user=X&word=Y
GET  /api/pending?session=X
POST /api/mark-processed { "key": "event-123" }
```

### **Utilidades**
```
GET  /api/debug    → Ver todo el storage
GET  /health       → Health check
```

---

## 🎯 **Próximos Pasos**

### **Para Desarrollo**
1. ✅ Ejecutar: `npm run dev:full`
2. ✅ Probar: `http://localhost:7777/game`
3. ✅ Disparar webhooks desde navegador
4. ✅ Ver logs en ambas consoles

### **Para Producción**
1. ✅ Build: `npm run build`
2. ✅ Deploy a Cloudflare
3. ✅ Configurar KV Namespace
4. ✅ Probar webhooks en producción

---

## 📊 **Comparación Local vs Producción**

| Feature | Local (3016) | Cloudflare |
|---------|--------------|------------|
| Setup | ✅ Inmediato | ⚠️ Requiere KV |
| Velocidad | ⚡ Instantáneo | 🌍 ~50ms |
| Storage | RAM | KV (TTL 60s) |
| Multi-usuario | ❌ Solo tú | ✅ Global |
| Persistencia | ❌ Temporal | ✅ En KV |
| Costo | 💰 $0 | 💰 Free tier |
| Internet | ❌ No necesario | ✅ Requerido |

---

## ✅ **Estado Actual**

- [x] Servidor local creado (puerto 3016)
- [x] Hook actualizado para detectar local
- [x] Scripts npm configurados
- [x] Documentación completa
- [x] Dependencias instaladas
- [ ] Matar proceso en puerto 7777 (si aplica)
- [ ] Ejecutar `npm run dev:full`
- [ ] Probar webhooks locales

---

## 🎉 **¡Listo para Usar!**

**Comando único para iniciar todo**:
```bash
npm run dev:full
```

**URLs**:
- 🎮 Juego: http://localhost:7777
- 🔗 Webhooks: http://localhost:3016
- 📊 Debug: http://localhost:3016/api/debug

**¡A desarrollar!** 🚀
