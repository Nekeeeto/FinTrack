"use client"

import { ArrowUpRight, Mic, Receipt, RefreshCcw, Sparkles } from "lucide-react"

/** Hero: widget de balance central con píldoras flotantes (minimalista, pro, glassmorphism). */
export function HeroSpendScene() {
  return (
    <div
      className="relative mx-auto mb-16 mt-8 w-full max-w-2xl px-2 sm:mb-24 sm:px-6"
      role="img"
      aria-label="Ilustración: dashboard minimalista con balance total y notificaciones flotantes de gastos por voz, escaneo y cambio de moneda."
    >
      {/* Resplandor de fondo */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5DBCD2]/20 blur-[100px] dark:bg-[#5DBCD2]/15 dark:blur-[120px]" />

      {/* Tarjeta central (Balance) */}
      <div className="relative z-10 mx-auto w-full max-w-[320px] rounded-[2.5rem] border border-border/50 bg-background/40 p-6 shadow-2xl backdrop-blur-2xl sm:max-w-[360px] sm:p-8 dark:border-white/10 dark:bg-[#020617]/40 dark:shadow-[0_0_80px_rgba(93,188,210,0.15)]">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5DBCD2]/20">
              <span className="text-sm font-bold text-[#5DBCD2]">$</span>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">
              Mi Billetera
            </span>
          </div>
          <Sparkles className="h-4 w-4 animate-pulse text-[#5DBCD2]" />
        </div>

        <div className="space-y-2 text-left">
          <h3 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
            $ 142.500
          </h3>
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
              <ArrowUpRight className="h-3 w-3" />
            </div>
            <span>+12.5% este mes</span>
          </div>
        </div>

        {/* Mini gráfico SVG */}
        <div className="mt-8 h-20 w-full">
          <svg
            viewBox="0 0 200 60"
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5DBCD2" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#5DBCD2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 50 Q 20 45, 40 50 T 80 30 T 120 40 T 160 15 T 200 5 L 200 60 L 0 60 Z"
              fill="url(#chartGrad)"
            />
            <path
              d="M0 50 Q 20 45, 40 50 T 80 30 T 120 40 T 160 15 T 200 5"
              fill="none"
              stroke="#5DBCD2"
              strokeWidth="3"
              strokeLinecap="round"
              className="drop-shadow-[0_4px_6px_rgba(93,188,210,0.5)]"
            />
            <circle
              cx="200"
              cy="5"
              r="4"
              fill="#020617"
              stroke="#5DBCD2"
              strokeWidth="2"
              className="dark:fill-white"
            />
          </svg>
        </div>
      </div>

      {/* Píldora flotante 1: Voz */}
      <div className="hero-badge-float absolute -left-2 top-[10%] z-20 flex items-center gap-3 rounded-2xl border border-border bg-background/90 p-3 shadow-xl backdrop-blur-xl sm:-left-12 sm:top-[15%] dark:border-white/10 dark:bg-[#0a101a]/90">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/15">
          <Mic className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-medium italic text-muted-foreground">
            "Bizcochos y yerba cuatrocientos"
          </p>
          <p className="text-sm font-bold text-foreground">🧉 -$400</p>
        </div>
      </div>

      {/* Píldora flotante 2: Escaneo */}
      <div
        className="hero-badge-float absolute -right-2 top-[45%] z-20 flex items-center gap-3 rounded-2xl border border-border bg-background/90 p-3 shadow-xl backdrop-blur-xl sm:-right-12 sm:top-[40%] dark:border-white/10 dark:bg-[#0a101a]/90"
        style={{ animationDelay: "1s" }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/50 bg-white">
          <img src="/tata-logo.png" alt="Ta-Ta" className="h-full w-full object-cover" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-medium text-muted-foreground">
            Ticket Ta-Ta
          </p>
          <p className="text-sm font-bold text-foreground">🛒 -$3.450</p>
        </div>
      </div>

      {/* Píldora flotante 3: Multimoneda */}
      <div
        className="hero-badge-float absolute -bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-border bg-background/90 px-4 py-3 shadow-xl backdrop-blur-xl sm:-bottom-8 dark:border-white/10 dark:bg-[#0a101a]/90"
        style={{ animationDelay: "2s" }}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/15">
          <RefreshCcw className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-medium text-muted-foreground">
            Cotización BROU
          </p>
          <p className="text-sm font-bold text-foreground">US$ 1 = $ 39.20</p>
        </div>
      </div>
    </div>
  )
}
