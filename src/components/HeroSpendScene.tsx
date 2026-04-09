"use client"

import { Bike, Coins, QrCode, Wallet } from "lucide-react"

const BADGES: { label: string; sub: string; Icon: typeof Bike; delay: string; className: string }[] = [
  {
    label: "Delivery",
    sub: "Pedidos Ya · apps",
    Icon: Bike,
    delay: "0s",
    className:
      "border-orange-500/25 bg-orange-500/10 text-orange-800 dark:text-orange-200 dark:border-orange-400/30 dark:bg-orange-500/15",
  },
  {
    label: "Mercado Pago",
    sub: "QR · billetera",
    Icon: QrCode,
    delay: "0.35s",
    className:
      "border-sky-500/25 bg-sky-500/10 text-sky-900 dark:text-sky-100 dark:border-sky-400/30 dark:bg-sky-500/15",
  },
  {
    label: "Efectivo",
    sub: "Caja · almacén",
    Icon: Wallet,
    delay: "0.7s",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/15",
  },
  {
    label: "Dólares",
    sub: "Ahorro · cambio",
    Icon: Coins,
    delay: "1.05s",
    className:
      "border-amber-400/35 bg-amber-400/15 text-amber-950 dark:text-amber-100 dark:border-amber-300/35 dark:bg-amber-400/10",
  },
]

/** Hero: lata / alcancía + píldoras de gasto típicos (sin logotipos de terceros). */
export function HeroSpendScene() {
  return (
    <div
      className="mx-auto mb-8 max-w-2xl px-1 sm:mb-10"
      role="img"
      aria-label="Ilustración: delivery, pagos con QR, efectivo y dólares reunidos en un solo registro, como una alcancía."
    >
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
        Un solo lugar para todo lo que gastás
      </p>

      <div className="relative mx-auto mt-5 flex h-[min(200px,42vw)] max-h-[220px] min-h-[160px] w-full max-w-md items-center justify-center sm:mt-6 sm:h-[220px] sm:max-h-none">
        {/* anillo decorativo */}
        <div
          className="pointer-events-none absolute inset-[8%] rounded-full border border-dashed border-[#5DBCD2]/20 dark:border-[#5DBCD2]/25 hero-orbit-spin"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-[18%] rounded-full border border-[#5DBCD2]/10 opacity-60 dark:opacity-80 hero-orbit-spin-reverse"
          aria-hidden
        />

        {/* monedas flotando detrás */}
        <span
          className="pointer-events-none absolute left-[12%] top-[18%] h-7 w-7 rounded-full bg-linear-to-br from-amber-300 to-amber-600 opacity-80 shadow-md hero-coin-float"
          style={{ animationDelay: "0.2s" }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute right-[14%] top-[22%] h-5 w-5 rounded-full bg-linear-to-br from-slate-200 to-slate-400 opacity-90 shadow hero-coin-float"
          style={{ animationDelay: "0.8s" }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute bottom-[20%] left-[20%] h-4 w-4 rounded-full bg-[#5DBCD2]/40 blur-[1px] hero-coin-float"
          style={{ animationDelay: "1.1s" }}
          aria-hidden
        />

        {/* lata / alcancía */}
        <div className="relative z-10 hero-can-wobble" style={{ transformStyle: "preserve-3d" }}>
          <div className="relative drop-shadow-[0_20px_40px_rgba(93,188,210,0.25)] dark:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
            <svg
              width="120"
              height="168"
              viewBox="0 0 120 168"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-[140px] w-[min(100px,26vw)] sm:h-[168px] sm:w-[120px]"
              aria-hidden
            >
              <defs>
                <linearGradient id="heroCanBody" x1="0" y1="60" x2="120" y2="60" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#475569" />
                  <stop offset="0.32" stopColor="#cbd5e1" />
                  <stop offset="0.55" stopColor="#64748b" />
                  <stop offset="1" stopColor="#334155" />
                </linearGradient>
                <linearGradient id="heroCanShine" x1="60" y1="48" x2="60" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#5DBCD2" stopOpacity="0.38" />
                  <stop offset="1" stopColor="#5DBCD2" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* tapa elipse */}
              <ellipse cx="60" cy="36" rx="38" ry="14" className="fill-slate-500 dark:fill-slate-600" />
              <ellipse cx="60" cy="34" rx="34" ry="11" className="fill-slate-400/90 dark:fill-slate-500" />
              {/* cuerpo */}
              <path
                d="M22 40c0-4 17-8 38-8s38 4 38 8v108c0 6-17 12-38 12S22 154 22 148V40z"
                fill="url(#heroCanBody)"
              />
              <path d="M26 48h68v92H26z" fill="url(#heroCanShine)" opacity="0.9" />
              {/* ranura */}
              <rect x="34" y="52" width="52" height="7" rx="3.5" className="fill-slate-800/80 dark:fill-black/50" />
              <rect x="36" y="53.5" width="48" height="4" rx="2" className="fill-slate-950/60 dark:fill-black/40" />
              {/* $ */}
              <text
                x="60"
                y="118"
                textAnchor="middle"
                fill="#5DBCD2"
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 44,
                  fontWeight: 800,
                  opacity: 0.92,
                }}
              >
                $
              </text>
              {/* brillo lateral */}
              <path
                d="M28 52c8-2 16-3 24-3v90c-8 0-16-1-24-3V52z"
                className="fill-white/25 dark:fill-white/10"
              />
            </svg>
            {/* resplandor */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-[#5DBCD2]/15 blur-2xl hero-can-glow" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-3">
        {BADGES.map(({ label, sub, Icon, delay, className }) => (
          <div
            key={label}
            className={`hero-badge-float flex flex-col items-center gap-1 rounded-2xl border px-2.5 py-2.5 text-center sm:px-3 sm:py-3 ${className}`}
            style={{ animationDelay: delay }}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90 sm:h-[18px] sm:w-[18px]" strokeWidth={2.2} />
            <span className="text-[11px] font-bold leading-tight sm:text-xs">{label}</span>
            <span className="text-[9px] font-medium leading-tight opacity-80 sm:text-[10px]">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
