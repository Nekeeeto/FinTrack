"use client"

import * as React from "react"
import { Mic, Receipt, Wallet, ChevronLeft, ChevronRight } from "lucide-react"

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
    description: "Manejá efectivo, tarjetas y ahorros en un único panel con tu saldo al instante.",
    icon: Wallet,
    image: "/dash-ui.png"
  },
  {
    kicker: "Comodidad",
    title: "Registro por voz",
    description: "Decí tu gasto y PLATITA lo registra y categoriza por vos automáticamente.",
    icon: Mic,
    image: "/voice-ui.png"
  },
  {
    kicker: "Inteligencia",
    title: "Lectura de tickets",
    description: "Sacá una foto de tu factura y la IA extrae los montos en milisegundos.",
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
    
    // Smooth scrolling considering the padding
    const scrollLeftNode = el.offsetLeft - 24
    track.scrollTo({ left: scrollLeftNode, behavior: "smooth" })
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
    <section className="relative overflow-hidden bg-[#020617]">
      <div className="py-14 sm:py-20 md:py-24 grid md:grid-cols-[1fr_1.6fr] gap-10 sm:gap-14 items-center">
        
        {/* Left Side Text - Aligned to standard max-w-5xl logic */}
        <div className="pl-5 sm:pl-6 max-w-xl mx-auto md:max-w-none md:mx-0 md:ml-auto lg:pl-[calc(50vw-512px)] pr-5 sm:pr-0 reveal">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
            Todo lo que necesitás para{" "}
            <span className="text-[#5DBCD2]">controlar tus finanzas</span>
          </h3>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-white/60 leading-relaxed max-w-md">
            PLATITA te ahorra tiempo: registrás, categorizás y analizás sin fricción. 
            Nosotros ordenamos, vos solo tomás mejores decisiones.
          </p>

          {/* Simple controls embedded on the left for desktop */}
          <div className="hidden md:flex items-center gap-3 mt-10">
            <button
              onClick={prev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all active:scale-[0.98]"
            >
              <ChevronLeft className="h-5 w-5 -ml-0.5" />
            </button>
            <button
              onClick={next}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#5DBCD2]/30 bg-[#5DBCD2]/10 text-[#5DBCD2] hover:bg-[#5DBCD2]/20 hover:text-[#5DBCD2] transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(93,188,210,0.15)]"
            >
              <ChevronRight className="h-5 w-5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Right Side Carousel - Bleeding full width to the right */}
        <div className="relative reveal w-full overflow-hidden">
          {/* Subtle fade right side to hide incoming items ungracefully */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-linear-to-l from-[#020617] via-[#020617]/80 to-transparent z-10 hidden md:block" />

          <div
            ref={trackRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-5 sm:px-6 md:px-0 md:pr-[20vw] pb-10 sm:pb-14 pt-2 -mx-5 sm:-mx-6 md:mx-0"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {ITEMS.map((it, idx) => {
              const Icon = it.icon
              const isActive = idx === active
              
              return (
                <article
                  key={it.title}
                  className={[
                    "snap-center shrink-0 w-[280px] sm:w-[320px] md:w-[360px]",
                    "rounded-[2rem] border bg-white/[0.03] backdrop-blur-md",
                    "p-5 sm:p-6",
                    "transition-all duration-500 will-change-transform",
                    isActive
                      ? "scale-100 border-[#5DBCD2]/40 bg-white/[0.06] shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
                      : "scale-[0.96] border-white/10 opacity-60 hover:opacity-100 hover:border-[#5DBCD2]/20 cursor-pointer",
                  ].join(" ")}
                  onClick={() => scrollTo(idx)}
                >
                  <div className="relative h-[220px] sm:h-[260px] md:h-[300px] w-full rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center p-4">
                    {/* Dark gradient base backdrop */}
                    <div className="absolute inset-0 bg-linear-to-bl from-white/[0.03] to-transparent" />
                    
                    <div className="mx-auto flex h-full w-[170px] sm:w-[200px] flex-col overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#020617] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 transition-transform duration-500 ease-out group-hover/article:scale-[1.03]">
                      
                      {/* Notch */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 h-3 sm:h-4 w-12 sm:w-16 rounded-full bg-black z-20" />
                      
                      {it.image ? (
                        <div 
                          className="w-full h-full bg-cover bg-top bg-no-repeat"
                          style={{ backgroundImage: `url(${it.image})` }}
                        />
                      ) : (
                        /* Fallback Mock API scanning UI */
                        <div className="relative h-full w-full flex flex-col pt-10 px-3 pb-4">
                          <div className="w-full h-32 bg-white/5 rounded-xl border border-white/10 overflow-hidden relative">
                             <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-[#5DBCD2]/30 to-transparent animate-pulse" />
                             <div className="absolute top-8 left-0 right-0 h-[2px] bg-[#5DBCD2] shadow-[0_0_20px_#5DBCD2]" />
                             
                             <div className="mt-10 space-y-2 px-3">
                               <div className="h-3 w-full bg-white/10 rounded-full" />
                               <div className="h-3 w-2/3 bg-white/10 rounded-full" />
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

                  <div className="mt-6 sm:mt-8">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5DBCD2]">
                      {it.kicker}
                    </p>
                    <h4 className="mt-2 text-lg sm:text-xl font-bold text-white leading-tight">
                      {it.title}
                    </h4>
                    <p className="mt-2 sm:mt-3 text-sm text-white/55 leading-relaxed">
                      {it.description}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="md:hidden mt-6 flex justify-center gap-2">
            {ITEMS.map((_, i) => (
              <div
                key={i}
                className={[
                  "h-1.5 rounded-full transition-all duration-500",
                  i === active ? "w-6 bg-[#5DBCD2]" : "w-1.5 bg-white/20",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
