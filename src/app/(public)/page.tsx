import Link from "next/link"
import { Check } from "lucide-react"
import { RotatingPillText } from "@/components/RotatingPillText"
import { PublicStickyHeader } from "@/components/PublicStickyHeader"
import { MarketingCarousel } from "@/components/MarketingCarousel"
import { FeaturesGrid } from "@/components/FeaturesGrid"
import { MobileDownloadBar } from "@/components/MobileDownloadBar"
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel"
import { PricingSection } from "@/components/PricingSection"
import { FAQSection } from "@/components/FAQSection"
import { StoreSection } from "@/components/StoreSection"
import { MarketingFooter } from "@/components/MarketingFooter"
import { LandingRevealWrapper } from "@/components/LandingRevealWrapper"
import { WebVersionLink } from "@/components/WebVersionLink"

function ColoredAppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" className={className}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  )
}

function ColoredGooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className}>
      <path fill="#2EBD59" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"/>
      <path fill="#F8BA26" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
      <path fill="#EA4335" d="M425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"/>
      <path fill="#4285F4" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/>
    </svg>
  )
}

export default function LandingPage() {
  return (
    <LandingRevealWrapper>
      <PublicStickyHeader />
      <MobileDownloadBar />

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

        {/* Fade inferior para empalmar con la próxima sección */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent via-background/60 to-background z-5" />

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 pb-20 sm:pb-22 pt-24 sm:pt-28 md:pt-32 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.15]">
            Controlá tus finanzas con{" "}
            <br className="hidden sm:block" />
            <RotatingPillText
              words={["inteligencia", "solvencia", "claridad", "control", "tranquilidad"]}
            />
          </h2>

          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            La app de finanzas personales para registrar gastos en segundos.
            Escaneá tickets, categorizá automáticamente y mirá tus números con
            claridad.
          </p>

          <div className="mt-6 sm:mt-7 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-[#5DBCD2] shrink-0" />
              Sin complicaciones
            </div>
            <div className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-[#5DBCD2] shrink-0" />
              Control total
            </div>
            <div className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-[#5DBCD2] shrink-0" />
              Categorías inteligentes
            </div>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="#"
              className="group flex flex-1 sm:flex-initial items-center justify-center sm:justify-start gap-4 rounded-[1.25rem] bg-white/75 backdrop-blur-md px-6 py-3.5 border border-slate-200/90 hover:bg-white hover:border-slate-300/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-slate-900/10 active:scale-[0.98] min-w-[200px] dark:bg-black/60 dark:border-white/10 dark:hover:bg-white/5 dark:hover:border-white/20 dark:shadow-xl dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <ColoredAppleLogo className="h-8 w-8 text-foreground" />
              <div className="text-left">
                <div className="text-[10px] text-muted-foreground font-medium leading-[1] uppercase tracking-wide">
                  Descargá en
                </div>
                <div className="text-xl font-semibold text-foreground leading-tight mt-0.5 tracking-tight">
                  App Store
                </div>
              </div>
            </Link>

            <Link
              href="#"
              className="group flex flex-1 sm:flex-initial items-center justify-center sm:justify-start gap-4 rounded-[1.25rem] bg-white/75 backdrop-blur-md px-6 py-3.5 border border-slate-200/90 hover:bg-white hover:border-slate-300/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-slate-900/10 active:scale-[0.98] min-w-[200px] dark:bg-black/60 dark:border-white/10 dark:hover:bg-white/5 dark:hover:border-white/20 dark:shadow-xl dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <ColoredGooglePlayLogo className="h-8 w-8 ml-0.5" />
              <div className="text-left">
                <div className="text-[10px] text-muted-foreground font-medium leading-[1] uppercase tracking-wide">
                  DISPONIBLE EN
                </div>
                <div className="text-xl font-semibold text-foreground leading-tight mt-0.5 tracking-tight">
                  Google Play
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-8 flex justify-center">
            <WebVersionLink />
          </div>
        </div>
      </section>

      <MarketingCarousel />

      <FeaturesGrid />

      <TestimonialsCarousel />

      <PricingSection />

      <FAQSection />

      <StoreSection />
      
      <MarketingFooter />
    </LandingRevealWrapper>
  )
}
