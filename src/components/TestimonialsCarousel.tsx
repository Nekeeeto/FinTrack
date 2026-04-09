"use client"

import { LANDING_CONTAINER, LANDING_SECTION_Y } from "@/lib/landing-layout"

type UseCase = {
  title: string
  body: string
}

const USE_CASES: UseCase[] = [
  {
    title: "Pesos y dólares, sin vueltas",
    body: "Llevá gastos cotidianos en pesos uruguayos y ahorros o gastos en dólar en el mismo panel, con el tipo de cambio que elijas.",
  },
  {
    title: "Del súper al bolsillo",
    body: "Sacale foto al ticket del disco o del súper: la IA extrae montos y te deja confirmar antes de guardar.",
  },
  {
    title: "Manos libres, un gasto anotado",
    body: "Decí el monto y la categoría por voz cuando venís con las bolsas: ideal para no olvidar nada en el camino.",
  },
  {
    title: "Varias cuentas, una vista",
    body: "Separá lo personal de lo del negocio o proyectos distintos: efectivo, banco y tarjetas en un solo resumen.",
  },
  {
    title: "Presupuesto que se entiende",
    body: "Armá límites por categoría y seguí el avance del mes para llegar a fin de mes sin sorpresas.",
  },
  {
    title: "En el celu como app",
    body: "Agregá Platita a la pantalla de inicio (PWA) y abrila como cualquier app, sin esperar tiendas nativas.",
  },
]

export function TestimonialsCarousel() {
  return (
    <section
      className={`border-t border-border bg-background overflow-hidden ${LANDING_SECTION_Y}`}
    >
      <div className={LANDING_CONTAINER}>
        <div className="text-center mb-10 sm:mb-12 md:mb-14 max-w-3xl mx-auto">
          <h2 className="reveal text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
            Pensado para el día a día en{" "}
            <span className="text-[#5DBCD2]">Uruguay</span>
          </h2>
          <p className="reveal mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Ejemplos de uso reales: sin reseñas inventadas ni fotos de stock, solo
            lo que Platita te permite hacer hoy desde la web.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {USE_CASES.map((item) => (
            <article
              key={item.title}
              className="reveal rounded-3xl border border-border bg-card/90 p-6 sm:p-7 backdrop-blur-md transition-colors hover:border-[#5DBCD2]/35 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-[#5DBCD2]/30 dark:hover:bg-white/[0.04]"
            >
              <h3 className="text-base sm:text-lg font-semibold text-foreground leading-snug">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
