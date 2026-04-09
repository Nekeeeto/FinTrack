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
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mcHub" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5DBCD2" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#5DBCD2" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Connecting Lines */}
      <path d="M50 60 Q100 20 150 60" className="stroke-muted-foreground/20 dark:stroke-white/10" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      <path d="M50 60 Q100 100 150 60" className="stroke-muted-foreground/20 dark:stroke-white/10" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      
      {/* Animated Particles */}
      <circle cx="0" cy="0" r="2" fill={ACCENT}>
        <animateMotion path="M50 60 Q100 20 150 60" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="0" cy="0" r="2" fill="#10b981">
        <animateMotion path="M150 60 Q100 100 50 60" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* Center Hub */}
      <circle cx="100" cy="60" r="28" fill="url(#mcHub)" />
      <circle cx="100" cy="60" r="18" className="fill-background stroke-border dark:fill-[#0b1220] dark:stroke-white/10" strokeWidth="1.5" />
      <path d="M94 56h12M94 64h12M100 50v20" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />

      {/* UYU Node */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="3s" repeatCount="indefinite" />
        <rect x="30" y="45" width="40" height="30" rx="8" className="fill-background stroke-border dark:fill-[#0b1220] dark:stroke-white/10" strokeWidth="1.5" />
        <text x="50" y="64" textAnchor="middle" className="fill-foreground/70 dark:fill-white/70" style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: 600 }}>UYU</text>
      </g>

      {/* USD Node */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,4; 0,0" dur="3.5s" repeatCount="indefinite" />
        <rect x="130" y="45" width="40" height="30" rx="8" className="fill-background stroke-border dark:fill-[#0b1220] dark:stroke-white/10" strokeWidth="1.5" />
        <text x="150" y="64" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: 600 }}>USD</text>
      </g>
    </svg>
  )
}

