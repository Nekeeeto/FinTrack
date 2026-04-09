"use client"

import { LANDING_CONTAINER, LANDING_SECTION_Y } from "@/lib/landing-layout"
import {
  FeatureIllustrationAlerts,
  FeatureIllustrationCloud,
  FeatureIllustrationFrame,
  FeatureIllustrationMulticurrency,
  FeatureIllustrationPrivacy,
  FeatureIllustrationPwa,
  FeatureIllustrationSecurity,
} from "@/components/FeatureIllustrations"

const cardBase =
  "reveal md:col-span-1 rounded-3xl border border-border bg-card/80 p-6 sm:p-8 transition-all group overflow-hidden flex flex-col hover:bg-card dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] min-h-[320px] sm:min-h-[340px]"

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <div
            className={`${cardBase} hover:border-slate-300/90 dark:hover:border-white/15 feature-card justify-between`}
          >
            <FeatureIllustrationFrame>
              <FeatureIllustrationMulticurrency />
            </FeatureIllustrationFrame>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Multimoneda</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Llevá el día a día en pesos uruguayos y dólares (y otras monedas si
                las usás). La tasa se calcula sola o podés fijar tu tipo de cambio.
              </p>
            </div>
          </div>

          <div
            className={`${cardBase} hover:border-[#5DBCD2]/30 dark:hover:border-[#5DBCD2]/20 feature-card justify-between`}
          >
            <FeatureIllustrationFrame>
              <FeatureIllustrationAlerts />
            </FeatureIllustrationFrame>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Avisos proactivos</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Alertas de presupuesto y recordatorios de vencimientos para que no te
                sorprenda la tarjeta ni el fin de mes.
              </p>
            </div>
          </div>

          <div
            className={`${cardBase} hover:border-slate-300/90 dark:hover:border-white/15 feature-card justify-between`}
          >
            <FeatureIllustrationFrame>
              <FeatureIllustrationCloud />
            </FeatureIllustrationFrame>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Tus datos en la nube</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Iniciás sesión desde el navegador y tus movimientos quedan asociados
                a tu cuenta, con respaldo en servidores seguros.
              </p>
            </div>
          </div>

          <div
            className={`${cardBase} hover:border-slate-300/90 dark:hover:border-white/15 feature-card justify-between`}
          >
            <FeatureIllustrationFrame>
              <FeatureIllustrationPwa />
            </FeatureIllustrationFrame>
            <div>
              <h3 className="font-semibold text-foreground text-lg">PWA en tu celular</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Agregá Platita a la pantalla de inicio desde Chrome o Safari: queda
                como una app para abrir rápido y registrar al toque.
              </p>
            </div>
          </div>

          <div
            className={`${cardBase} hover:border-green-500/35 dark:hover:border-green-500/20 feature-card justify-between`}
          >
            <FeatureIllustrationFrame>
              <FeatureIllustrationSecurity />
            </FeatureIllustrationFrame>
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
            className={`${cardBase} hover:border-slate-300/90 dark:hover:border-white/15 feature-card justify-between`}
          >
            <FeatureIllustrationFrame>
              <FeatureIllustrationPrivacy />
            </FeatureIllustrationFrame>
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
