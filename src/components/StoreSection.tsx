import Image from "next/image"
import { Monitor, Smartphone } from "lucide-react"
import Link from "next/link"
import { LANDING_CONTAINER, LANDING_SECTION_Y } from "@/lib/landing-layout"

export function StoreSection() {
  return (
    <section id="store" className="border-t border-border bg-background">
      <div
        className={`${LANDING_CONTAINER} ${LANDING_SECTION_Y} grid md:grid-cols-2 gap-10 sm:gap-12 lg:gap-14 items-center`}
      >
        <div className="reveal">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
            Usá <span className="text-[#5DBCD2]">Platita</span> desde el navegador
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Entrá con tu cuenta, registrá movimientos y analizá tus gastos en
            pesos y dólares. En el celular podés agregar Platita a la pantalla de
            inicio como PWA para abrirla al instante.
          </p>

          <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#020617] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#0f172a] transition-colors active:scale-[0.98] dark:bg-[#5DBCD2] dark:text-black dark:hover:bg-[#4fa8bc]"
            >
              <Monitor className="h-4 w-4 shrink-0" />
              Entrá a Platita
            </Link>
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-3.5 text-sm text-muted-foreground dark:border-white/15 dark:bg-white/[0.03]">
              <Smartphone className="h-5 w-5 shrink-0 text-[#5DBCD2]" />
              <span>
                <span className="font-medium text-foreground/90">App Store y Google Play</span>
                <span className="block text-xs mt-0.5">Próximamente</span>
              </span>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 text-xs text-muted-foreground/80">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-[#5DBCD2] hover:underline font-medium">
              Iniciá sesión
            </Link>
          </div>
        </div>

        <div className="reveal relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 bg-[#5DBCD2]/20 blur-3xl rounded-full opacity-50" />

          <div className="relative pb-8 sm:pb-10">
            <div
              className={[
                "relative rounded-[2.5rem] p-3 border border-border bg-card/80 backdrop-blur-sm",
                "shadow-xl aspect-[9/16] group cursor-default",
                "transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-2xl",
                "dark:border-white/10 dark:bg-white/5 dark:shadow-2xl dark:hover:shadow-[0_32px_64px_rgba(0,0,0,0.45)]",
              ].join(" ")}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[1.8rem]">
                <Image
                  src="/marketing-hero.png"
                  alt="Platita: gestor financiero en el navegador"
                  fill
                  sizes="(max-width: 768px) 100vw, 384px"
                  className={[
                    "object-cover object-top",
                    "transform-gpu will-change-transform",
                    "transition-[transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "scale-100 motion-safe:group-hover:scale-[1.12] motion-reduce:transition-none",
                    "motion-safe:group-hover:brightness-[1.04] dark:motion-safe:group-hover:brightness-[1.06]",
                  ].join(" ")}
                  style={{ transformOrigin: "50% 42%" }}
                />

                <div
                  className={[
                    "absolute inset-0 pointer-events-none bg-linear-to-br from-white/25 via-white/5 to-transparent",
                    "opacity-60 transition-opacity duration-500 ease-out",
                    "motion-safe:group-hover:opacity-20 dark:from-white/15 dark:via-transparent",
                  ].join(" ")}
                />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 sm:-right-10 bg-card/95 backdrop-blur-md border border-border p-4 rounded-2xl shadow-lg hidden sm:block dark:bg-white/10 dark:border-white/20 dark:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#5DBCD2] flex items-center justify-center text-black">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider dark:text-white/50">
                    Acceso
                  </div>
                  <div className="text-sm font-bold text-foreground dark:text-white">
                    Web y PWA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