export function FeatureIllustrationAlerts({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Phone Frame */}
      <rect x="65" y="10" width="70" height="120" rx="12" className="fill-muted/20 stroke-border dark:fill-white/[0.02] dark:stroke-white/10" strokeWidth="1.5" />
      <rect x="90" y="16" width="20" height="4" rx="2" className="fill-muted-foreground/20 dark:fill-white/10" />
      
      {/* UI Lines */}
      <rect x="75" y="30" width="50" height="6" rx="3" className="fill-muted-foreground/10 dark:fill-white/5" />
      <rect x="75" y="42" width="30" height="4" rx="2" className="fill-muted-foreground/10 dark:fill-white/5" />

      {/* Animated Notification 1 (Warning) */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,10; 0,0; 0,0; 0,-10" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0; 1; 1; 0" dur="4s" repeatCount="indefinite" />
        <rect x="55" y="55" width="90" height="28" rx="8" className="fill-background stroke-amber-500/30 dark:fill-[#0b1220] dark:stroke-amber-500/40" strokeWidth="1.5" />
        <rect x="56" y="56" width="88" height="26" rx="7" fill="url(#alertGrad)" />
        <circle cx="70" cy="69" r="6" className="fill-amber-500/20" />
        <path d="M70 66v4M70 72v.5" className="stroke-amber-500" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="82" y="64" width="45" height="4" rx="2" className="fill-amber-600/60 dark:fill-amber-400/80" />
        <rect x="82" y="72" width="30" height="3" rx="1.5" className="fill-amber-600/40 dark:fill-amber-400/50" />
      </g>

      {/* Animated Notification 2 (Danger) */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,10; 0,0; 0,0; 0,-10" dur="4s" repeatCount="indefinite" begin="2s" />
        <animate attributeName="opacity" values="0; 1; 1; 0" dur="4s" repeatCount="indefinite" begin="2s" />
        <rect x="55" y="55" width="90" height="28" rx="8" className="fill-background stroke-red-500/30 dark:fill-[#0b1220] dark:stroke-red-500/40" strokeWidth="1.5" />
        <circle cx="70" cy="69" r="6" className="fill-red-500/20" />
        <path d="M68 69a2 2 0 0 1 4 0c0 1.5-2 3-2 3s-2-1.5-2-3z" className="stroke-red-500" strokeWidth="1.2" />
        <rect x="82" y="64" width="50" height="4" rx="2" className="fill-red-600/60 dark:fill-red-400/80" />
        <rect x="82" y="72" width="25" height="3" rx="1.5" className="fill-red-600/40 dark:fill-red-400/50" />
      </g>
    </svg>
  )
}

export function FeatureIllustrationCloud({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5DBCD2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5DBCD2" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="serverGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Background Grid/Rings */}
      <circle cx="100" cy="60" r="45" className="stroke-muted-foreground/10 dark:stroke-white/5" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy="60" r="30" className="stroke-muted-foreground/10 dark:stroke-white/5" strokeWidth="1" strokeDasharray="4 4" />

      {/* Data Streams */}
      <path d="M88 75 v-25" className="stroke-[#5DBCD2]/40" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round" />
      <path d="M100 75 v-35" className="stroke-[#5DBCD2]/60" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round" />
      <path d="M112 75 v-25" className="stroke-[#5DBCD2]/40" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round" />

      {/* Animated Packets */}
      <circle cx="88" cy="75" r="1.5" fill={ACCENT}>
        <animate attributeName="cy" values="75;50" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="75" r="2" fill={ACCENT}>
        <animate attributeName="cy" values="75;40" dur="2s" repeatCount="indefinite" begin="0.5s" />
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle cx="112" cy="75" r="1.5" fill={ACCENT}>
        <animate attributeName="cy" values="75;50" dur="1.8s" repeatCount="indefinite" begin="1s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="1s" />
      </circle>

      {/* Cloud (Floating) */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="3.5s" repeatCount="indefinite" />
        <g transform="translate(66, 12) scale(2.8)">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="url(#cloudGrad)" stroke="#5DBCD2" strokeWidth="0.75" strokeLinejoin="round" />
        </g>
        {/* Cloud Core Glow */}
        <circle cx="100" cy="38" r="6" fill={ACCENT} opacity="0.2">
          <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="38" r="3" fill={ACCENT} opacity="0.8" />
      </g>

      {/* Server Rack (Bottom) */}
      <g transform="translate(70, 75)" className="text-slate-600 dark:text-slate-400">
        {/* Server 1 */}
        <rect x="0" y="0" width="60" height="12" rx="3" fill="url(#serverGrad)" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="6" r="1.5" fill="#5DBCD2">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <line x1="16" y1="6" x2="52" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

        {/* Server 2 */}
        <rect x="0" y="16" width="60" height="12" rx="3" fill="url(#serverGrad)" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="22" r="1.5" fill="#10b981">
          <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <line x1="16" y1="22" x2="52" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </g>
    </svg>
  )
}

export function FeatureIllustrationPwa({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pwaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5DBCD2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5DBCD2" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Phone Frame */}
      <rect x="60" y="10" width="80" height="130" rx="14" className="fill-muted/10 stroke-border dark:fill-white/[0.02] dark:stroke-white/10" strokeWidth="1.5" />
      
      {/* Screen Content */}
      <rect x="66" y="16" width="68" height="118" rx="10" className="fill-background dark:fill-[#0b1220]" />
      
      {/* App Grid */}
      <g className="fill-muted-foreground/10 dark:fill-white/5">
        <rect x="74" y="26" width="12" height="12" rx="3" />
        <rect x="94" y="26" width="12" height="12" rx="3" />
        <rect x="114" y="26" width="12" height="12" rx="3" />
        
        <rect x="74" y="46" width="12" height="12" rx="3" />
        {/* Center is Platita */}
        <rect x="114" y="46" width="12" height="12" rx="3" />
        
        <rect x="74" y="66" width="12" height="12" rx="3" />
        <rect x="94" y="66" width="12" height="12" rx="3" />
        <rect x="114" y="66" width="12" height="12" rx="3" />
      </g>

      {/* Platita App Icon */}
      <g>
        <animateTransform attributeName="transform" type="scale" values="1; 1.15; 1" dur="2s" repeatCount="indefinite" transformOrigin="100 52" />
        <rect x="94" y="46" width="12" height="12" rx="3" fill={ACCENT} />
        <path d="M98 52h4M100 50v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="100" cy="52" r="10" fill={ACCENT} opacity="0.3">
          <animate attributeName="r" values="10; 18; 10" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3; 0; 0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Install Prompt */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,20; 0,0; 0,0; 0,20" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0; 1; 1; 0" dur="4s" repeatCount="indefinite" />
        <rect x="70" y="90" width="60" height="24" rx="6" className="fill-card stroke-border dark:fill-slate-800 dark:stroke-white/20" strokeWidth="1" />
        <rect x="70" y="90" width="60" height="24" rx="6" fill="url(#pwaGrad)" />
        <path d="M80 102h16M88 98v8" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="115" cy="102" r="4" className="fill-[#5DBCD2]/20" />
        <path d="M113 102l1.5 1.5 2.5-2.5" stroke={ACCENT} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

export function FeatureIllustrationSecurity({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="secGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Background Grid/Rings */}
      <circle cx="100" cy="60" r="40" className="stroke-emerald-500/10 dark:stroke-emerald-500/20" strokeWidth="1" strokeDasharray="2 4">
        <animateTransform attributeName="transform" type="rotate" values="0 100 60; 360 100 60" dur="20s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="60" r="55" className="stroke-emerald-500/10 dark:stroke-emerald-500/20" strokeWidth="1" strokeDasharray="4 6">
        <animateTransform attributeName="transform" type="rotate" values="360 100 60; 0 100 60" dur="25s" repeatCount="indefinite" />
      </circle>

      {/* Shield */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="3s" repeatCount="indefinite" />
        <path d="M100 25 L135 38 V65 C135 88 100 105 100 105 C100 105 65 88 65 65 V38 Z" fill="url(#secGrad)" className="stroke-emerald-500" strokeWidth="2" strokeLinejoin="round" />
        
        {/* Inner Shield Glow */}
        <path d="M100 25 L135 38 V65 C135 88 100 105 100 105 C100 105 65 88 65 65 V38 Z" fill="#10b981" opacity="0.2">
          <animate attributeName="opacity" values="0.1; 0.4; 0.1" dur="2s" repeatCount="indefinite" />
        </path>

        {/* Checkmark */}
        <path d="M85 62 L95 72 L115 50" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-emerald-50">
          <animate attributeName="stroke-dasharray" values="0,100; 100,0; 100,0" dur="3s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Floating Data Nodes */}
      <circle cx="65" cy="30" r="3" fill="#10b981">
        <animate attributeName="opacity" values="0.2; 1; 0.2" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="135" cy="80" r="2" fill="#10b981">
        <animate attributeName="opacity" values="0.2; 1; 0.2" dur="2s" repeatCount="indefinite" begin="0.5s" />
      </circle>
    </svg>
  )
}

export function FeatureIllustrationPrivacy({ className }: Props) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="privGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5DBCD2" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#5DBCD2" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="privShield" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5DBCD2" stopOpacity="0" />
          <stop offset="50%" stopColor="#5DBCD2" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5DBCD2" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background Document / Data */}
      <rect x="65" y="25" width="70" height="70" rx="8" className="fill-background stroke-border dark:fill-[#0b1220] dark:stroke-white/10" strokeWidth="1.5" />
      <rect x="65" y="25" width="70" height="70" rx="8" fill="url(#privGrad)" />
      
      <rect x="75" y="40" width="35" height="4" rx="2" className="fill-muted-foreground/30 dark:fill-white/20" />
      <rect x="75" y="52" width="50" height="4" rx="2" className="fill-muted-foreground/30 dark:fill-white/20" />
      <rect x="75" y="64" width="40" height="4" rx="2" className="fill-muted-foreground/30 dark:fill-white/20" />
      <rect x="75" y="76" width="25" height="4" rx="2" className="fill-muted-foreground/30 dark:fill-white/20" />

      {/* Protective Barrier (Forcefield) */}
      <path d="M40 10 Q100 50 40 110" stroke="url(#privShield)" strokeWidth="3" fill="none">
        <animate attributeName="opacity" values="0.3; 1; 0.3" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M160 10 Q100 50 160 110" stroke="url(#privShield)" strokeWidth="3" fill="none">
        <animate attributeName="opacity" values="0.3; 1; 0.3" dur="2s" repeatCount="indefinite" begin="1s" />
      </path>

      {/* Deflected Trackers (Red dots) */}
      <g>
        <circle cx="20" cy="40" r="3" className="fill-red-500">
          <animateTransform attributeName="transform" type="translate" values="0,0; 30,10; 0,0" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0; 1; 0" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="80" r="2.5" className="fill-red-500">
          <animateTransform attributeName="transform" type="translate" values="0,0; -30,-10; 0,0" dur="2s" repeatCount="indefinite" begin="0.5s" />
          <animate attributeName="opacity" values="0; 1; 0" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </circle>
      </g>

      {/* Center Lock */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="3s" repeatCount="indefinite" />
        <rect x="88" y="50" width="24" height="18" rx="4" fill={ACCENT} />
        <path d="M94 50 V43 A6 6 0 0 1 106 43 V50" stroke={ACCENT} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="100" cy="59" r="2" className="fill-background dark:fill-[#020617]" />
        <path d="M100 61 v3" className="stroke-background dark:stroke-[#020617]" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Lock Glow */}
        <circle cx="100" cy="55" r="20" fill={ACCENT} opacity="0.2">
          <animate attributeName="r" values="20; 30; 20" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2; 0; 0.2" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  )
}
