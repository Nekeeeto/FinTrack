"use client"

import { useState } from "react"
import { BookOpen, History, MessageCircle, ChevronDown, ChevronRight } from "lucide-react"

interface ChangelogEntry {
  version: string
  date: string
  title: string
  changes: string[]
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.1.0",
    date: "2026-04-08",
    title: "Rediseño dashboard + Pagos recurrentes",
    changes: [
      "Nuevo dashboard inspirado en Apple Wallet: balance total grande, carrusel de cuentas, cards glassmorphism",
      "Bottom nav en mobile con botón FAB (+) para agregar transacciones rápidas",
      "Sheet \"Más\" con navegación completa desde mobile",
      "Pagos recurrentes: configurá pagos automáticos diarios, semanales, quincenales, mensuales o anuales",
      "Generación automática de transacciones desde pagos recurrentes pendientes",
      "Pausar/reactivar pagos recurrentes",
      "Sección de Ayuda con changelog",
      "Fix overflow de números grandes en cards de cuentas y métricas",
      "Login mejorado: ojo para ver contraseña, recordarme, olvidé mi contraseña",
      "Onboarding mejorado: opciones más ricas con chips dinámicos en vez de Sí/No",
      "Fix schema API onboarding para nuevos tipos de respuesta",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-03-15",
    title: "Lanzamiento inicial",
    changes: [
      "Dashboard principal con métricas, gráficos y transacciones recientes",
      "CRUD completo de transacciones, cuentas y categorías",
      "Escáner OCR de tickets con IA (Claude)",
      "Bot de Telegram para registrar gastos desde el celular",
      "Presupuestos mensuales por categoría con barra de progreso",
      "Análisis IA de patrones de gasto",
      "Importación de CSV",
      "Cotizaciones de monedas (USD, BRL, ARS)",
      "Tema claro/oscuro",
      "Onboarding con generación de categorías por IA",
      "Panel de administración",
      "Auth con Supabase (email + magic link)",
      "Deploy en Vercel",
    ],
  },
]

export default function AyudaPage() {
  const [expandedVersion, setExpandedVersion] = useState<string>(CHANGELOG[0].version)

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Ayuda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Información sobre Biyuya y registro de cambios
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold">Sobre Biyuya</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Biyuya es tu gestor financiero personal. Registrá ingresos y gastos,
            escaneá tickets, configurá presupuestos y analizá tus finanzas con IA.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-semibold">Soporte</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            ¿Tenés algún problema o sugerencia? Contactanos por Telegram en{" "}
            <a href="https://t.me/biyuyauy_bot" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">
              @biyuyauy_bot
            </a>
          </p>
        </div>
      </div>

      {/* Changelog */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Changelog</h2>
        </div>

        <div className="space-y-3">
          {CHANGELOG.map((entry) => {
            const isExpanded = expandedVersion === entry.version
            return (
              <div
                key={entry.version}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedVersion(isExpanded ? "" : entry.version)}
                  className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-accent/30 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                        v{entry.version}
                      </span>
                      <span className="font-medium text-sm">{entry.title}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{entry.date}</span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 pt-0">
                    <ul className="space-y-1.5 ml-6">
                      {entry.changes.map((change, i) => (
                        <li key={i} className="text-sm text-muted-foreground list-disc">
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        Biyuya v{CHANGELOG[0].version} — Hecho con cariño en Uruguay
      </p>
    </div>
  )
}
