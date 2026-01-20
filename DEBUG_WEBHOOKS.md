# 🔍 DEBUG: Webhooks No Funcionan

## ✅ Estado Actual

El webhook está **llegando correctamente** a Cloudflare:
```json
{
  "success": true,
  "message": "Event received",
  "data": {
    "id": "event-1768949351471-p0hpr9ivv",
    "user": "{username}",
    "event": "reveal_letter",
    "timestamp": 1768949351471,
    "processed": false
  }
}
```

Pero el juego **no lo está procesando**.

---

## 🔧 Implementé Logs de Debug

Ahora el juego muestra en **Console (F12)** lo que está pasando:

### Logs del Polling
```
✅ [Polling] Activado en producción (wordguess-prov2.pages.dev)
📥 [Polling] Webhooks recibidos: { guesses: 0, events: 1, data: {...} }
```

### Logs del Procesamiento
```
🔔 [Webhook] Eventos recibidos: [...]
🎯 [Webhook] Procesando evento: reveal_letter Usuario: {username}
✅ [Webhook] Revelando letra...
```

O si hay error:
```
⚠️ [Webhook] No hay ronda activa. Usa /api/event?event=nueva_ronda primero
```

---

## 🚀 Cómo Probar

### 1. Desplegar Nueva Versión
```bash
# Ya hice el build con los logs
npm run build

# Sube la carpeta 'out/' a Cloudflare Pages
# O haz push si tienes auto-deploy
git add .
git commit -m "Add webhook debug logs"
git push
```

### 2. Abrir Console del Navegador
1. Ve a: `https://wordguess-prov2.pages.dev/game`
2. Presiona `F12` → Tab **Console**
3. Deberías ver:
   ```
   ✅ [Polling] Activado en producción (wordguess-prov2.pages.dev)
   ```

### 3. Iniciar Una Ronda
1. En `/config` agrega al menos 1 palabra
2. En `/game` click en **"Nueva Ronda"**
3. Verifica en Console que el juego esté corriendo

### 4. Disparar Webhook
```bash
# Desde otra pestaña o curl
https://wordguess-prov2.pages.dev/api/event?user=TestUser&event=reveal_letter
```

### 5. Ver Logs
En Console deberías ver:
```
📥 [Polling] Webhooks recibidos: { guesses: 0, events: 1, data: {...} }
🔔 [Webhook] Eventos recibidos: [...]
🎯 [Webhook] Procesando evento: reveal_letter Usuario: TestUser
✅ [Webhook] Revelando letra...
```

---

## 🐛 Posibles Problemas

### ❌ No veo logs de polling
**Causa**: El polling solo funciona en producción (no localhost)  
**Solución**: Asegúrate de estar en `wordguess-prov2.pages.dev`, no `localhost`

### ❌ Veo "No hay ronda activa"
**Causa**: No has iniciado una ronda  
**Solución**: 
1. Ve a `/config` y agrega palabras
2. Ve a `/game` y click "Nueva Ronda"
3. O usa: `/api/event?user=X&event=nueva_ronda`

### ❌ Veo "No hay palabras configuradas"
**Causa**: No has agregado palabras en `/config`  
**Solución**: 
1. Ve a `/config`
2. Sección "Word List"
3. Agrega al menos 1 palabra con pista
4. Guarda cambios

### ❌ No veo logs de "Webhooks recibidos"
**Causa**: El webhook no está llegando a KV o el polling no funciona  
**Solución**: 
1. Verifica que KV esté vinculado (Settings → Functions → KV Bindings)
2. Verifica que la variable sea `GAME_KV`
3. Prueba hacer otro request al webhook

### ❌ Los logs aparecen pero no pasa nada
**Causa**: Puede ser un error de procesamiento  
**Solución**: Mira si hay errores rojos en Console

---

## 🧪 Test Completo

### Secuencia Correcta:

1. **Agregar palabras**
   ```
   https://wordguess-prov2.pages.dev/config
   → Word List → Agregar: PERRO / Pista: Animal doméstico
   → Guardar
   ```

2. **Iniciar ronda desde webhook**
   ```
   https://wordguess-prov2.pages.dev/api/event?user=Admin&event=nueva_ronda
   ```

3. **Abrir juego**
   ```
   https://wordguess-prov2.pages.dev/game
   → F12 → Console
   → Deberías ver el temporizador corriendo
   ```

4. **Revelar letra**
   ```
   https://wordguess-prov2.pages.dev/api/event?user=Viewer123&event=reveal_letter
   ```

5. **Ver resultado**
   - En el juego debería aparecer una letra revelada
   - En Console:
     ```
     📥 [Polling] Webhooks recibidos: ...
     🔔 [Webhook] Eventos recibidos: ...
     🎯 [Webhook] Procesando evento: reveal_letter
     ✅ [Webhook] Revelando letra...
     ```

---

## 💡 Mejora: Auto-Inicio de Ronda

Ahora si disparas `reveal_letter` sin ronda activa, el juego:
1. Detecta que no hay ronda
2. Auto-inicia una ronda con palabra aleatoria
3. Revela una letra automáticamente

Esto hace que los webhooks sean más "plug & play".

---

## 📊 Verificar KV Storage

### Opción 1: Via API
```bash
# Ver qué hay en cola
https://wordguess-prov2.pages.dev/api/pending
```

**Respuesta esperada**:
```json
{
  "guesses": [],
  "events": [
    {
      "id": "event-...",
      "user": "{username}",
      "event": "reveal_letter",
      "timestamp": ...,
      "processed": false
    }
  ]
}
```

### Opción 2: Cloudflare Dashboard
```
Workers & Pages → [Tu Proyecto] → KV → GAME_KV
→ Ver keys (deberían aparecer event-... y guess-...)
```

---

## 🔄 Si Sigue Sin Funcionar

### 1. Verificar que el usuario no sea literal `{username}`
El webhook debe reemplazar `{username}` por un nombre real:
```bash
# ❌ MAL
/api/event?user={username}&event=reveal_letter

# ✅ BIEN
/api/event?user=TestUser&event=reveal_letter
```

### 2. Verificar CORS
Si llamas desde otra app, verifica que la respuesta incluya:
```
Access-Control-Allow-Origin: *
```

### 3. Verificar TTL de KV
Los eventos se auto-eliminan después de 60 segundos. Si tarda mucho entre el webhook y abrir el juego, puede que ya se hayan eliminado.

---

## ✅ Checklist de Verificación

- [ ] Deploy actualizado con logs
- [ ] Console abierto (F12)
- [ ] Polling activo (mensaje en console)
- [ ] Palabras agregadas en `/config`
- [ ] Ronda iniciada en `/game`
- [ ] Webhook disparado con usuario real (no `{username}`)
- [ ] Logs visibles en Console
- [ ] KV vinculado correctamente

---

## 📞 Siguiente Paso

**Despliega esta versión** y envíame un screenshot de la **Console (F12)** después de:
1. Abrir `/game`
2. Iniciar ronda
3. Disparar el webhook
4. Esperar 2-3 segundos

Con esos logs podré ver exactamente qué está pasando 🔍
