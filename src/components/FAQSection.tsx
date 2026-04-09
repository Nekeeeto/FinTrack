"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"
import { LANDING_CONTAINER, LANDING_SECTION_Y } from "@/lib/landing-layout"

type FAQItem = {
  q: string
  a: string
}

const ITEMS: FAQItem[] = [
  {
    q: "¿Qué es Platita?",
    a: "Platita es un gestor financiero personal que usás desde el navegador (y como PWA en el celular). Registrás gastos e ingresos al toque, escaneás tickets con IA, organizás por categorías y ves tus números con claridad.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Durante el período especial las funciones premium están habilitadas sin costo. Después podés seguir con lo esencial y actualizar cuando quieras.",
  },
  {
    q: "¿Platita se conecta a mis bancos automáticamente?",
    a: "Hoy el registro es manual, por voz o escaneando tickets. Estamos evaluando integraciones futuras para automatizar más procesos.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No. Cargás, confirmás y el sistema te ayuda a ordenar el resto. Solo necesitás un navegador y una cuenta.",
  },
  {
    q: "¿Tiene publicidad?",
    a: "No. Priorizamos una interfaz limpia, sin banners ni interrupciones.",
  },
]

export function FAQSection() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0)

  return (
    <section id="faq" className="border-t border-border bg-background">
      <div className={`${LANDING_CONTAINER} ${LANDING_SECTION_Y}`}>
        <h2 className="reveal text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-foreground text-center">
          Preguntas Frecuentes
        </h2>
        <p className="reveal mt-3 text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
          Respuestas rápidas para que te sientas seguro antes de probar Platita.
        </p>

        <div className="mt-8 sm:mt-10 space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          {ITEMS.map((it, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={it.q}
                className={[
                  "rounded-2xl border bg-card/90 backdrop-blur-sm overflow-hidden transition-colors duration-300 dark:bg-white/[0.03]",
                  isOpen
                    ? "border-[#5DBCD2]/35"
                    : "border-border hover:border-slate-300/90 dark:border-white/10 dark:hover:border-white/15",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx((v) => (v === idx ? null : idx))}
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 text-left bg-transparent cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  id={`faq-trigger-${idx}`}
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
                  id={`faq-panel-${idx}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${idx}`}
                  className={["faq-answer", isOpen ? "open" : ""].filter(Boolean).join(" ")}
                >
                  <div>
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
