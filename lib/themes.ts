export type ThemeStyle =
  | "cyberpunk"
  | "neon"
  | "matrix"
  | "retro"
  | "galaxy"
  | "ocean"
  | "sunset"
  | "forest"
  | "minimal"
  | "dark"

export interface ThemeConfig {
  name: string
  fontFamily: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    cardBg: string
    border: string
    text: string
    glow: string
  }
  animations: {
    letterReveal: string
    tileEffect: string
    glowIntensity: string
  }
}

export const themes: Record<ThemeStyle, ThemeConfig> = {
  cyberpunk: {
    name: "Cyberpunk",
    fontFamily: "font-display",
    colors: {
      primary: "from-purple-500 to-pink-500",
      secondary: "from-purple-400 to-pink-400",
      accent: "purple-500",
      background: "from-slate-900 via-purple-900 to-slate-900",
      cardBg: "slate-900/50",
      border: "purple-500/30",
      text: "purple-300",
      glow: "purple-500/50",
    },
    animations: {
      letterReveal: "animate-flip-reveal",
      tileEffect: "animate-glow-pulse",
      glowIntensity: "shadow-lg shadow-purple-500/50",
    },
  },
  neon: {
    name: "Neon Nights",
    fontFamily: "font-display",
    colors: {
      primary: "from-cyan-500 to-blue-500",
      secondary: "from-cyan-400 to-blue-400",
      accent: "cyan-500",
      background: "from-slate-950 via-blue-950 to-slate-950",
      cardBg: "slate-950/70",
      border: "cyan-500/40",
      text: "cyan-300",
      glow: "cyan-400/60",
    },
    animations: {
      letterReveal: "animate-neon-flicker",
      tileEffect: "animate-neon-pulse",
      glowIntensity: "shadow-2xl shadow-cyan-500/70",
    },
  },
  matrix: {
    name: "Matrix",
    fontFamily: "font-mono",
    colors: {
      primary: "from-green-500 to-emerald-500",
      secondary: "from-green-400 to-emerald-400",
      accent: "green-500",
      background: "from-black via-green-950 to-black",
      cardBg: "black/80",
      border: "green-500/30",
      text: "green-400",
      glow: "green-500/50",
    },
    animations: {
      letterReveal: "animate-matrix-drop",
      tileEffect: "animate-matrix-glitch",
      glowIntensity: "shadow-lg shadow-green-500/60",
    },
  },
  retro: {
    name: "Retro Wave",
    fontFamily: "font-display",
    colors: {
      primary: "from-pink-500 to-orange-500",
      secondary: "from-pink-400 to-orange-400",
      accent: "pink-500",
      background: "from-purple-950 via-pink-900 to-orange-950",
      cardBg: "purple-900/50",
      border: "pink-500/40",
      text: "pink-300",
      glow: "pink-500/60",
    },
    animations: {
      letterReveal: "animate-retro-bounce",
      tileEffect: "animate-retro-glow",
      glowIntensity: "shadow-xl shadow-pink-500/70",
    },
  },
  galaxy: {
    name: "Galaxy",
    fontFamily: "font-display",
    colors: {
      primary: "from-indigo-500 to-purple-500",
      secondary: "from-indigo-400 to-purple-400",
      accent: "indigo-500",
      background: "from-indigo-950 via-purple-950 to-slate-950",
      cardBg: "indigo-950/60",
      border: "indigo-500/30",
      text: "indigo-300",
      glow: "indigo-400/50",
    },
    animations: {
      letterReveal: "animate-galaxy-spin",
      tileEffect: "animate-galaxy-pulse",
      glowIntensity: "shadow-2xl shadow-indigo-500/60",
    },
  },
  ocean: {
    name: "Ocean Deep",
    fontFamily: "font-sans",
    colors: {
      primary: "from-blue-600 to-teal-500",
      secondary: "from-blue-500 to-teal-400",
      accent: "teal-500",
      background: "from-blue-950 via-teal-950 to-slate-950",
      cardBg: "blue-950/60",
      border: "teal-500/40",
      text: "teal-200",
      glow: "teal-400/50",
    },
    animations: {
      letterReveal: "animate-wave-rise",
      tileEffect: "animate-bubble-float",
      glowIntensity: "shadow-xl shadow-teal-500/60",
    },
  },
  sunset: {
    name: "Sunset Blaze",
    fontFamily: "font-sans",
    colors: {
      primary: "from-orange-500 to-red-600",
      secondary: "from-orange-400 to-red-500",
      accent: "orange-500",
      background: "from-orange-950 via-red-950 to-slate-950",
      cardBg: "orange-950/60",
      border: "orange-500/40",
      text: "orange-200",
      glow: "orange-500/60",
    },
    animations: {
      letterReveal: "animate-flame-flicker",
      tileEffect: "animate-heat-wave",
      glowIntensity: "shadow-2xl shadow-orange-500/70",
    },
  },
  forest: {
    name: "Forest Mystic",
    fontFamily: "font-sans",
    colors: {
      primary: "from-emerald-600 to-lime-500",
      secondary: "from-emerald-500 to-lime-400",
      accent: "emerald-500",
      background: "from-emerald-950 via-green-950 to-slate-950",
      cardBg: "emerald-950/70",
      border: "emerald-500/40",
      text: "emerald-200",
      glow: "emerald-400/50",
    },
    animations: {
      letterReveal: "animate-leaf-fall",
      tileEffect: "animate-wind-sway",
      glowIntensity: "shadow-lg shadow-emerald-500/60",
    },
  },
  minimal: {
    name: "Minimal White",
    fontFamily: "font-sans",
    colors: {
      primary: "from-slate-700 to-slate-900",
      secondary: "from-slate-600 to-slate-800",
      accent: "slate-700",
      background: "from-white via-slate-50 to-slate-100",
      cardBg: "white/90",
      border: "slate-300",
      text: "slate-700",
      glow: "slate-300/50",
    },
    animations: {
      letterReveal: "animate-fade-in",
      tileEffect: "animate-subtle-lift",
      glowIntensity: "shadow-md shadow-slate-300/50",
    },
  },
  dark: {
    name: "Pure Dark",
    fontFamily: "font-mono",
    colors: {
      primary: "from-zinc-500 to-zinc-700",
      secondary: "from-zinc-400 to-zinc-600",
      accent: "zinc-600",
      background: "from-black via-zinc-950 to-black",
      cardBg: "zinc-950/90",
      border: "zinc-700/50",
      text: "zinc-300",
      glow: "zinc-500/30",
    },
    animations: {
      letterReveal: "animate-smooth-reveal",
      tileEffect: "animate-subtle-pulse",
      glowIntensity: "shadow-lg shadow-zinc-700/40",
    },
  },
}
