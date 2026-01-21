# 🏠 Webhooks Locales - Guía Rápida

## ✅ **Lo que Se Creó**

- ✅ Servidor local Express (`dev-server/webhook-server.js`)
- ✅ Scripts npm actualizados
- ✅ Hook actualizado para detectar local/producción
- ✅ Dependencias instaladas (express, cors, concurrently)

---

## 🚀 **Cómo Usar**

### **Opción 1: Ambos servidores a la vez** (Recomendado)
```bash
npm run dev:full
```

Esto inicia:
- 🎮 Next.js en `http://localhost:7777`
- 🔗 Servidor de webhooks en `http://localhost:3016`

---

### **Opción 2: Por separado**

**Terminal 1** (Servidor de webhooks):
```bash
npm run dev:webhooks
```

**Terminal 2** (Next.js):
```bash
npm run dev
```

---

## 🧪 **Probar**

### **1. Health Check**
```bash
curl http://localhost:3016/health
```

**Esperado**:
```json
{"status":"OK","uptime":5.123,"timestamp":1768950000}
```

---

### **2. Enviar Webhook**
```bash
curl "http://localhost:3016/api/event?user=TestUser&event=reveal_letter"
```

**Esperado**:
```json
{
  "success": true,
  "message": "Event received (local)",
  "data": {...}
}
```

---

### **3. Ver Pendientes**
```bash
curl "http://localhost:3016/api/pending"
```

**Esperado**:
```json
{
  "guesses": [],
  "events": [...]
}
```

---

### **4. Debug (Ver todo el storage)**
```bash
curl "http://localhost:3016/api/debug"
```

---

## 🎮 **Probar en el Navegador**

1. Abre: `http://localhost:7777/game`
2. F12 → Console
3. Deberías ver:
   ```
   ✅ [Polling] Activado en LOCAL (localhost:3016)
   💡 [Polling] Inicia el servidor local: npm run dev:webhooks
   ```

4. En otra pestaña, dispara un webhook:
   ```
   http://localhost:3016/api/event?user=Test&event=reveal_letter
   ```

5. Vuelve a la pestaña del juego
6. En 1-2 segundos deberías ver:
   ```
   📥 [Polling] Webhooks recibidos: { events: 1, mode: 'LOCAL' }
   🔔 [Webhook] Eventos recibidos: [...]
   ```

---

## 📊 **Logs del Servidor**

En la terminal donde corre `npm run dev:webhooks` verás:

```
╔═══════════════════════════════════════════╗
║  🏠 Servidor de Webhooks LOCAL            ║
║  Puerto: http://localhost:3000            ║
║  Estado: ✅ ACTIVO                        ║
╚═══════════════════════════════════════════╝

📥 [LOCAL] Webhook recibido: { session: 'default', user: 'Test', event: 'reveal_letter' }
📤 [LOCAL] Enviando pendientes: { session: 'default', guesses: 0, events: 1 }
✅ [LOCAL] Evento procesado y eliminado: event-1768950000-abc
```

---

## 🔄 **Flujo Completo**

```
1. Terminal 1: npm run dev:webhooks
   → Servidor escuchando en :3016
   
2. Terminal 2: npm run dev
   → Next.js en :7777
   
3. Navegador: http://localhost:7777/game
   → Frontend inicia polling a localhost:3016
   
4. Disparar webhook:
   curl http://localhost:3016/api/event?...
   
5. Storage en memoria guarda el evento
   
6. Frontend (1s después) consulta /api/pending
   
7. GameContext ejecuta la acción
   
8. Frontend marca como procesado
   
9. Se elimina del storage
```

---

## 🎯 **Ventajas**

✅ **No necesitas Cloudflare** para desarrollar  
✅ **No necesitas KV** (todo en RAM)  
✅ **Logs visibles** en ambas terminales  
✅ **Más rápido** (sin latencia de red)  
✅ **Debugging fácil** (puedes modificar el servidor)  
✅ **Gratis** (no consume límites)  

---

## 🐛 **Troubleshooting**

### ❌ "EADDRINUSE: address already in use :::3016"
**Causa**: Puerto 3016 ocupado  
**Solución**:
```bash
# Windows
netstat -ano | findstr :3016
taskkill /PID <PID> /F

# O cambiar a otro puerto
WEBHOOK_PORT=3017 npm run dev:webhooks
```

---

### ❌ "fetch failed" en el navegador
**Causa**: Servidor no está corriendo  
**Solución**:
```bash
# Verifica que el servidor esté activo
curl http://localhost:3016/health

# Si no responde, inícialo
npm run dev:webhooks
```

---

### ❌ No veo logs en Console
**Causa**: El juego no está detectando el servidor local  
**Solución**:
1. Verifica que estés en `localhost:7777` (no `127.0.0.1`)
2. Abre DevTools → Console
3. Busca: "✅ [Polling] Activado en LOCAL"
4. Si no aparece, recarga la página

---

## 🔀 **Deploy a Producción**

Cuando estés listo para desplegar:

```bash
# 1. Build
npm run build

# 2. Deploy a Cloudflare
git add .
git commit -m "Ready for production"
git push
```

**El código se adapta automáticamente**:
- En local → usa `http://localhost:3016`
- En Cloudflare → usa `/api/...` (Functions)

---

## 📋 **Checklist**

- [x] Dependencias instaladas (`npm install`)
- [x] Servidor creado (`dev-server/webhook-server.js`)
- [x] Scripts agregados a `package.json`
- [x] Hook actualizado (`hooks/use-incoming-webhooks.ts`)
- [ ] Probar: `npm run dev:full`
- [ ] Verificar: `http://localhost:3016/health`
- [ ] Probar: `http://localhost:7777/game`
- [ ] Disparar webhook y ver logs

---

## 🎉 **¡Listo!**

**Ahora puedes desarrollar sin necesidad de Cloudflare** 🚀

Para usar:
```bash
npm run dev:full
```

Y a programar 🎮
