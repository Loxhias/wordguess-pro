# 🎮 WordGuess Pro - SPA Version

Juego de adivinanza de palabras 100% client-side para Cloudflare Pages.

## 🚀 Deploy Rápido

### 1. Build

```bash
npm install
npm run build
```

### 2. Deploy a Cloudflare Pages

**Opción A: Wrangler**
```bash
npm install -g wrangler
wrangler login
wrangler pages deploy out --project-name=wordguess-pro
```

**Opción B: GitHub + Cloudflare Dashboard**
1. Push a GitHub
2. Conecta en Cloudflare Pages
3. Build command: `npm run build`
4. Output directory: `out`

## 🎯 Features

- ✅ 100% Client-Side (sin servidor)
- ✅ LocalStorage para datos
- ✅ Webhooks a Magic By Loxhias
- ✅ 48+ palabras predefinidas
- ✅ Palabras custom

## 🔗 Uso

**Normal:**
```
https://tu-dominio.pages.dev/game
```

**Con webhook:**
```
https://tu-dominio.pages.dev/game?webhook=https://tu-webhook-url
```

## 📁 Estructura

```
app/
├── page.tsx          # Home
├── game/page.tsx     # Juego
├── config/page.tsx   # Configuración
└── not-found.tsx     # 404
```

## 💾 Datos

Todo se guarda en LocalStorage del navegador:
- Ranking de jugadores
- Configuración
- Palabras personalizadas

## 🎮 Costo

**$0/mes** - Cloudflare Pages es gratis

---

**¡Listo para jugar!** 🚀
