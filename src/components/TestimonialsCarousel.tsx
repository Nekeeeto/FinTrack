"use client"

import * as React from "react"
import { Star } from "lucide-react"

type Testimonial = {
  quote: string
  name: string
  role: string
  rating: 1 | 2 | 3 | 4 | 5
  avatar: string
}

const TESTIMONIALS_ROW_1: Testimonial[] = [
  {
    rating: 5,
    quote: "Me bajé la app para probar y terminé anotando hasta el chicle que me compro en el kiosco. Muy buena.",
    name: "Fede R.",
    role: "Montevideo",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    rating: 5,
    quote: "Por fin sé cuánto tengo en total entre bancos y billeteras. Antes era un caos y terminaba anotando en papelitos.",
    name: "Martín G.",
    role: "Canelones",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    rating: 5,
    quote: "Escaneo el ticket del súper y me arma el gasto solo. Literalmente el futuro llegó, me ahorra pila de tiempo.",
    name: "Sofía R.",
    role: "Maldonado",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    rating: 4,
    quote: "Lo del registro por voz es un viaje. Salgo con las bolsas, le digo '1500 en súper' y chau, sigo de largo. Épico.",
    name: "Caro M.",
    role: "Montevideo",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    rating: 5,
    quote: "Pensé que era otra app más que te pide mil datos, pero en 5 minutos literales ya estaba armando mi presupuesto.",
    name: "Seba F.",
    role: "Colonia",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    rating: 5,
    quote: "Me salvó las papas. Llegaba a fin de mes en cero y no tenía idea en qué. Ahora veo mis sangrías de plata claritas.",
    name: "Agus T.",
    role: "Paysandú",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
]

const TESTIMONIALS_ROW_2: Testimonial[] = [
  {
    rating: 5,
    quote: "Toda la vida quise armarme un Excel pero me daba tremenda pereza. Con esta app lo tengo en el cel y me avisa de todo.",
    name: "Romina P.",
    role: "Salto",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    rating: 5,
    quote: "Las categorías inteligentes son clave. Casi no toco nada: registra, tira en qué categoría va y yo solo le doy al tilde.",
    name: "Valentina S.",
    role: "Tacuarembó",
    avatar: "https://randomuser.me/api/portraits/women/88.jpg",
  },
  {
    rating: 4,
    quote: "Es rarísimo encontrar una herramienta así de pulida sin que te quieran fajar con la suscripción el primer día. Golazo.",
    name: "Mati C.",
    role: "Montevideo",
    avatar: "https://randomuser.me/api/portraits/men/66.jpg",
  },
  {
    rating: 5,
    quote: "Me gusta el dashboard principal. Entro y en 30 segundos entiendo exacto qué tan bien (o mal) vengo con la tarjeta.",
    name: "Andrés M.",
    role: "Rocha",
    avatar: "https://randomuser.me/api/portraits/men/31.jpg",
  },
  {
    rating: 5,
    quote: "Excelente app. Cero vueltas, abrís y anotás. Justo lo que necesitaba para dejar de despilfarrar plata los findes.",
    name: "Bruno L.",
    role: "Montevideo",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
  },
  {
    rating: 5,
    quote: "Le saqué foto a una boleta del almacén y me extrajo todo. Dejate de joder, re contra recomendado para desorganizados.",
    name: "Nico I.",
    role: "Canelones",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
  },
]

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="w-[320px] sm:w-[380px] shrink-0 rounded-3xl border border-border bg-card/90 p-6 sm:p-8 backdrop-blur-md transition-colors hover:border-[#5DBCD2]/35 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-[#5DBCD2]/30 dark:hover:bg-white/[0.04]">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? "fill-[#5DBCD2] text-[#5DBCD2]"
                : "text-foreground/15 dark:text-white/20"
            }`}
          />
        ))}
      </div>
      
      <p className="min-h-[90px] text-sm sm:text-base text-muted-foreground leading-relaxed italic dark:text-white/80">
        "{testimonial.quote}"
      </p>

      <div className="mt-6 flex items-center gap-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-border dark:border-white/20"
          loading="lazy"
        />
        <div>
          <div className="font-semibold text-foreground truncate text-sm sm:text-base">
            {testimonial.name}
          </div>
          <div className="text-xs text-[#5DBCD2]">
            {testimonial.role}
          </div>
        </div>
      </div>
    </article>
  )
}

export function TestimonialsCarousel() {
  return (
    <section className="border-t border-border bg-background overflow-hidden py-14 sm:py-20 md:py-24">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 text-center mb-10 sm:mb-14">
        <h3 className="reveal text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
          Lo que dicen quienes ya usan <span className="text-[#5DBCD2]">PLATITA</span>
        </h3>
        <p className="reveal mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Personas reales (y billeteras reales). Estas son algunas experiencias sin filtro de los usuarios
          que se animaron a tomar el control.
        </p>
      </div>

      {/* Marquee Tracks Container */}
      <div 
        className="relative flex flex-col gap-5 sm:gap-6 w-full overflow-hidden" 
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        {/* Row 1 - Left to Right */}
        <div className="flex w-[200%] sm:w-[max-content]">
          <div className="flex shrink-0 gap-5 sm:gap-6 animate-marquee pl-5 sm:pl-6">
            {TESTIMONIALS_ROW_1.map((t, idx) => (
              <TestimonialCard key={`r1-1-${idx}`} testimonial={t} />
            ))}
          </div>
          <div className="flex shrink-0 gap-5 sm:gap-6 animate-marquee pl-5 sm:pl-6">
            {TESTIMONIALS_ROW_1.map((t, idx) => (
              <TestimonialCard key={`r1-2-${idx}`} testimonial={t} />
            ))}
          </div>
        </div>

        {/* Row 2 - Right to Left */}
        <div className="flex w-[200%] sm:w-[max-content]">
          <div className="flex shrink-0 gap-5 sm:gap-6 animate-marquee-reverse pr-5 sm:pr-6">
            {TESTIMONIALS_ROW_2.map((t, idx) => (
              <TestimonialCard key={`r2-1-${idx}`} testimonial={t} />
            ))}
          </div>
          <div className="flex shrink-0 gap-5 sm:gap-6 animate-marquee-reverse pr-5 sm:pr-6">
            {TESTIMONIALS_ROW_2.map((t, idx) => (
              <TestimonialCard key={`r2-2-${idx}`} testimonial={t} />
            ))}
          </div>
        </div>

        {/* Subtle Side Gradients for blending if viewport is very large */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[5%] bg-linear-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[5%] bg-linear-to-l from-background to-transparent z-10" />
      </div>
    </section>
  )
}
