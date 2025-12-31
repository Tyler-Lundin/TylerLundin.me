export type BillboardThemeKey =
  | 'neon_arcade'
  | 'noir_poster'
  | 'industrial_hazard'
  | 'holo_glass'
  | 'crt_terminal'
  | 'desert_highway'

export type BillboardTheme = {
  wrap: string
  panel: string
  overlay: string
  label: string
  title: string
  desc: string
  stickerPlate: string
  stickerGlow: string
  metaPill: string
}


export const billboardThemes: Record<BillboardThemeKey, BillboardTheme> = {
  // --------------------------------------------------------------------------
  // NEON ARCADE
  // Light: Vaporwave (Pastels, White, Grid)
  // Dark:  Synthwave (Deep Purple, Neon, Glow)
  // --------------------------------------------------------------------------
  neon_arcade: {
    wrap: 'p-1',
    panel:
      'relative rounded-3xl overflow-hidden ' +
      // Light: White with sharp violet border
      'bg-white border-violet-200 ' +
      // Dark: Deep void with purple glow
      'dark:bg-[#09090b] dark:border-white/10 ' +
      'shadow-xl dark:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]',
    overlay:
      'absolute inset-0 pointer-events-none z-0 ' +
      // Background Gradients
      'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ' +
      'from-fuchsia-100/60 via-transparent to-transparent ' +
      'dark:from-purple-900/40 dark:via-[#09090b] dark:to-[#09090b] ' +
      // Grid Pattern
      'after:absolute after:inset-0 ' +
      'after:bg-[linear-gradient(to_right,rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.1)_1px,transparent_1px)] ' +
      'dark:after:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] ' +
      'after:bg-[size:24px_24px] ' +
      // Glow Spot
      'before:absolute before:top-0 before:right-0 before:w-[500px] before:h-[500px] ' +
      'before:bg-fuchsia-500/10 dark:before:bg-purple-500/20 before:blur-[100px] before:rounded-full',
    label:
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ' +
      'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 ' +
      'dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20 ' +
      'shadow-[0_0_10px_rgba(192,38,211,0.1)] dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    title: 'text-neutral-900 dark:text-white drop-shadow-sm',
    desc: 'text-neutral-600 dark:text-purple-100/70',
    stickerPlate:
      'relative rounded-xl border backdrop-blur-md shadow-2xl ' +
      'border-white/40 bg-white/60 ' +
      'dark:border-white/10 dark:bg-white/5',
    stickerGlow:
      'absolute -inset-0.5 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 opacity-20 dark:opacity-30 blur-sm',
    metaPill:
      'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-bold ' +
      'bg-neutral-900 text-white shadow-lg hover:bg-neutral-800 ' +
      'dark:bg-white dark:text-black dark:hover:bg-purple-50 transition-colors',
  },

  // --------------------------------------------------------------------------
  // NOIR POSTER
  // Light: High-contrast Newspaper/Ink (Gritty Paper)
  // Dark:  Asphalt/Film Grain (Cinematic)
  // --------------------------------------------------------------------------
  noir_poster: {
    wrap: 'p-1',
    panel:
      'relative rounded-3xl overflow-hidden ' +
      'bg-[#f4f4f5] border border-neutral-300 ' +
      'dark:bg-[#111] dark:border-neutral-800 ' +
      'shadow-xl',
    overlay:
      'absolute inset-0 pointer-events-none z-0 ' +
      // Noise Filter (Simulated Grain)
      'after:absolute after:inset-0 after:opacity-[0.03] dark:after:opacity-[0.05] ' +
      'after:bg-[url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\'/%3E%3C/svg%3E")] ' +
      // Vignette
      'before:absolute before:inset-0 before:bg-gradient-to-tr ' +
      'before:from-black/5 before:to-transparent ' +
      'dark:before:from-black/40 dark:before:via-transparent dark:before:to-white/5',
    label:
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ' +
      'bg-black text-white dark:bg-white dark:text-black border border-transparent',
    title: 'text-black dark:text-white font-serif tracking-tight',
    desc: 'text-neutral-600 dark:text-neutral-400 font-serif',
    stickerPlate:
      'relative rounded-xl border shadow-sm ' +
      'border-neutral-300 bg-white ' +
      'dark:border-neutral-700 dark:bg-neutral-800',
    stickerGlow: 'hidden', // Minimalist
    metaPill:
      'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-bold ' +
      'bg-black text-white hover:bg-neutral-800 ' +
      'dark:bg-white dark:text-black dark:hover:bg-neutral-200 ' +
      'transition-transform hover:-translate-y-0.5',
  },

  // --------------------------------------------------------------------------
  // INDUSTRIAL HAZARD
  // Light: Construction Site (Bright Yellow, Black Stripes)
  // Dark:  Dark Factory (Black Metal, Glowing Warning Lights)
  // --------------------------------------------------------------------------
  industrial_hazard: {
    wrap: 'p-1',
    panel:
      'relative rounded-3xl overflow-hidden ' +
      'bg-[#fefce8] border border-yellow-400 ' +
      'dark:bg-[#0c0a00] dark:border-yellow-500/30 ' +
      'shadow-[0_10px_40px_-10px_rgba(234,179,8,0.15)]',
    overlay:
      'absolute inset-0 pointer-events-none z-0 ' +
      // Caution Stripes (Top Bar)
      'after:absolute after:top-0 after:left-0 after:right-0 after:h-2 ' +
      'after:bg-[repeating-linear-gradient(45deg,#EAB308,#EAB308_10px,transparent_10px,transparent_20px)] ' +
      'dark:after:bg-[repeating-linear-gradient(45deg,#EAB308,#EAB308_10px,#000_10px,#000_20px)] ' +
      // Technical Grid
      'before:absolute before:inset-0 ' +
      'before:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_1px,transparent_1px)] ' +
      'dark:before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] ' +
      'before:bg-[size:20px_20px]',
    label:
      'inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ' +
      'bg-yellow-400 text-black border border-yellow-500 ' +
      'dark:bg-yellow-500 dark:text-black dark:border-yellow-600',
    title: 'text-neutral-900 dark:text-yellow-50 font-mono tracking-tight',
    desc: 'text-neutral-600 dark:text-neutral-400 font-mono text-xs sm:text-sm',
    stickerPlate:
      'relative rounded-lg backdrop-blur-sm ' +
      'border border-yellow-400/50 bg-yellow-50/80 ' +
      'dark:border-yellow-500/30 dark:bg-neutral-900/80',
    stickerGlow:
      'absolute -inset-1 rounded-lg border border-yellow-500/20 bg-yellow-500/10 dark:bg-yellow-500/5',
    metaPill:
      'inline-flex items-center justify-center rounded-sm px-6 py-2.5 text-sm font-bold font-mono uppercase tracking-tight ' +
      'bg-yellow-400 text-black hover:bg-yellow-300 border border-yellow-500 shadow-md transition-colors',
  },

  // --------------------------------------------------------------------------
  // HOLO GLASS
  // Light: Clean Lab (Frosted Acrylic, Iridescent edges)
  // Dark:  Cyber Interface (Dark Glass, Blue edge lighting)
  // --------------------------------------------------------------------------
  holo_glass: {
    wrap: 'p-1',
    panel:
      'relative rounded-3xl overflow-hidden ' +
      'bg-white/60 border border-white/60 shadow-xl ' +
      'dark:bg-neutral-900/60 dark:border-white/10 ' +
      'backdrop-blur-xl',
    overlay:
      'absolute inset-0 pointer-events-none z-0 ' +
      // Iridescent blobs
      'bg-[radial-gradient(at_top_left,rgba(14,165,233,0.1),transparent_50%),radial-gradient(at_bottom_right,rgba(236,72,153,0.1),transparent_50%)] ' +
      // Inner Highlight (Edge Lighting)
      'after:absolute after:inset-0 after:rounded-3xl ' +
      'after:shadow-[inset_0_0_20px_rgba(255,255,255,0.8)] ' +
      'dark:after:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]',
    label:
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ' +
      'bg-white/50 text-neutral-600 border border-white/50 ' +
      'dark:bg-white/10 dark:text-neutral-200 dark:border-white/10 backdrop-blur-md',
    title: 'text-neutral-900 dark:text-white',
    desc: 'text-neutral-600 dark:text-neutral-300',
    stickerPlate:
      'relative rounded-2xl backdrop-blur-lg shadow-lg ' +
      'border border-white/60 bg-white/40 ' +
      'dark:border-white/10 dark:bg-white/5',
    stickerGlow:
      'absolute -inset-4 rounded-full bg-gradient-to-r from-sky-300/30 to-pink-300/30 blur-xl opacity-60 dark:opacity-40',
    metaPill:
      'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold ' +
      'bg-white/80 text-black border border-white/50 hover:bg-white ' +
      'dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/20 ' +
      'transition-all backdrop-blur-md shadow-sm',
  },

  // --------------------------------------------------------------------------
  // CRT TERMINAL
  // Light: Retro Computing (Beige Plastic, Dim Green Screen)
  // Dark:  The Matrix (Black Void, Bright Green Phosphors)
  // --------------------------------------------------------------------------
  crt_terminal: {
    wrap: 'p-1',
    panel:
      'relative rounded-3xl overflow-hidden ' +
      // Light: Beige/Putty casing
      'bg-[#e6e4d5] border border-[#d1d0c5] ' +
      // Dark: Black monitor casing
      'dark:bg-[#0c0c0c] dark:border-emerald-500/30 ' +
      'shadow-xl',
    overlay:
      'absolute inset-0 pointer-events-none z-0 ' +
      // Scanlines (Subtle on light, pronounced on dark)
      'bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(0,0,0,0.03),rgba(0,0,0,0.01),rgba(0,0,0,0.03))] ' +
      'dark:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] ' +
      '[background-size:100%_2px,3px_100%] ' +
      // Vignette
      'after:absolute after:inset-0 after:bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.1)_100%)] dark:after:bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.4)_100%)]',
    label:
      'inline-flex items-center gap-2 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest font-mono ' +
      'bg-[#cfcdc0] text-emerald-800 border border-neutral-400/30 ' +
      'dark:bg-emerald-900/10 dark:text-emerald-500 dark:border-emerald-500/50',
    title: 'font-mono tracking-tighter text-emerald-900 dark:text-emerald-400 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    desc: 'font-mono text-xs text-emerald-800/70 dark:text-emerald-500/70',
    stickerPlate:
      'relative rounded-lg ' +
      'border border-neutral-400/30 bg-[#dcdacb] ' +
      'dark:border-emerald-500/30 dark:bg-black/80',
    stickerGlow: 'hidden',
    metaPill:
      'inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-bold font-mono ' +
      'bg-emerald-700 text-white hover:bg-emerald-800 ' +
      'dark:bg-emerald-600 dark:text-black dark:hover:bg-emerald-500 dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] ' +
      'transition-all shadow-md',
  },

  // --------------------------------------------------------------------------
  // DESERT HIGHWAY
  // Light: Arizona Noon (Warm Orange, Heat Haze)
  // Dark:  Night Drive (Purple Sky, Orange Horizon)
  // --------------------------------------------------------------------------
  desert_highway: {
    wrap: 'p-1',
    panel:
      'relative rounded-3xl overflow-hidden ' +
      // Light: Warm white/sand
      'bg-orange-50/80 border border-orange-200 ' +
      // Dark: Deep night asphalt
      'dark:bg-neutral-900 dark:border-orange-500/20 ' +
      'shadow-2xl',
    overlay:
      'absolute inset-0 pointer-events-none z-0 ' +
      // Gradient: Sun overhead vs Horizon glow
      'bg-[linear-gradient(to_bottom,rgba(255,237,213,0.5),transparent)] ' +
      'dark:bg-[linear-gradient(to_bottom,rgba(88,28,135,0.2),transparent_40%),linear-gradient(to_top,rgba(249,115,22,0.15),transparent_40%)] ' +
      // Noise
      'after:absolute after:inset-0 after:opacity-[0.05] dark:after:opacity-[0.08] ' +
      'after:bg-[url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\'/%3E%3C/svg%3E")]',
    label:
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ' +
      'bg-orange-100 text-orange-700 border border-orange-200 ' +
      'dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-500/20',
    title: 'text-neutral-900 dark:text-white',
    desc: 'text-neutral-600 dark:text-orange-100/70',
    stickerPlate:
      'relative rounded-xl backdrop-blur-md ' +
      'border border-orange-200/50 bg-white/40 ' +
      'dark:border-white/10 dark:bg-white/5',
    stickerGlow:
      'absolute -inset-2 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 opacity-20 dark:opacity-20 blur-lg',
    metaPill:
      'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-bold ' +
      'bg-gradient-to-r from-orange-500 to-red-500 text-white ' +
      'shadow-lg hover:shadow-orange-500/20 transition-all',
  },
}

