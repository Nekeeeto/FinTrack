"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ArrowLeftRight, Landmark, Tags, Settings, Menu, X, Target, Brain, FileSpreadsheet, Shield, LogOut, Camera } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"

const baseNavItems = [
  { href: "/inicio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacciones", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/escaner", label: "Escáner", icon: Camera },
  { href: "/cuentas", label: "Cuentas", icon: Landmark },
  { href: "/categorias", label: "Categorías", icon: Tags },
  { href: "/presupuestos", label: "Presupuestos", icon: Target },
  { href: "/analisis", label: "Análisis IA", icon: Brain },
  { href: "/importar", label: "Importar CSV", icon: FileSpreadsheet },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [open, setOpen] = useState(false)

  // Construir items de navegación dinámicamente
  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-card rounded-lg shadow-md border border-border"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-emerald-500">$</span> Biyuya
          </h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={() => setOpen(false)} className="md:hidden p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
          <p className="text-xs text-muted-foreground">Biyuya v1.0</p>
        </div>
      </aside>
    </>
  )
}
