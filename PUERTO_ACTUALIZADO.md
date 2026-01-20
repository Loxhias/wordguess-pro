# 🔄 PUERTO ACTUALIZADO

## ✅ Cambio Realizado

**Puerto anterior:** 3015  
**Puerto nuevo:** **7777**

---

## 🎯 Por Qué 7777

- ✅ Fácil de recordar (cuatro sietes)
- ✅ Fuera del rango común (3000-3999, 8000-8999)
- ✅ Poco probable que otra app lo use
- ✅ No es puerto privilegiado (<1024)
- ✅ No es puerto efímero (>49152)

---

## 📝 Archivo Modificado

`package.json`:
```json
"scripts": {
  "dev": "cross-env PORT=7777 next dev",
  "start": "cross-env PORT=7777 next start",
  ...
}
```

---

## 🚀 Cómo Reiniciar el Servidor

### Opción 1: Detener y Reiniciar
1. **Ve al terminal donde corre `npm run dev`** (Terminal 2)
2. Presiona `Ctrl+C` para detener el servidor
3. Ejecuta de nuevo: `npm run dev`
4. El servidor iniciará en el puerto **7777**

### Opción 2: Cerrar y Abrir Nuevo Terminal
1. Cierra el terminal actual
2. Abre uno nuevo
3. Ejecuta: `npm run dev`

---

## 🌐 Nuevas URLs

Una vez reiniciado, las URLs serán:

- **Página Principal:** http://localhost:7777
- **Juego:** http://localhost:7777/game
- **Configuración:** http://localhost:7777/config

---

## 📱 URL de Red Local

También podrás acceder desde otros dispositivos en tu red:
```
http://192.168.1.4:7777
```
(La IP puede variar según tu red)

---

## ✅ Verificación

Cuando reinicies, deberías ver:
```
▲ Next.js 16.0.10 (Turbopack)
- Local:         http://localhost:7777
- Network:       http://192.168.1.4:7777

✓ Ready in XXXms
```

---

## 🔧 Si Hay Problemas

### Error: "Puerto 7777 ya está en uso"
```bash
# Windows - Encontrar qué usa el puerto
netstat -ano | findstr :7777

# Matar el proceso (reemplaza PID)
taskkill /PID <número> /F
```

### Quiero otro puerto
Edita `package.json` y cambia `7777` por el que prefieras.

Puertos recomendados alternativos:
- **8765** - Secuencia 
- **9999** - Fácil de recordar
- **54321** - Alto y único
- **13337** - Leet speak
