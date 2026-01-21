# 🔧 Vincular KV a Cloudflare Pages (Paso a Paso)

## ❌ Error Actual

```json
{
  "error": "KV not configured",
  "message": "GAME_KV namespace is not bound to this function"
}
```

**Causa**: El KV Namespace no está vinculado al proyecto Pages.

---

## ✅ SOLUCIÓN (Sigue estos pasos EXACTAMENTE)

### **PASO 1: Crear KV Namespace (Si no existe)**

1. Ve a: https://dash.cloudflare.com
2. En el **menú lateral izquierdo**, busca **"Workers & Pages"**
3. En la parte superior, click en la pestaña **"KV"**
4. Click en **"Create a namespace"**
5. **Namespace Name**: `GAME_KV` (exactamente así, case-sensitive)
6. Click **"Add"**

✅ **Ahora deberías ver `GAME_KV` en la lista de KV Namespaces**

---

### **PASO 2: Vincular KV al Proyecto Pages**

1. En el mismo panel de Cloudflare, **menú lateral** → **"Workers & Pages"**
2. Click en la pestaña **"Overview"** (arriba)
3. Busca tu proyecto: **"wordguess-prov2"**
4. Click en el nombre del proyecto
5. Click en la pestaña **"Settings"** (arriba)
6. En el menú lateral de Settings, busca **"Functions"**
7. Baja hasta la sección **"KV namespace bindings"**
8. Click en **"Add binding"**
9. Completa el formulario:
   - **Variable name**: `GAME_KV` (EXACTO, case-sensitive)
   - **KV namespace**: Selecciona `GAME_KV` del dropdown
10. Click **"Save"**

✅ **Deberías ver el binding en la lista:**
```
Variable name: GAME_KV
KV namespace: GAME_KV
```

---

### **PASO 3: Re-deploy (MUY IMPORTANTE)**

El cambio de KV **NO se aplica automáticamente**. Necesitas un nuevo deploy.

**Opción A: Desde Git** (Recomendado)
```bash
# Hacer un commit vacío para forzar re-deploy
git commit --allow-empty -m "Trigger redeploy after KV binding"
git push
```

**Opción B: Manual en Cloudflare**
1. En tu proyecto → Tab **"Deployments"**
2. Click en el último deployment
3. Click en **"Manage deployment"** (arriba derecha)
4. Click en **"Retry deployment"**

⏳ **Espera 1-2 minutos** a que termine el deploy.

---

### **PASO 4: Verificar que Funciona**

#### **Test 1: Enviar Webhook**
```bash
curl "https://wordguess-prov2.pages.dev/api/event?user=TestUser&event=reveal_letter"
```

**Antes** (con error):
```json
{
  "error": "KV not configured",
  "message": "GAME_KV namespace is not bound to this function"
}
```

**Ahora** (funcionando):
```json
{
  "success": true,
  "message": "Event received and stored",
  "data": {
    "id": "event-1768950123-abc",
    "user": "TestUser",
    "event": "reveal_letter",
    "timestamp": 1768950123456,
    "processed": false
  }
}
```

#### **Test 2: Verificar que se guardó**
```bash
# Hacerlo INMEDIATAMENTE (antes de 60s)
curl "https://wordguess-prov2.pages.dev/api/pending"
```

**Esperado**:
```json
{
  "guesses": [],
  "events": [
    {
      "id": "event-1768950123-abc",
      "user": "TestUser",
      "event": "reveal_letter",
      "timestamp": 1768950123456,
      "processed": false
    }
  ]
}
```

✅ **Si ves el evento**: ¡Funciona!

---

## 🎯 Checklist Completo

- [ ] KV Namespace `GAME_KV` creado
- [ ] KV vinculado al proyecto (Variable: `GAME_KV`, Namespace: `GAME_KV`)
- [ ] Re-deploy completado (git push o retry deployment)
- [ ] Test 1 exitoso (retorna `success: true`)
- [ ] Test 2 exitoso (retorna el evento)

---

## 🐛 Troubleshooting

### ❌ "No veo la opción KV en el menú"
**Causa**: Estás en el plan Free de Cloudflare  
**Solución**: KV está disponible en el plan Free, verifica que estás en la sección correcta:
- Workers & Pages (menú lateral) → Tab "KV" (arriba)

---

### ❌ "El dropdown de KV namespace está vacío"
**Causa**: No creaste el namespace en el PASO 1  
**Solución**: Vuelve al PASO 1 y crea `GAME_KV`

---

### ❌ "Después del re-deploy sigue fallando"
**Causa**: El deploy no finalizó o hay un error de cache  
**Solución**:
1. Espera 2-3 minutos más
2. Abre el navegador en modo incógnito
3. Prueba el webhook de nuevo
4. Verifica en Deployments que el último deploy tenga status "Success"

---

### ❌ "Dice 'success: true' pero /api/pending retorna vacío"
**Causa**: Esperaste más de 60 segundos (TTL expiró)  
**Solución**: 
1. Dispara el webhook
2. INMEDIATAMENTE consulta `/api/pending` (en menos de 60s)

---

## 📸 Capturas de Pantalla (Referencias)

### **Paso 1: Crear KV**
```
Workers & Pages → KV (tab) → Create namespace
┌─────────────────────────────────┐
│ Namespace Name: GAME_KV         │
│ [Add]                           │
└─────────────────────────────────┘
```

### **Paso 2: Vincular KV**
```
Project → Settings → Functions → KV namespace bindings
┌─────────────────────────────────────────┐
│ Variable name: GAME_KV                  │
│ KV namespace: [Dropdown] GAME_KV ▼      │
│ [Save]                                  │
└─────────────────────────────────────────┘
```

### **Resultado Esperado**
```
KV namespace bindings
┌──────────────┬──────────────┬────────┐
│ Variable     │ Namespace    │ Action │
├──────────────┼──────────────┼────────┤
│ GAME_KV      │ GAME_KV      │ Edit   │
└──────────────┴──────────────┴────────┘
```

---

## ⏰ Tiempo Estimado

- Crear KV: 30 segundos
- Vincular: 1 minuto
- Re-deploy: 1-2 minutos
- **Total: ~3-4 minutos**

---

## ✅ Una Vez Completado

Cuando veas esto en el Test 1:
```json
{ "success": true, "message": "Event received and stored", ... }
```

**¡Los webhooks están funcionando!** 🎉

Continúa a probar en el navegador:
```
1. Abre: https://wordguess-prov2.pages.dev/game
2. F12 → Console
3. Dispara webhook desde otra pestaña
4. Deberías ver logs en Console
```
