"use client"

import * as React from "react"
import { Download, Monitor } from "lucide-react"

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" className={className}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  )
}

function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" className={className}>
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
    </svg>
  )
}

type LinkItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const LINKS: LinkItem[] = [
  { label: "App Store", href: "#", icon: AppleLogo },
  { label: "Play Store", href: "#", icon: GooglePlayLogo },
  { label: "Windows", href: "#", icon: Monitor },
]

export function MobileDownloadBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background/85 to-transparent" />

      <div className="pointer-events-auto mx-auto max-w-5xl px-3 sm:px-4 pb-safe pb-3 sm:pb-4">
        <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-lg shadow-slate-900/10 dark:border-white/10 dark:bg-black/50 dark:shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
          <div className="flex items-stretch divide-x divide-border dark:divide-white/10">
            {LINKS.map((it) => {
              const Icon = it.icon
              return (
                <a
                  key={it.label}
                  href={it.href}
                  className="flex-1 px-2 sm:px-3 py-2.5 sm:py-3 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <span className="grid place-items-center h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-muted/60 border border-border dark:bg-white/5 dark:border-white/10">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground/85 dark:text-white/85" />
                    </span>
                    <div className="text-left min-w-0">
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground leading-none dark:text-white/55">
                        Descargar en
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-foreground leading-tight flex items-center gap-0.5 sm:gap-1 dark:text-white">
                        <span className="truncate">{it.label}</span>
                        <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#5DBCD2]/80 shrink-0" />
                      </div>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
