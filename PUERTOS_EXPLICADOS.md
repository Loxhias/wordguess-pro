# 🔌 PUERTOS DEL PROYECTO - EXPLICACIÓN CLARA

## 📍 **RESUMEN RÁPIDO**

| Servicio | Puerto | Comando | Descripción |
|----------|--------|---------|-------------|
| **Aplicación Next.js** | `7777` | `npm run dev` | El juego (frontend) |
| **Servidor de Webhooks Local** | `3000` | `npm run dev:webhooks` | API local para recibir webhooks |
| **Todo junto** | `7777 + 3000` | `npm run dev:full` | Inicia ambos |

---

## 🎮 **PUERTO 7777 - Aplicación Next.js (El Juego)**

### **¿Qué es?**
Es donde corre tu aplicación Next.js (el juego de palabras).

### **¿Cómo se inicia?**
```bash
npm run dev
```

### **¿Cómo se accede?**
```
http://localhost:7777/
http://localhost:7777/game
http://localhost:7777/config
```

### **¿Por qué 7777?**
Se definió en `package.json`:
```json
{
  "scripts": {
    "dev": "cross-env PORT=7777 next dev"
  }
}
```

---

## 🌐 **PUERTO 3000 - Servidor de Webhooks Local**

### **¿Qué es?**
Un servidor Express.js que simula las Cloudflare Functions localmente.

### **¿Para qué sirve?**
- Recibir webhooks **entrantes** (de otras apps hacia el juego)
- Guardar eventos temporalmente en memoria
- Permitir que el juego los lea vía polling

### **¿Cómo se inicia?**
```bash
npm run dev:webhooks
```

### **¿Cómo se accede?**
```bash
# Recibir evento
curl "http://localhost:3000/api/event?user=Test&event=nueva_ronda"

# Ver eventos pendientes
curl "http://localhost:3000/api/pending"

# Enviar intento de adivinanza
curl "http://localhost:3000/api/guess?user=Test&word=PERRO"
```

### **¿Dónde se define?**
En `dev-server/webhook-server.js`:
```javascript
const PORT = process.env.WEBHOOK_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor de Webhooks LOCAL`);
  console.log(`Puerto: http://localhost:${PORT}`);
});
```

---

## 🚀 **FLUJO COMPLETO DE WEBHOOKS LOCALES**

### **1. Iniciar ambos servidores**
```bash
npm run dev:full
```

Esto inicia:
- **Next.js** en `http://localhost:7777` (el juego)
- **Webhook Server** en `http://localhost:3000` (API local)

---

### **2. Abrir el juego**
```
http://localhost:7777/game
```

---

### **3. Enviar webhook desde otra aplicación**

#### **Opción A: Desde Magic By Loxhias**
```javascript
// Tu aplicación de escritorio envía:
fetch('http://localhost:3000/api/event?user=Viewer123&event=reveal_letter')
```

#### **Opción B: Desde curl (para testear)**
```bash
curl "http://localhost:3000/api/event?user=Test&event=nueva_ronda"
```

---

### **4. El juego recibe el webhook**
El hook `use-incoming-webhooks.ts` hace polling cada 1 segundo:
```typescript
// Se conecta a:
http://localhost:3000/api/pending

// Recibe:
{
  "guesses": [],
  "events": [
    { "id": "event-123", "event": "nueva_ronda", "user": "Test" }
  ]
}

// Ejecuta la acción en el juego
// Marca como procesado
```

---

## 🌍 **EN PRODUCCIÓN (CLOUDFLARE)**

Cuando despliegas a Cloudflare Pages:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Aplicación** | `https://tu-proyecto.pages.dev` | El juego |
| **Webhooks** | `https://tu-proyecto.pages.dev/api/...` | Cloudflare Functions |

**Ejemplo**:
```bash
# Enviar evento en producción
curl "https://tu-proyecto.pages.dev/api/event?user=Test&event=nueva_ronda"

# El juego hace polling a:
https://tu-proyecto.pages.dev/api/pending
```

