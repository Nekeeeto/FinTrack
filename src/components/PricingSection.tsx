import { Check } from "lucide-react"
import Link from "next/link"
import { LANDING_CONTAINER, LANDING_SECTION_Y } from "@/lib/landing-layout"

export function PricingSection() {
  return (
    <section id="pricing" className="bg-[#5DBCD2] relative overflow-hidden">
      {/* Decorative pattern for the celeste background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      <div className={`${LANDING_CONTAINER} ${LANDING_SECTION_Y} text-center relative z-10`}>
        <div className="reveal inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/20 backdrop-blur-md px-4 py-2">
          <span className="inline-flex items-center gap-2 text-[#020617] font-bold text-xs">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/40 border border-white/50">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </span>
            PERÍODO ESPECIAL
          </span>
        </div>

        <h2 className="reveal mt-5 sm:mt-6 text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[#020617] leading-tight">
          Acceso completo para todos
        </h2>

        <p className="reveal mt-3 text-sm sm:text-base text-[#020617]/80 max-w-2xl mx-auto leading-relaxed font-medium">
          Mientras dura el período especial, desbloqueá funciones premium sin
          costo. Después seguís disfrutando lo básico para mantener tus finanzas al día.
        </p>

        <div className="reveal mt-8 sm:mt-12 mx-auto w-full max-w-3xl rounded-[2.5rem] bg-white border border-white/50 shadow-[0_40px_100px_rgba(2,6,23,0.15)] relative overflow-hidden">
          
          <div className="p-6 sm:p-8 md:p-12 relative z-10">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#020617]">
                Todo gratis, <span className="text-[#5DBCD2]">temporalmente</span>
              </h3>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Creá tu cuenta y empezá a registrar en minutos desde la web.
              </p>
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-slate-50 border border-slate-100 p-5 sm:p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 text-left">
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#5DBCD2] shrink-0" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-700">Cuentas ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#5DBCD2] shrink-0" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-700">Registro por voz sin límites</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#5DBCD2] shrink-0" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-700">Plantillas ilimitadas</span>
                  </li>
                </ul>

                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#5DBCD2] shrink-0" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-700">Transacciones ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#5DBCD2] shrink-0" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-700">Historial completo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#5DBCD2] shrink-0" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-700">Todas las funciones premium</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="mt-6 sm:mt-8 text-xs text-slate-400 font-medium">
              Entrá a Platita y disfrutá mientras dure el período especial.
            </p>

            <div className="mt-5 sm:mt-6 flex items-center justify-center">
              <Link
                href="/login"
                className="cta-shimmer inline-flex items-center justify-center gap-2 rounded-2xl bg-[#020617] px-8 py-4 text-sm font-bold text-white shadow-[0_20px_50px_rgba(2,6,23,0.2)] hover:bg-[#0f172a] hover:shadow-[0_25px_60px_rgba(2,6,23,0.3)] transition-all active:scale-[0.97]"
              >
                Empezá gratis en la web
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
