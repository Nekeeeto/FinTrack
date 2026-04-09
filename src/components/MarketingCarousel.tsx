"use client"

import * as React from "react"
import { Mic, Receipt, Wallet, ChevronLeft, ChevronRight } from "lucide-react"
import { LANDING_CONTAINER, LANDING_SECTION_Y } from "@/lib/landing-layout"

type Item = {
  kicker: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  image?: string
}

const ITEMS: Item[] = [
  {
    kicker: "Multicuenta",
    title: "Balance centralizado",
    description:
      "Manejá efectivo, tarjetas y ahorros en un único panel con tu saldo al instante.",
    icon: Wallet,
    image: "/dash-ui.png",
  },
  {
    kicker: "Comodidad",
    title: "Registro por voz",
    description:
      "Decí tu gasto y Platita lo registra y categoriza por vos automáticamente.",
    icon: Mic,
    image: "/voice-ui.png",
  },
  {
    kicker: "Inteligencia",
    title: "Lectura de tickets",
    description:
      "Sacá una foto de tu factura y la IA extrae los montos en milisegundos.",
    icon: Receipt,
  },
]

export function MarketingCarousel() {
  const trackRef = React.useRef<HTMLDivElement | null>(null)
  const [active, setActive] = React.useState(0)

  const scrollTo = React.useCallback((idx: number) => {
    const track = trackRef.current
    if (!track) return
    const children = Array.from(track.children) as HTMLElement[]
    const el = children[idx]
    if (!el) return
    track.scrollTo({ left: el.offsetLeft, behavior: "smooth" })
  }, [])

  const prev = React.useCallback(() => {
    const newIdx = (active - 1 + ITEMS.length) % ITEMS.length
    setActive(newIdx)
    scrollTo(newIdx)
  }, [active, scrollTo])

  const next = React.useCallback(() => {
    const newIdx = (active + 1) % ITEMS.length
    setActive(newIdx)
    scrollTo(newIdx)
  }, [active, scrollTo])

  React.useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const children = Array.from(track.children) as HTMLElement[]
    if (children.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]
        if (!best) return
        const idx = children.indexOf(best.target as HTMLElement)
        if (idx >= 0) setActive(idx)
      },
      { root: track, threshold: [0.6, 0.8] }
    )

    for (const el of children) io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="relative overflow-hidden bg-background">
      <div className={`${LANDING_CONTAINER} ${LANDING_SECTION_Y}`}>
        <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-14 items-center">
          <div className="reveal order-2 md:order-1 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              Todo lo que necesitás para{" "}
              <span className="text-[#5DBCD2]">controlar tus finanzas</span>
            </h2>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto md:mx-0">
              Platita te ahorra tiempo: registrás, categorizás y analizás sin fricción
              desde el navegador. Nosotros ordenamos, vos tomás mejores decisiones.
            </p>

            <div className="hidden md:flex items-center gap-3 mt-10">
              <button
                type="button"
                onClick={prev}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10 dark:hover:border-white/20 dark:hover:text-white"
              >
                <ChevronLeft className="h-5 w-5 -ml-0.5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#5DBCD2]/30 bg-[#5DBCD2]/10 text-[#5DBCD2] hover:bg-[#5DBCD2]/20 hover:text-[#5DBCD2] transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(93,188,210,0.15)]"
              >
                <ChevronRight className="h-5 w-5 ml-0.5" />
              </button>
            </div>
          </div>

          <div className="reveal order-1 md:order-2 relative min-w-0 w-full">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-linear-to-l from-background via-background/85 to-transparent z-10 hidden sm:block" />

            <div
              ref={trackRef}
              className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-8 sm:pb-10 pt-1 -mx-1 px-1 sm:mx-0 sm:px-0"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {ITEMS.map((it, idx) => {
                const Icon = it.icon
                const isActive = idx === active

                return (
                  <div
                    key={it.title}
                    role="button"
                    tabIndex={0}
                    aria-label={`${it.title}: ${it.description}`}
                    className={[
                      "snap-center shrink-0 w-[min(100%,280px)] sm:w-[300px] md:w-[min(100%,340px)]",
                      "rounded-[2rem] border border-border bg-card/80 backdrop-blur-md",
                      "p-5 sm:p-6",
                      "transition-all duration-500 will-change-transform outline-none focus-visible:ring-2 focus-visible:ring-[#5DBCD2] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive
                        ? "scale-100 border-[#5DBCD2]/40 bg-card shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:bg-white/[0.06] dark:shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
                        : "scale-[0.97] opacity-70 hover:opacity-100 hover:border-[#5DBCD2]/30 cursor-pointer sm:scale-[0.98] dark:border-white/10 dark:hover:border-[#5DBCD2]/20",
                    ].join(" ")}
                    onClick={() => scrollTo(idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        scrollTo(idx)
                      }
                    }}
                  >
                    <div className="relative h-[200px] sm:h-[240px] md:h-[280px] w-full rounded-2xl overflow-hidden bg-slate-200/80 border border-border flex items-center justify-center p-3 sm:p-4 dark:bg-black/50 dark:border-white/10">
                      <div className="absolute inset-0 bg-linear-to-bl from-white/40 to-transparent dark:from-white/[0.03]" />

                      <div className="mx-auto flex h-full w-[min(100%,170px)] sm:w-[190px] md:w-[200px] flex-col overflow-hidden rounded-[1.5rem] border border-slate-300/80 bg-background shadow-lg shadow-slate-900/15 relative z-10 transition-transform duration-500 ease-out dark:border-white/15 dark:bg-[#020617] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-3 sm:h-4 w-12 sm:w-16 rounded-full bg-slate-800 z-20 dark:bg-black" />

                        {it.image ? (
                          <div
                            role="img"
                            aria-label={`Captura de pantalla: ${it.title}`}
                            className="w-full h-full bg-cover bg-top bg-no-repeat"
                            style={{ backgroundImage: `url(${it.image})` }}
                          />
                        ) : (
                          <div className="relative h-full w-full flex flex-col pt-10 px-3 pb-4">
                            <div className="w-full h-28 sm:h-32 bg-muted/80 rounded-xl border border-border overflow-hidden relative dark:bg-white/5 dark:border-white/10">
                              <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-[#5DBCD2]/30 to-transparent animate-pulse" />
                              <div className="absolute top-8 left-0 right-0 h-[2px] bg-[#5DBCD2] shadow-[0_0_20px_#5DBCD2]" />

                              <div className="mt-10 space-y-2 px-3">
                                <div className="h-3 w-full bg-foreground/10 rounded-full dark:bg-white/10" />
                                <div className="h-3 w-2/3 bg-foreground/10 rounded-full dark:bg-white/10" />
                              </div>
                            </div>

                            <div className="mt-auto space-y-3">
                              <div className="h-10 w-10 rounded-full bg-[#5DBCD2]/20 mx-auto grid place-items-center">
                                <Icon className="h-5 w-5 text-[#5DBCD2]" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6">
                      <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5DBCD2]">
                        {it.kicker}
                      </p>
                    <h3 className="mt-2 text-lg sm:text-xl font-bold text-foreground leading-tight">
                      {it.title}
                    </h3>
                      <p className="mt-2 sm:mt-3 text-sm text-muted-foreground leading-relaxed">
                        {it.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="md:hidden flex justify-center gap-2 mt-2">
              {ITEMS.map((_, i) => (
                <div
                  key={i}
                  className={[
                    "h-1.5 rounded-full transition-all duration-500",
                    i === active ? "w-6 bg-[#5DBCD2]" : "w-1.5 bg-foreground/15 dark:bg-white/20",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
