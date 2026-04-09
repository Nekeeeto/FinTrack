import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { RotatingPillText } from "@/components/RotatingPillText"
import { PublicStickyHeader } from "@/components/PublicStickyHeader"
import { MarketingCarousel } from "@/components/MarketingCarousel"
import { FeaturesGrid } from "@/components/FeaturesGrid"
import { PricingSection } from "@/components/PricingSection"
import { FAQSection } from "@/components/FAQSection"
import { StoreSection } from "@/components/StoreSection"
import { MarketingFooter } from "@/components/MarketingFooter"
import { LandingRevealWrapper } from "@/components/LandingRevealWrapper"
import { PlatitaJsonLd } from "@/components/PlatitaJsonLd"
import { HeroSpendScene } from "@/components/HeroSpendScene"
import { getSiteUrl } from "@/lib/site-url"
import { LANDING_CONTAINER } from "@/lib/landing-layout"

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: {
    absolute: "Platita — finanzas personales en Uruguay",
  },
  description:
    "Registrá gastos e ingresos en pesos y dólares, escaneá tickets con IA y ordená tu presupuesto. Platita es tu gestor financiero personal desde el navegador, pensado para Uruguay.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Platita — finanzas personales en Uruguay",
    description:
      "Gastos, presupuesto y multicuenta en UYU y USD. Probá Platita en la web.",
    url: siteUrl,
    siteName: "Platita",
    locale: "es_UY",
    type: "website",
    images: [{ url: "/marketing-hero.png", alt: "Platita en el navegador" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platita — finanzas personales en Uruguay",
    description:
      "Registrá gastos, escaneá tickets y controlá pesos y dólares desde la web.",
    images: [`${siteUrl}/marketing-hero.png`],
  },
}

export default function LandingPage() {
  return (
    <LandingRevealWrapper>
      <PlatitaJsonLd />
      <PublicStickyHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="hero-animated-bg">
          <div className="hero-noise" />
          <svg
            className="hero-waves"
            viewBox="0 0 1200 220"
            fill="none"
            aria-hidden="true"
          >
            <path
              className="stroke-slate-900/15 dark:stroke-white/25"
              d="M0 170 C 140 110, 260 210, 400 160 C 540 110, 660 210, 800 160 C 940 110, 1060 210, 1200 150"
              strokeWidth="1.5"
              stroke="currentColor"
            />
            <path
              className="stroke-slate-900/12 dark:stroke-white/20"
              d="M0 195 C 160 135, 300 235, 460 185 C 620 135, 760 235, 920 185 C 1080 135, 1160 215, 1200 175"
              strokeWidth="1"
              opacity="0.8"
              stroke="currentColor"
            />
            <path
              className="stroke-slate-900/10 dark:stroke-white/18"
              d="M0 140 C 120 80, 280 180, 420 130 C 560 80, 720 180, 860 130 C 1000 80, 1100 170, 1200 120"
              strokeWidth="1"
              opacity="0.65"
              stroke="currentColor"
            />
          </svg>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent via-background/60 to-background z-5" />

        <div
          className={`relative z-10 ${LANDING_CONTAINER} pb-16 sm:pb-20 md:pb-24 pt-24 sm:pt-28 md:pt-32 text-center`}
        >
          <HeroSpendScene />
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.15]">
            Controlá tus finanzas con{" "}
            <br className="hidden sm:block" />
            <RotatingPillText
              words={["inteligencia", "solvencia", "claridad", "control", "tranquilidad"]}
            />
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Finanzas personales desde el navegador, pensadas para Uruguay: pesos
            y dólares en un solo lugar. Escaneá tickets, usá la voz para cargar
            gastos y mirá tus números con claridad.
          </p>

          <div className="mt-6 sm:mt-7 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-[#5DBCD2] shrink-0" />
              Sin complicaciones
            </div>
            <div className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-[#5DBCD2] shrink-0" />
              Multimoneda (UYU / USD)
            </div>
            <div className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-[#5DBCD2] shrink-0" />
              Categorías inteligentes
            </div>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-4 w-full max-w-lg mx-auto px-0">
            <Link
              href="/login"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-[1.25rem] bg-[#020617] px-8 py-4 text-sm font-bold text-white shadow-lg hover:bg-[#0f172a] transition-all active:scale-[0.98] dark:bg-[#5DBCD2] dark:text-black dark:hover:bg-[#4fa8bc]"
            >
              Empezá en la web
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed text-pretty">
              <span className="font-medium text-foreground/80">Apps para iOS y Android:</span>{" "}
              próximamente. Podés instalar Platita como PWA desde Chrome o Safari
              para un acceso rápido desde el inicio.
            </p>
          </div>
        </div>
      </section>

      <MarketingCarousel />

      <FeaturesGrid />

      <PricingSection />

      <FAQSection />

      <StoreSection />

      <MarketingFooter />
    </LandingRevealWrapper>
  )
}
