"use client"

import Link from "next/link"
import {
  Landmark,
  ArrowLeftRight,
  Tags,
  Camera,
  Repeat,
  FileSpreadsheet,
  HelpCircle,
  Settings,
  Bot,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const financialItems = [
  { href: "/cuentas", label: "Cuentas", icon: Landmark },
  { href: "/transacciones", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/categorias", label: "Categorías", icon: Tags },
]

const toolsItems = [
  { href: "/escaner", label: "Escáner", icon: Camera },
  { href: "/recurrentes", label: "Recurrentes", icon: Repeat },
  { href: "/importar", label: "Importar CSV", icon: FileSpreadsheet },
  { href: "/analisis", label: "Análisis IA", icon: Bot },
  { href: "/ayuda", label: "Ayuda", icon: HelpCircle },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

export default function MenuPage() {
  const { profile } = useAuth()
  const initials = (profile?.name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="max-w-3xl space-y-7 pb-24">
      <div className="rounded-3xl border border-border/70 bg-card/70 p-4 flex items-center gap-3">
        <span className="h-14 w-14 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-xl font-bold">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-none truncate">{profile?.name || "Usuario"}</p>
          <p className="text-muted-foreground truncate">{profile?.email || "Sin email"}</p>
        </div>
      </div>

      <section>
        <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-3">Gestión financiera</p>
        <div className="grid grid-cols-3 gap-4">
          {financialItems.map((item) => (
            <Link key={item.href} href={item.href} className="group flex flex-col items-center">
              <span className="relative mx-auto h-20 w-20 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_26px_rgba(0,0,0,0.45)] inline-flex items-center justify-center text-foreground/95 group-hover:border-primary/40 group-hover:text-primary transition-all duration-300 group-hover:scale-105">
                <span className="absolute inset-[5px] rounded-full bg-background/45 backdrop-blur-sm" />
                <item.icon className="relative h-7 w-7" />
              </span>
              <p className="mt-2 max-w-[96px] text-center text-[13px] leading-tight truncate">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-3">Herramientas</p>
        <div className="grid grid-cols-3 gap-4">
          {toolsItems.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="group flex flex-col items-center">
              <span className="relative mx-auto h-20 w-20 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_26px_rgba(0,0,0,0.45)] inline-flex items-center justify-center text-foreground/95 group-hover:border-primary/40 group-hover:text-primary transition-all duration-300 group-hover:scale-105">
                <span className="absolute inset-[5px] rounded-full bg-background/45 backdrop-blur-sm" />
                <item.icon className="relative h-7 w-7" />
              </span>
              <p className="mt-2 max-w-[96px] text-center text-[13px] leading-tight truncate">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

