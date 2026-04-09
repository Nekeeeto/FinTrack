import * as React from "react"
import { Download, ArrowRight } from "lucide-react"
import Link from "next/link"

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" className={className}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  )
}

function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" className={className}>
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
    </svg>
  )
}

function StoreButton({
  label,
  icon,
}: {
  label: string
  icon: React.ReactNode
}) {
  return (
    <a
      href="#"
      className="group flex items-center justify-between gap-3 rounded-2xl bg-card/90 backdrop-blur-md px-4 sm:px-5 py-3.5 sm:py-4 text-foreground hover:bg-card transition-all duration-300 border border-border hover:border-[#5DBCD2]/40 hover:shadow-[0_12px_40px_rgba(93,188,210,0.15)] active:scale-[0.98] dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.08] dark:border-white/10 dark:hover:shadow-[0_0_30px_rgba(93,188,210,0.25)]"
    >
      <div className="flex items-center gap-3 relative z-10">
        <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-muted/60 border border-border group-hover:bg-[#5DBCD2]/20 group-hover:text-[#5DBCD2] transition-colors dark:bg-white/5 dark:border-white/10">
          {icon}
        </span>
        <div>
          <div className="text-[10px] text-muted-foreground font-medium leading-none group-hover:text-foreground transition-colors dark:text-white/50 dark:group-hover:text-white/70">
            Descargá en
          </div>
          <div className="text-sm font-semibold leading-tight mt-1">{label}</div>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:text-[#5DBCD2] group-hover:translate-x-0.5 transition-all relative z-10" />
    </a>
  )
}

export function StoreSection() {
  return (
    <section id="store" className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-14 sm:py-16 md:py-20 grid md:grid-cols-[1fr_1fr] gap-10 sm:gap-12 items-center">
        <div className="reveal">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
            Ya disponible en <span className="text-[#5DBCD2]">App Store</span> y{" "}
            <span className="text-[#5DBCD2]">Google Play</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Descargá gratis en iOS y Android. Registrate y empezá a ordenar tus
            gastos en minutos.
          </p>

          <div className="mt-6 sm:mt-7 space-y-3 sm:space-y-4 max-w-md">
            <StoreButton
              label="App Store"
              icon={<AppleLogo className="h-5 w-5" />}
            />
            <StoreButton 
              label="Google Play" 
              icon={<GooglePlayLogo className="h-5 w-5 ml-0.5" />} 
            />
          </div>

          <div className="mt-4 sm:mt-5 text-xs text-muted-foreground/80">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-[#5DBCD2] hover:underline">
              Inicia sesión
            </Link>
          </div>
        </div>

        {/* Mockup de teléfono */}
        <div className="reveal relative mx-auto w-full max-w-sm">
          {/* Fondo luminoso */}
          <div className="absolute -inset-4 bg-[#5DBCD2]/20 blur-3xl rounded-full opacity-50" />
          
          <div className="relative group">
            {/* Marco de "teléfono" estilizado */}
            <div className="relative rounded-[2.5rem] p-3 border border-border bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden aspect-[9/16] dark:border-white/10 dark:bg-white/5 dark:shadow-2xl">
              <img 
                src="/marketing-hero.png" 
                alt="PLATITA App en uso"
                className="w-full h-full object-cover rounded-[1.8rem] transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay de brillo */}
              <div className="absolute inset-0 pointer-events-none bg-linear-to-tr from-white/10 via-transparent to-transparent opacity-50" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 sm:-right-10 bg-card/95 backdrop-blur-md border border-border p-4 rounded-2xl shadow-lg hidden sm:block dark:bg-white/10 dark:border-white/20 dark:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#5DBCD2] flex items-center justify-center text-black">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider dark:text-white/50">
                    Resultado
                  </div>
                  <div className="text-sm font-bold text-foreground dark:text-white">Ahorro +25% mensual</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