**No hay puertos**, todo está en el mismo dominio bajo `https://`.

---

## 🔄 **CÓMO FUNCIONA EL POLLING**

El juego detecta automáticamente si está en local o producción:

```typescript
// hooks/use-incoming-webhooks.ts

// Detectar entorno
const hostname = window.location.hostname
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'

// Determinar URL base
const baseUrl = isLocal 
  ? 'http://localhost:3000'  // ← LOCAL: Puerto 3000
  : ''                        // ← PRODUCCIÓN: Mismo dominio

// Hacer polling
fetch(`${baseUrl}/api/pending`)
```

---

## 🧪 **TESTS DE VERIFICACIÓN**

### **Test 1: Servidor de Webhooks Local está Corriendo**
```bash
curl http://localhost:3000/health

# ✅ Debe responder: OK
```

### **Test 2: Aplicación está Corriendo**
```bash
# Abrir en navegador:
http://localhost:7777

# ✅ Debe cargar la página principal
```

### **Test 3: Enviar Webhook Local**
```bash
# Terminal 1: Iniciar todo
npm run dev:full

# Terminal 2: Enviar webhook
curl "http://localhost:3000/api/event?user=Test&event=nueva_ronda"

# ✅ Debe responder: {"success":true,"message":"Event received and stored"}
# ✅ En el juego (http://localhost:7777/game) debe iniciar nueva ronda
```

---

## ❓ **PREGUNTAS FRECUENTES**

### **¿Por qué 7777 y no 3000?**
- **3000** es el puerto por defecto de Next.js
- Pero ya lo estamos usando para el servidor de webhooks
- Por eso usamos **7777** para Next.js (definido en package.json)

### **¿Puedo cambiar los puertos?**
Sí, pero debes cambiarlos en **3 lugares**:

1. **Puerto de Next.js** → `package.json`:
   ```json
   "dev": "cross-env PORT=XXXX next dev"
   ```

2. **Puerto de Webhooks** → `dev-server/webhook-server.js`:
   ```javascript
   const PORT = process.env.WEBHOOK_PORT || YYYY;
   ```

3. **Hook de Polling** → `hooks/use-incoming-webhooks.ts`:
   ```typescript
   const baseUrl = isLocal ? 'http://localhost:YYYY' : ''
   ```

### **¿En Cloudflare también usa estos puertos?**
**No**. En Cloudflare Pages no hay puertos, todo está bajo HTTPS:
```
https://tu-proyecto.pages.dev/
https://tu-proyecto.pages.dev/api/event
https://tu-proyecto.pages.dev/api/pending
```

---

## 📚 **COMANDOS ÚTILES**

```bash
# Solo la aplicación (sin webhooks)
npm run dev
# → http://localhost:7777

# Solo el servidor de webhooks
npm run dev:webhooks
# → http://localhost:3000

# Ambos al mismo tiempo
npm run dev:full
# → http://localhost:7777 (app)
# → http://localhost:3000 (webhooks)

# Build para producción
npm run build
# → Genera carpeta out/

# Ver qué está usando cada puerto (Windows)
netstat -ano | findstr :7777
netstat -ano | findstr :3000
```

---

## ✅ **RESUMEN FINAL**

### **LOCAL (Desarrollo)**
- 🎮 **Juego**: `http://localhost:7777` (Next.js)
- 🌐 **Webhooks**: `http://localhost:3000` (Express)
- 🚀 **Iniciar**: `npm run dev:full`

### **PRODUCCIÓN (Cloudflare)**
- 🌍 **Todo**: `https://tu-proyecto.pages.dev`
- 🔄 **Sin puertos**, todo bajo HTTPS

### **FLUJO DE WEBHOOKS**
1. Magic By Loxhias → `http://localhost:3000/api/event` (local) o `https://tu-proyecto.pages.dev/api/event` (producción)
2. Servidor guarda el evento
3. Juego hace polling cada 1s a `/api/pending`
4. Juego ejecuta la acción
5. Juego marca como procesado en `/api/mark-processed`

**¡Ahora está todo claro!** 🎉
