"use client"

import Link from "next/link"
import * as React from "react"
import { ArrowRight } from "lucide-react"
import { LandingThemeSwitch } from "@/components/LandingThemeSwitch"

export function PublicStickyHeader() {
  const [visible, setVisible] = React.useState(true)
  const [scrolled, setScrolled] = React.useState(false)
  const lastYRef = React.useRef(0)

  React.useEffect(() => {
    lastYRef.current = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const lastY = lastYRef.current
      lastYRef.current = y

      setScrolled(y > 32)

      if (y < 24) {
        setVisible(true)
        return
      }

      const delta = y - lastY
      if (Math.abs(delta) < 6) return

      if (delta > 0) setVisible(false)
      else setVisible(true)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={[
        "fixed left-0 right-0 top-0 z-50",
        "transition-all duration-300 ease-out",
        visible ? "translate-y-0" : "-translate-y-full",
      ].join(" ")}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5 pb-2 sm:pb-3">
        <div
          className={[
            "mx-auto w-full rounded-full border backdrop-blur-md px-3 py-2 flex items-center justify-between transition-all duration-300",
            scrolled
              ? "border-slate-200/80 bg-white/75 shadow-[0_12px_50px_rgba(15,23,42,0.08)] dark:border-white/15 dark:bg-black/55 dark:shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
              : "border-slate-200/60 bg-white/60 shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-black/35 dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 px-1 sm:px-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#5DBCD2]/20 text-[#5DBCD2] font-semibold text-sm">
              $
            </span>
            <span className="text-sm font-semibold text-foreground/90">PLATITA</span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs text-muted-foreground">
            <a className="hover:text-foreground transition-colors" href="#features">
              Características
            </a>
            <a className="hover:text-foreground transition-colors" href="#pricing">
              Precios
            </a>
            <a className="hover:text-foreground transition-colors" href="#faq">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LandingThemeSwitch />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#5DBCD2]/90 px-3.5 sm:px-4 py-2 text-xs font-semibold text-black hover:bg-[#5DBCD2] transition-colors active:scale-[0.97]"
            >
              <span className="hidden sm:inline">Iniciar sesión</span>
              <span className="sm:hidden">Entrar</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
