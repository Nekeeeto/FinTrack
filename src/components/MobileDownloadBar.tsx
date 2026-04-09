"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

/** Barra fija en móvil: CTA principal a la web (sin enlaces falsos a tiendas). */
export function MobileDownloadBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/90 to-transparent" />

      <div className="pointer-events-auto mx-auto max-w-5xl px-3 sm:px-4 pb-safe pb-3 sm:pb-4">
        <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-lg shadow-slate-900/10 dark:border-white/10 dark:bg-black/55 dark:shadow-[0_25px_80px_rgba(0,0,0,0.65)] p-3 sm:p-3.5">
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#020617] py-3 text-sm font-bold text-white active:scale-[0.98] transition-transform dark:bg-[#5DBCD2] dark:text-black"
          >
            Empezá en la web
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
          <p className="mt-2 text-center text-[10px] text-muted-foreground leading-snug px-1">
            App Store y Google Play: próximamente
          </p>
        </div>
      </div>
    </div>
  )
}
