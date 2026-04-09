"use client"

import { ShieldCheck, Cloud, Smartphone, Lock, AlertCircle, Bell } from "lucide-react"
import { LANDING_CONTAINER, LANDING_SECTION_Y } from "@/lib/landing-layout"

const cardBase =
  "reveal md:col-span-1 rounded-3xl border border-border bg-card/80 p-6 sm:p-8 transition-all group overflow-hidden flex flex-col justify-between min-h-[220px] hover:bg-card dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className={`bg-background border-t border-border overflow-hidden ${LANDING_SECTION_Y}`}
    >
      <div className={LANDING_CONTAINER}>
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="reveal text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
            Herramientas <span className="text-[#5DBCD2]">invisibles</span>
          </h2>
          <p className="reveal mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Las funciones están ahí trabajando para vos, aunque no las veas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          <div
            className={`${cardBase} hover:border-slate-300/90 dark:hover:border-white/15 feature-card`}
          >
            <div className="h-16 w-32 rounded-2xl bg-slate-200/90 border border-border shadow-inner flex items-center justify-center overflow-hidden relative mb-6 dark:bg-black/40 dark:border-white/10">
              <div className="absolute inset-x-0 top-0 h-4 bg-linear-to-b from-slate-100/95 to-transparent z-10 dark:from-black/80" />
              <div className="absolute inset-x-0 bottom-0 h-4 bg-linear-to-t from-slate-100/95 to-transparent z-10 dark:from-black/80" />

              <div className="flex flex-col animate-[vertical-marquee_6s_linear_infinite] mt-12 text-lg font-bold tracking-widest text-[#5DBCD2]">
                <div className="flex items-center gap-2 h-10">🇺🇾 UYU</div>
                <div className="flex items-center gap-2 h-10">🇦🇷 ARS</div>
                <div className="flex items-center gap-2 h-10 text-foreground">🇺🇸 USD</div>
                <div className="flex items-center gap-2 h-10 text-green-600 dark:text-green-400">
                  🇧🇷 BRL
                </div>
                <div className="flex items-center gap-2 h-10 text-amber-600 dark:text-yellow-400">
                  🇪🇺 EUR
                </div>
                <div className="flex items-center gap-2 h-10">🇺🇾 UYU</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-lg">Multimoneda</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Llevá el día a día en pesos uruguayos y dólares (y otras monedas si
                las usás). La tasa se calcula sola o podés fijar tu tipo de cambio.
              </p>
            </div>
          </div>

          <div
            className={`${cardBase} hover:border-[#5DBCD2]/30 dark:hover:border-[#5DBCD2]/20 feature-card`}
          >
            <div className="h-16 w-full max-w-[200px] rounded-2xl bg-slate-200/90 border border-border shadow-inner flex flex-col items-center justify-center overflow-hidden relative mb-6 dark:bg-black/40 dark:border-white/10">
              <div
                className="absolute inset-0 flex items-center justify-center p-2 opacity-0"
                style={{ animation: "toast-pop 8s ease-in-out infinite" }}
              >
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 shrink-0" />
                  <span className="text-[11px] font-medium text-yellow-700 dark:text-yellow-500">
                    Presupuesto al 85%
                  </span>
                </div>
              </div>

              <div
                className="absolute inset-0 flex items-center justify-center p-2 opacity-0"
                style={{ animation: "toast-pop 8s ease-in-out infinite 4s" }}
              >
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
                  <Bell className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />
                  <span className="text-[11px] font-medium text-red-600 dark:text-red-400">
                    Pagar tarjeta hoy
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-lg">Avisos proactivos</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                La IA analiza tus fechas y límites. Recibí una alerta si vas a romper un presupuesto o si vence un pago.
              </p>
            </div>
          </div>

          <div
            className={`${cardBase} hover:border-slate-300/90 dark:hover:border-white/15 feature-card`}
          >
            <div className="h-12 w-12 rounded-full border border-border bg-muted/50 flex items-center justify-center mb-6 group-hover:bg-muted transition-colors duration-300 dark:border-white/10 dark:bg-white/5 dark:group-hover:bg-white/10">
              <Cloud className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Tus datos en la nube</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Iniciás sesión desde el navegador y tus movimientos quedan asociados
                a tu cuenta, con respaldo en servidores seguros.
              </p>
            </div>
          </div>

          <div
            className={`${cardBase} hover:border-slate-300/90 dark:hover:border-white/15 feature-card`}
          >
            <div className="h-12 w-12 rounded-full border border-border bg-muted/50 flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform duration-300 dark:border-white/10 dark:bg-white/5">
              <Smartphone className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">PWA en tu celular</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Agregá Platita a la pantalla de inicio desde Chrome o Safari: queda
                como una app para abrir rápido y registrar al toque.
              </p>
            </div>
          </div>

          <div
            className={`${cardBase} hover:border-green-500/35 dark:hover:border-green-500/20 feature-card`}
          >
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/25 mb-6 relative">
              <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400 relative z-10" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Seguridad seria</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Tus datos viajan cifrados (HTTPS) y el acceso a tu cuenta está
                protegido con las mismas prácticas que usan las apps financieras
                modernas.
              </p>
            </div>
          </div>

          <div
            className={`${cardBase} hover:border-slate-300/90 dark:hover:border-white/15 feature-card`}
          >
            <div className="h-12 w-12 rounded-full border border-border bg-muted/50 flex items-center justify-center mb-6 group-hover:translate-x-1 transition-transform duration-300 dark:border-white/10 dark:bg-white/5">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Nos importa tu paz</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Tus finanzas son estrictamente tuyas. No vendemos tu información
                financiera ni te saturamos con publicidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
