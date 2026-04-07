import Link from "next/link"
import { ArrowRight, Camera, PieChart, Shield, Smartphone, Tags, Wallet } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-emerald-500">$</span> Biyuya
          </h1>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            Ingresar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Tus finanzas,{" "}
          <span className="text-emerald-500">bajo control</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Escaneá tickets con tu celular, organizá gastos por categoría y
          visualizá a dónde se va tu plata. Simple, rápido y en español.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-base font-medium text-white hover:bg-emerald-600 transition-colors"
        >
          Empezar ahora
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h3 className="text-2xl font-bold text-center mb-12">
            Todo lo que necesitás
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Feature
              icon={Camera}
              title="Escáner de tickets"
              description="Sacá una foto a tu boleta y la IA extrae monto, comercio y categoría automáticamente."
            />
            <Feature
              icon={Tags}
              title="Categorías inteligentes"
              description="Organizá tus gastos con categorías personalizables. El sistema sugiere la categoría correcta."
            />
            <Feature
              icon={PieChart}
              title="Dashboard visual"
              description="Gráficos de gastos, tendencias mensuales, presupuestos y análisis con inteligencia artificial."
            />
            <Feature
              icon={Wallet}
              title="Multi-cuenta"
              description="Manejá efectivo, tarjetas, ahorros en dólares y cuentas de negocio, todo en un lugar."
            />
            <Feature
              icon={Smartphone}
              title="PWA móvil"
              description="Instalala en tu celular como una app nativa. Funciona offline y recibís notificaciones."
            />
            <Feature
              icon={Shield}
              title="Datos privados"
              description="Cada usuario tiene sus propios datos aislados. Tu información financiera es solo tuya."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          Biyuya — Hecho en Uruguay
        </div>
      </footer>
    </div>
  )
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="space-y-3">
      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-emerald-500" />
      </div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
