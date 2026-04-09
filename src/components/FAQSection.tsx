"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"

type FAQItem = {
  q: string
  a: string
}

const ITEMS: FAQItem[] = [
  {
    q: "¿Qué es PLATITA?",
    a: "PLATITA es una app para registrar gastos e ingresos de forma rápida. Escaneás tickets, organizás por categorías y visualizás tus números con claridad.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Durante el período especial las funciones premium están habilitadas sin costo. Después podés seguir con el plan básico y actualizar cuando quieras.",
  },
  {
    q: "¿PLATITA se conecta a mis bancos automáticamente?",
    a: "Por ahora el registro es manual y por captura/voz. Estamos trabajando en integraciones futuras para automatizar más procesos.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No. Todo está pensado para ser simple: cargás, confirmás y el sistema te ayuda a ordenar el resto.",
  },
  {
    q: "¿Tiene publicidad?",
    a: "No. La app prioriza tu experiencia. Podés esperar una interfaz limpia y sin interrupciones.",
  },
]

export function FAQSection() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0)

  return (
    <section id="faq" className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-14 sm:py-16 md:py-20">
        <h2 className="reveal text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-foreground text-center">
          Preguntas Frecuentes
        </h2>
        <p className="reveal mt-3 text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
          Respuestas rápidas para que te sientas seguro antes de probar PLATITA.
        </p>

        <div className="mt-8 sm:mt-10 space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          {ITEMS.map((it, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={it.q}
                className={[
                  "reveal rounded-2xl border bg-card/90 backdrop-blur-sm overflow-hidden transition-colors duration-300 dark:bg-white/[0.03]",
                  isOpen
                    ? "border-[#5DBCD2]/35"
                    : "border-border hover:border-slate-300/90 dark:border-white/10 dark:hover:border-white/15",
                ].join(" ")}
                style={{ "--stagger": idx } as React.CSSProperties}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx((v) => (v === idx ? null : idx))}
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 text-left bg-transparent"
                >
                  <span className="text-sm sm:text-base font-semibold text-foreground/90">
                    {it.q}
                  </span>
                  <span
                    className={[
                      "flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full border transition-all duration-300 shrink-0",
                      isOpen
                        ? "border-[#5DBCD2]/40 bg-[#5DBCD2]/15 text-[#5DBCD2] rotate-0"
                        : "border-border bg-muted/50 text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {isOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 text-sm text-muted-foreground leading-relaxed">
                      {it.a}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
