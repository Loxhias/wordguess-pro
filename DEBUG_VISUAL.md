# 🎯 Debug Visual - Sin Necesidad de Console

## ✅ Nueva Página de Debug

Creé una página visual para que puedas **ver en tiempo real** qué está pasando con los webhooks **SIN necesidad de abrir la Console (F12)**.

---

## 🚀 Cómo Usar

### 1. Acceder a la Página
```
https://wordguess-prov2.pages.dev/debug
```

### 2. Ver el Estado en Tiempo Real

La página muestra:

#### 📊 **Status Cards**
- ✅ **Polling Status**: Si está activado en producción
- ✅ **Palabras Configuradas**: Cuántas palabras tienes
- ✅ **Estado del Juego**: Si hay ronda activa, palabra actual, letras reveladas
- ✅ **Cola de Webhooks**: Cuántos guesses y eventos hay esperando

#### 📝 **Logs en Tiempo Real**
- Se actualizan automáticamente cada segundo
- Muestra cuándo llegan webhooks
- Muestra qué eventos se reciben

#### ⚡ **Acciones Rápidas**
- Botones para copiar URLs de webhooks
- Probar directamente desde el navegador

---

## 🧪 Prueba Completa (Paso a Paso)

### **Paso 1: Agregar Palabras**
```
1. Ve a: https://wordguess-prov2.pages.dev/config
2. Agrega al menos 1 palabra (ej: PERRO / Pista: Animal)
3. Guarda
```

### **Paso 2: Abrir Debug**
```
1. Ve a: https://wordguess-prov2.pages.dev/debug
2. Verifica que diga:
   ✅ Activado en producción
   ✅ X palabras configuradas
```

### **Paso 3: Iniciar Ronda**
```
Opción A: Desde la página de debug
→ Copia la URL "Nueva Ronda"
→ Pégala en una nueva pestaña

Opción B: Manual
https://wordguess-prov2.pages.dev/api/event?user=Admin&event=nueva_ronda
```

### **Paso 4: Abrir Juego en Paralelo**
```
1. Abre en otra pestaña: https://wordguess-prov2.pages.dev/game
2. Deberías ver la ronda corriendo
```

### **Paso 5: Disparar Webhook**
```
1. Vuelve a /debug
2. Copia la URL "Revelar Letra"
3. Pégala en una nueva pestaña
4. Deberías ver:
   - En /debug: "1 eventos recibidos: reveal_letter"
   - En /game: Una letra se revela
```

---

## 📸 ¿Qué Deberías Ver?

### Si TODO funciona:
```
✅ Polling Status: Activado en producción
✅ Palabras Configuradas: 5 palabras
✅ Ronda activa: Sí
   Palabra: PERRO
   Letras reveladas: 2/5
   Tiempo restante: 156s
✅ Cola de Webhooks:
   Guesses: 0
   Eventos: 0

📝 Logs:
[14:30:45] 📥 1 eventos recibidos: reveal_letter
```

### Si NO funciona:

#### ⚠️ Polling Desactivado
```
⏸️ Polling Status: Desactivado (localhost)
```
**Causa**: Estás en localhost  
**Solución**: Abre en wordguess-prov2.pages.dev

#### ❌ No hay palabras
```
❌ Palabras Configuradas: No hay palabras
   → Ir a Config
```
**Causa**: No agregaste palabras  
**Solución**: Ve a /config y agrega

#### ⏸️ Ronda no activa
```
Ronda activa: ⏸️ No
```
**Causa**: No iniciaste ronda  
**Solución**: Dispara webhook de nueva_ronda

#### Los logs no se actualizan
```
Logs: Esperando webhooks...
```
**Causas posibles**:
1. El webhook no llegó a KV
2. El polling no está detectando
3. KV no está vinculado

---

## 🔧 Solución de Problemas

### El webhook dice "success" pero no aparece en /debug

**Verifica KV:**
```
1. Cloudflare Dashboard
2. Workers & Pages → [Tu Proyecto]
3. Settings → Functions → KV Namespace Bindings
4. Debe decir: GAME_KV → GAME_KV
```

**Verifica que el webhook persista:**
```
https://wordguess-prov2.pages.dev/api/pending
```
Debería mostrar:
```json
{
  "guesses": [],
  "events": [
    {
      "id": "event-...",
      "user": "TestUser",
      "event": "reveal_letter",
      ...
    }
  ]
}
```

Si no aparece nada, el KV no está funcionando.

---

## 💡 Ventajas de Debug Visual

### vs Console (F12):
- ✅ No necesitas conocimientos técnicos
- ✅ Todo visible de un vistazo
- ✅ Actualización automática cada segundo
- ✅ Botones para copiar webhooks
- ✅ Ver estado del juego en tiempo real

### Usa /debug para:
- Ver si el polling está activo
- Verificar que los webhooks lleguen
- Monitorear el estado del juego
- Probar webhooks fácilmente

### Usa /game para:
- Ver la UI del juego
- Ver las letras revelándose
- Jugar normalmente

---

## 🎯 Workflow Recomendado

```
1. Abre /debug en pestaña 1
2. Abre /game en pestaña 2
3. Dispara webhooks desde /debug
4. Ve los resultados en /game
5. Monitorea en /debug
```

---

## 📋 Checklist

Antes de probar webhooks, verifica en `/debug`:

- [ ] ✅ Polling activado en producción
- [ ] ✅ Al menos 1 palabra configurada
- [ ] ✅ Ronda activa (o dispara nueva_ronda)
- [ ] ⏳ Cola de webhooks en 0 (antes de probar)

Después de disparar webhook:

- [ ] 📥 Aparece en logs de /debug
- [ ] 🎮 Se ejecuta en /game
- [ ] ✅ Cola vuelve a 0 (se procesó)

---

## 🚀 Resultado Final

Con esta página puedes **ver exactamente** qué está pasando sin necesidad de:
- Abrir Console
- Conocer herramientas de desarrollo
- Leer logs técnicos

**Todo es visual y en tiempo real** 🎯
