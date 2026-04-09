"use client"

import { ShieldCheck, WifiOff, Zap, Lock, AlertCircle, Bell } from "lucide-react"

export function FeaturesGrid() {
  return (
    <section className="bg-[#020617] border-t border-white/[0.06] overflow-hidden py-14 sm:py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="reveal text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
            Herramientas <span className="text-[#5DBCD2]">Invisibles</span>
          </h3>
          <p className="reveal mt-3 sm:mt-4 text-sm sm:text-base text-white/55 max-w-2xl mx-auto leading-relaxed">
            Las funciones están ahí trabajando para vos, aunque no las veas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: MULTIMONEDA (Special Animation) */}
          <div className="reveal md:col-span-1 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/15 transition-all group overflow-hidden flex flex-col justify-between min-h-[220px]">
             
             {/* Animación Multimoneda CSS pura */}
             <div className="h-16 w-32 rounded-2xl bg-black/40 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden relative mb-6">
                 {/* Gradientes para suavizar el corte arriba y abajo */}
                 <div className="absolute inset-x-0 top-0 h-4 bg-linear-to-b from-black/80 to-transparent z-10" />
                 <div className="absolute inset-x-0 bottom-0 h-4 bg-linear-to-t from-black/80 to-transparent z-10" />
                 
                 <div className="flex flex-col animate-[vertical-marquee_6s_linear_infinite] mt-12 text-lg font-bold tracking-widest text-[#5DBCD2]">
                    <div className="flex items-center gap-2 h-10">🇺🇾 UYU</div>
                    <div className="flex items-center gap-2 h-10">🇦🇷 ARS</div>
                    <div className="flex items-center gap-2 h-10 text-white">🇺🇸 USD</div>
                    <div className="flex items-center gap-2 h-10 text-green-400">🇧🇷 BRL</div>
                    <div className="flex items-center gap-2 h-10 text-yellow-400">🇪🇺 EUR</div>
                    <div className="flex items-center gap-2 h-10">🇺🇾 UYU</div> {/* Clon para que no salte */}
                 </div>
             </div>

             <div>
               <h4 className="font-semibold text-white text-lg">Multimoneda</h4>
               <p className="mt-2 text-sm text-white/55 leading-relaxed">
                 Gastá en pesos, dólares o reales. La tasa se calcula automática o podés fijar tu propio tipo de cambio.
               </p>
             </div>
          </div>

          {/* Card 2: Avisos Inteligentes (Special Animation) */}
          <div className="reveal md:col-span-1 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 hover:bg-white/[0.04] hover:border-[#5DBCD2]/20 transition-all group overflow-hidden flex flex-col justify-between min-h-[220px]">
             
             {/* Animación Avisos CSS */}
             <div className="h-16 w-full max-w-[200px] rounded-2xl bg-black/40 border border-white/10 shadow-inner flex flex-col items-center justify-center overflow-hidden relative mb-6">
                 {/* Toast 1: Presupuesto */}
                 <div className="absolute inset-0 flex items-center justify-center p-2 opacity-0" style={{ animation: "toast-pop 8s ease-in-out infinite" }}>
                    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
                       <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                       <span className="text-[11px] font-medium text-yellow-500">Presupuesto al 85%</span>
                    </div>
                 </div>

                 {/* Toast 2: Vencimiento (delay 4s) */}
                 <div className="absolute inset-0 flex items-center justify-center p-2 opacity-0" style={{ animation: "toast-pop 8s ease-in-out infinite 4s" }}>
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
                       <Bell className="h-4 w-4 text-red-400 shrink-0" />
                       <span className="text-[11px] font-medium text-red-400">Pagar tarjeta hoy</span>
                    </div>
                 </div>
             </div>

             <div>
               <h4 className="font-semibold text-white text-lg">Avisos Proactivos</h4>
               <p className="mt-2 text-sm text-white/55 leading-relaxed">
                 La IA analiza tus fechas y límites. Recibí una alerta si vas a romper un presupuesto o si vence un pago.
               </p>
             </div>
          </div>

          {/* Card 3: Offline (PWA) */}
          <div className="reveal md:col-span-1 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/15 transition-all group overflow-hidden flex flex-col justify-between min-h-[220px]">
             <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors duration-300">
               <WifiOff className="h-5 w-5 text-white/70" />
             </div>
             <div>
               <h4 className="font-semibold text-white text-lg">Internet no requerido</h4>
               <p className="mt-2 text-sm text-white/55 leading-relaxed">
                 Registrá todo en el supermercado aunque no tengas señal. La app sincroniza apenas te conectás.
               </p>
             </div>
          </div>

          {/* Card 4: Atajos de pantalla */}
          <div className="reveal md:col-span-1 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/15 transition-all group overflow-hidden flex flex-col justify-between min-h-[220px]">
             <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform duration-300">
               <Zap className="h-5 w-5 text-yellow-400" />
             </div>
             <div>
               <h4 className="font-semibold text-white text-lg">Widgets Rápidos</h4>
               <p className="mt-2 text-sm text-white/55 leading-relaxed">
                 No hace falta abrir la app completa. Configurá atajos en tu pantalla de inicio para anotar en 1 toque.
               </p>
             </div>
          </div>

          {/* Card 5: Seguridad Bancaria */}
          <div className="reveal md:col-span-1 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 hover:bg-white/[0.04] hover:border-green-500/20 transition-all group overflow-hidden flex flex-col justify-between min-h-[220px]">
             <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 mb-6 relative">
                 <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 <ShieldCheck className="h-6 w-6 text-green-400 relative z-10" />
             </div>
             <div>
               <h4 className="font-semibold text-white text-lg">Cifrado Militar</h4>
               <p className="mt-2 text-sm text-white/55 leading-relaxed">
                 Aislamos tus datos con encriptación AES-256. Todo se guarda de forma anónima para máxima seguridad.
               </p>
             </div>
          </div>

          {/* Card 6: Privacidad */}
          <div className="reveal md:col-span-1 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/15 transition-all group overflow-hidden flex flex-col justify-between min-h-[220px]">
             <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6 group-hover:translate-x-1 transition-transform duration-300">
               <Lock className="h-5 w-5 text-zinc-400" />
             </div>
             <div>
               <h4 className="font-semibold text-white text-lg">Nos importa tu paz</h4>
               <p className="mt-2 text-sm text-white/55 leading-relaxed">
                 Tus finanzas son estrictamente tuyas. Nunca compartiremos tus listas con terceros ni te saturamos con ads.
               </p>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
