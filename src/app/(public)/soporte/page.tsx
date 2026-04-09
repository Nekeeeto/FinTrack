import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BookOpen, ClipboardList, LifeBuoy } from "lucide-react"
import { LANDING_CONTAINER } from "@/lib/landing-layout"
import { getSiteUrl } from "@/lib/site-url"

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: "Ayuda y soporte",
  description:
    "Centro de ayuda de Platita: documentación, novedades y contacto con asistencia. En construcción.",
  alternates: { canonical: "/soporte" },
  openGraph: {
    title: "Ayuda y soporte | Platita",
    description:
      "Guías, changelog y asistencia para usar Platita en Uruguay.",
    url: `${siteUrl}/soporte`,
    siteName: "Platita",
    locale: "es_UY",
    type: "website",
  },
}

const docPlaceholders = [
  {
    title: "Primeros pasos",
    body: "Crear cuenta, cuentas en pesos y dólares, y tu primer movimiento.",
  },
  {
    title: "Categorías y presupuesto",
    body: "Organizar gastos, reglas habituales y lectura del panel.",
  },
  {
    title: "OCR y Telegram",
    body: "Escanear tickets con IA y cargar gastos desde el bot.",
  },
  {
    title: "Asistente de voz",
    body: "Dictar montos y categorías desde el micrófono del navegador.",
  },
]

export default function SoportePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={`${LANDING_CONTAINER} py-10 sm:py-14 md:py-20`}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5DBCD2] hover:text-foreground transition-colors mb-8 sm:mb-10 group"
        >
          <ArrowLeft className="h-4 w-4 motion-safe:group-hover:-translate-x-1 transition-transform" />
          Volver a la portada
        </Link>

        <header className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Centro de ayuda
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Ayuda y <span className="text-[#5DBCD2]">soporte</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Este espacio va a concentrar documentación, novedades del producto y
            canales para hablar con el equipo. Por ahora es un esbozo: las secciones
            de abajo marcan lo que viene.
          </p>
        </header>

        <div className="grid gap-10 lg:gap-14 lg:grid-cols-3">
          <section
            id="documentacion"
            className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8 dark:bg-white/3"
            aria-labelledby="soporte-documentacion"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5DBCD2]/15 text-[#5DBCD2]">
                <BookOpen className="h-5 w-5" aria-hidden />
              </div>
              <h2 id="soporte-documentacion" className="text-lg font-semibold">
                Documentación
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Guías paso a paso por cada parte de Platita: cuentas, transacciones,
              integraciones y buenas prácticas para Uruguay (UYU / USD).
            </p>
            <ul className="space-y-4">
              {docPlaceholders.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 dark:bg-white/2"
                >
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.body}
                  </p>
                  <span className="mt-2 inline-block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Próximamente
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            id="changelog"
            className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8 dark:bg-white/3"
            aria-labelledby="soporte-changelog"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5DBCD2]/15 text-[#5DBCD2]">
                <ClipboardList className="h-5 w-5" aria-hidden />
              </div>
              <h2 id="soporte-changelog" className="text-lg font-semibold">
                Changelog
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Historial de versiones y mejoras visibles para usuarios: qué cambió,
              qué se corrigió y qué hay de nuevo en la web y en integraciones.
            </p>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 dark:bg-white/2">
              <p className="text-sm text-foreground/90 leading-relaxed">
                Acá vamos a publicar el registro de cambios en formato legible (por
                fecha o por versión), enlazado al mismo contenido que hoy llevamos en
                el repositorio del proyecto.
              </p>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Próximamente: listado filtrable y avisos destacados para
                actualizaciones importantes.
              </p>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
                Si ya usás Platita con tu cuenta, en el menú lateral tenés{" "}
                <strong className="text-foreground/80">Ayuda</strong> con un resumen
                de versiones hasta que esta sección pública quede lista.
              </p>
            </div>
          </section>

          <section
            id="asistencia"
            className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8 dark:bg-white/3"
            aria-labelledby="soporte-asistencia"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5DBCD2]/15 text-[#5DBCD2]">
                <LifeBuoy className="h-5 w-5" aria-hidden />
              </div>
              <h2 id="soporte-asistencia" className="text-lg font-semibold">
                Asistencia y tickets
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Canal para consultas, reportar problemas o pedir ayuda con tu cuenta.
              La idea es un formulario o sistema de tickets con seguimiento por
              correo.
            </p>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 dark:bg-white/2">
              <p className="text-sm text-foreground/90 leading-relaxed">
                Todavía no está habilitado el contacto público desde la web. Cuando
                lo activemos, vas a poder abrir un ticket, adjuntar capturas y
                recibir respuesta del equipo.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Mientras tanto, si ya tenés cuenta, iniciá sesión y usá los canales
                que indiquemos desde la app.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#020617] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f172a] transition-colors dark:bg-[#5DBCD2] dark:text-black dark:hover:bg-[#4fa8bc]"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
