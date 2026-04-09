/**
 * Ilustraciones SVG para la grilla de features de la landing (Platita).
 * Incluyen animaciones suaves vía SMIL; respetan prefers-reduced-motion en CSS.
 */

import type { ReactNode } from "react"

type Props = { className?: string }

/** Marco común para cada ilustración (altura fija, borde, fondo). */
export function FeatureIllustrationFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="feature-illustration relative mb-6 flex min-h-[124px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-linear-to-b from-muted/45 to-muted/15 px-2 py-3 dark:from-white/[0.07] dark:to-black/25"
      aria-hidden
    >
      <div className="flex h-[108px] w-full max-w-[min(100%,240px)] items-center justify-center [&>svg]:max-h-[108px] [&>svg]:w-full [&>svg]:max-w-[220px]">
        {children}
      </div>
    </div>
  )
}

const ACCENT = "#5DBCD2"

export function FeatureIllustrationMulticurrency({ className }: Props) {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        x="8"
        y="18"
        width="184"
        height="84"
        rx="14"
        className="fill-muted/40 stroke-border dark:fill-white/[0.06] dark:stroke-white/10"
        strokeWidth="1.2"
      />
      <circle cx="52" cy="60" r="22" className="fill-[#5DBCD2]/15 stroke-[#5DBCD2]/50" strokeWidth="1.5" />
      <text
        x="52"
        y="67"
        textAnchor="middle"
        fill={ACCENT}
        style={{ fontFamily: "system-ui, sans-serif", fontSize: 17, fontWeight: 700 }}
      >
        $
      </text>
      <circle cx="100" cy="60" r="22" className="fill-foreground/5 stroke-border dark:stroke-white/15" strokeWidth="1.5" />
      <text
        x="100"
        y="65"
        textAnchor="middle"
        className="fill-foreground/70 dark:fill-white/70"
        style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: 600 }}
      >
        UYU
      </text>
      <circle cx="148" cy="60" r="22" className="fill-emerald-500/10 stroke-emerald-500/40" strokeWidth="1.5" />
      <text
        x="148"
        y="65"
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400"
        style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: 600 }}
      >
        USD
      </text>
      <path
        d="M74 60h20M126 60h20"
        className="stroke-muted-foreground/40"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 4"
      />
      <circle cx="100" cy="60" r="3" fill={ACCENT}>
        <animate attributeName="opacity" values="0.35;1;0.35" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export function FeatureIllustrationAlerts({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <rect
        x="44"
        y="16"
        width="112"
        height="88"
        rx="12"
        className="fill-muted/30 stroke-border dark:fill-white/[0.05] dark:stroke-white/12"
        strokeWidth="1.2"
      />
      <rect x="56" y="28" width="88" height="6" rx="3" className="fill-foreground/10 dark:fill-white/10" />
      <rect x="56" y="42" width="64" height="4" rx="2" className="fill-foreground/8 dark:fill-white/8" />
      <rect
        x="56"
        y="58"
        width="72"
        height="24"
        rx="4"
        className="fill-[#5DBCD2]/10 stroke-[#5DBCD2]/35"
        strokeWidth="1"
      />
      <rect x="24" y="52" width="92" height="28" rx="8" className="fill-amber-500/15 stroke-amber-500/35" strokeWidth="1" />
      <path
        d="M36 64v-2a6 6 0 0 1 12 0v2M42 70h6"
        className="stroke-amber-600 dark:stroke-amber-400"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <text
        x="54"
        y="72"
        fill="#9a3412"
        style={{ fontFamily: "system-ui, sans-serif", fontSize: 8, fontWeight: 600 }}
      >
        Presupuesto
      </text>
      <rect x="108" y="72" width="76" height="26" rx="8" className="fill-red-500/12 stroke-red-500/35" strokeWidth="1" />
      <path
        d="M120 85h6M123 82v6"
        className="stroke-red-500 dark:stroke-red-400"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text
        x="132"
        y="90"
        className="fill-red-700 dark:fill-red-300"
        style={{ fontFamily: "system-ui, sans-serif", fontSize: 7, fontWeight: 500 }}
      >
        Vence hoy
      </text>
      <circle cx="100" cy="38" r="2.5" fill={ACCENT} opacity="0.9">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export function FeatureIllustrationCloud({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="78" rx="52" ry="18" className="fill-muted/50 stroke-border dark:fill-white/[0.08] dark:stroke-white/12" strokeWidth="1.2" />
      <circle cx="78" cy="72" r="16" className="fill-muted/50 dark:fill-white/[0.08]" />
      <circle cx="100" cy="64" r="20" className="fill-muted/50 dark:fill-white/[0.08]" />
      <circle cx="124" cy="70" r="14" className="fill-muted/50 dark:fill-white/[0.08]" />
      <rect x="72" y="88" width="56" height="20" rx="4" className="fill-[#5DBCD2]/12 stroke-[#5DBCD2]/40" strokeWidth="1" />
      <path d="M88 98h24M88 102h16" className="stroke-[#5DBCD2]/70" strokeWidth="1.2" strokeLinecap="round" />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-4; 0,0"
          dur="2.5s"
          repeatCount="indefinite"
        />
        <path
          d="M100 28v12M94 34l6-6 6 6"
          stroke={ACCENT}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <circle cx="100" cy="34" r="3" fill={ACCENT} opacity="0.85">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export function FeatureIllustrationPwa({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <rect
        x="56"
        y="12"
        width="88"
        height="96"
        rx="14"
        className="fill-muted/35 stroke-border dark:fill-white/[0.06] dark:stroke-white/12"
        strokeWidth="1.4"
      />
      <rect x="68" y="22" width="64" height="8" rx="4" className="fill-foreground/10 dark:fill-black/40" />
      <circle cx="100" cy="26" r="2" className="fill-foreground/20" />
      <rect x="64" y="38" width="72" height="58" rx="6" className="fill-background dark:fill-[#0b1220] stroke-border/80 dark:stroke-white/10" strokeWidth="1" />
      <rect x="72" y="46" width="18" height="18" rx="4" className="fill-[#5DBCD2]/25 stroke-[#5DBCD2]/50" strokeWidth="1" />
      <rect x="96" y="46" width="18" height="18" rx="4" className="fill-foreground/8 dark:fill-white/8" />
      <rect x="120" y="46" width="18" height="18" rx="4" className="fill-foreground/8 dark:fill-white/8" />
      <rect x="72" y="70" width="18" height="18" rx="4" className="fill-foreground/8 dark:fill-white/8" />
      <rect x="96" y="70" width="18" height="18" rx="4" className="fill-foreground/8 dark:fill-white/8" />
      <rect x="120" y="70" width="18" height="18" rx="4" className="fill-foreground/8 dark:fill-white/8" />
      <path
        d="M154 88l8 8-8 8"
        className="stroke-[#5DBCD2]"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate attributeName="opacity" values="0.35;1;0.35" dur="2s" repeatCount="indefinite" />
      </path>
      <text
        x="100"
        y="108"
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontFamily: "system-ui, sans-serif", fontSize: 8 }}
      >
        Pantalla de inicio
      </text>
    </svg>
  )
}

export function FeatureIllustrationSecurity({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 18l36 14v28c0 22-15 38-36 46-21-8-36-24-36-46V32l36-14z"
        className="fill-emerald-500/10 stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M88 58l8 8 18-18"
        className="stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="78" y="78" width="44" height="32" rx="6" className="fill-muted/40 stroke-border dark:fill-white/[0.06] dark:stroke-white/15" strokeWidth="1.2" />
      <path
        d="M100 88v10M94 94h12"
        className="stroke-foreground/50 dark:stroke-white/50"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="100" cy="54" r="2" fill={ACCENT} opacity="0.9">
        <animate attributeName="r" values="2;3;2" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export function FeatureIllustrationPrivacy({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <rect
        x="48"
        y="28"
        width="104"
        height="72"
        rx="12"
        className="fill-muted/30 stroke-border dark:fill-white/[0.05] dark:stroke-white/12"
        strokeWidth="1.2"
      />
      <rect x="72" y="52" width="56" height="40" rx="6" className="fill-foreground/8 dark:fill-white/10 stroke-foreground/25 dark:stroke-white/25" strokeWidth="1.5" />
      <path
        d="M100 52V44a12 12 0 0 0-24 0v8"
        className="stroke-foreground/50 dark:stroke-white/55"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="72" r="6" className="fill-[#5DBCD2]/20 stroke-[#5DBCD2]" strokeWidth="1.5" />
      <path d="M97 72l2 2 5-5" className="stroke-[#5DBCD2]" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M60 36h80M68 40h20"
        className="stroke-muted-foreground/30"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <text
        x="100"
        y="100"
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontFamily: "system-ui, sans-serif", fontSize: 8, fontWeight: 500 }}
      >
        Sin ads · tus datos
      </text>
    </svg>
  )
}
