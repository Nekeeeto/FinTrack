import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="bg-[#020617] min-h-screen text-white/80 selection:bg-[#5DBCD2]/30">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-20 md:py-24">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5DBCD2] hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Volver a la portada
        </Link>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
          Términos y <span className="text-[#5DBCD2]">Condiciones</span>
        </h1>
        
        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <p className="text-white/60 mb-4 italic">Última actualización: 9 de abril de 2026</p>
            <p>
              Bienvenido a PLATITA. Al utilizar nuestra aplicación, aceptás estos términos. Por favor, leelos con atención.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Uso del Servicio</h2>
            <p>
              PLATITA es una herramienta de gestión financiera personal. No somos una entidad bancaria ni asesores financieros certificados. La información proporcionada por la app es para fines organizativos y educativos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Responsabilidad de la Cuenta</h2>
            <p>
              Sos responsable de mantener la confidencialidad de tu cuenta y contraseña. PLATITA no se hace responsable por pérdidas derivadas del uso no autorizado de tu cuenta debido a negligencia en la seguridad de tus credenciales.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Exactitud de la Información</h2>
            <p>
              Aunque nuestra IA es avanzada, no garantizamos precisión del 100% en el escaneo de tickets o categorización automática. Es responsabilidad del usuario verificar que los montos y datos ingresados sean correctos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Suscripciones y Pagos</h2>
            <p>
              Si optás por un plan Pro, los pagos se procesan de forma recurrente. Podés cancelar en cualquier momento y mantendrás el acceso hasta el final del periodo facturado. No se realizan reembolsos por periodos parcialmente utilizados.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de actualizar estos términos para reflejar cambios en la app o por motivos legales. Te notificaremos cualquier cambio importante a través del email asociado a tu cuenta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">6. Ley Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República Oriental del Uruguay.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
