import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
          Política de <span className="text-[#5DBCD2]">Privacidad</span>
        </h1>
        
        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <p className="text-white/60 mb-4 italic">Última actualización: 9 de abril de 2026</p>
            <p>
              En PLATITA, la privacidad de tus datos financieros no es una opción, es nuestra base. Esta política explica cómo manejamos tu información cuando usás nuestra plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Información que recolectamos</h2>
            <p>
              Recolectamos únicamente lo necesario para que la app funcione:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li><strong className="text-white">Datos de cuenta:</strong> Email y nombre para tu perfil seguro.</li>
              <li><strong className="text-white">Datos financieros:</strong> Transacciones, categorías y presupuestos que vos cargás manualmente o vía escáner.</li>
              <li><strong className="text-white">Imágenes:</strong> Fotos de tickets que subís para el procesamiento de IA (estas se procesan y no se comparten con terceros).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Uso de la Inteligencia Artificial</h2>
            <p>
              Utilizamos modelos de IA para extraer texto de tus boletas y categorizar tus gastos. Este proceso es automatizado. Tus datos no se utilizan para entrenar modelos públicos de terceros de manera que puedan identificarte.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Seguridad</h2>
            <p>
              Implementamos cifrado AES-256 para tus datos en reposo y SSL/TLS para los datos en tránsito. Tu información financiera está aislada y solo vos tenés acceso a ella a través de tus credenciales protegidas por Supabase Auth.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Tus derechos</h2>
            <p>
              Podés exportar tus datos o eliminar tu cuenta permanentemente en cualquier momento desde la configuración de la app. Al eliminar la cuenta, todos tus registros financieros se borran de nuestros servidores activos de forma definitiva.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Contacto</h2>
            <p>
              Si tenés dudas sobre cómo cuidamos tu "platita", escribinos a <span className="text-[#5DBCD2]">privacidad@platita.uy</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
