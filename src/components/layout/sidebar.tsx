"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  Tags,
  Settings,
  Menu,
  X,
  Target,
  Brain,
  FileSpreadsheet,
  Shield,
  LogOut,
  Camera,
  Plus,
  BarChart3,
  MoreHorizontal,
} from "lucide-react"
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

// Items para la bottom nav en mobile
const bottomNavItems = [
  { href: "/inicio", label: "Panel", icon: LayoutDashboard },
  { href: "/presupuestos", label: "Presupuestos", icon: Target },
  // El centro es el botón FAB (+)
  { href: "/analisis", label: "Análisis", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ]

  // Items que van en "Más" (los que no están en la bottom nav)
  const moreItems = navItems.filter(
    (item) => !bottomNavItems.some((b) => b.href === item.href)
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const currentItem = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  )
  const pageTitle = currentItem?.label ?? "Biyuya"

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <>
      {/* Mobile top bar - simplified */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden h-14 bg-card/80 backdrop-blur-lg border-b border-border/50 flex items-center px-4 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg font-bold text-emerald-500">$</span>
          <h1 className="text-base font-semibold truncate">{pageTitle}</h1>
        </div>
        <ThemeToggle />
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/80 backdrop-blur-lg border-t border-border/50">
        <div className="flex items-center justify-around h-16 px-2 pb-safe">
          {bottomNavItems.map((item, i) => {
            const NavIcon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                  isActive(item.href) ? "text-emerald-500" : "text-muted-foreground"
                )}
              >
                <NavIcon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          }).slice(0, 2)}

          {/* FAB center button */}
          <Link
            href="/transacciones?new=1"
            className="flex items-center justify-center h-12 w-12 -mt-5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
          >
            <Plus className="h-6 w-6" />
          </Link>

          {(() => {
            const item = bottomNavItems[2]
            const NavIcon = item.icon
            return (
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                  isActive(item.href) ? "text-emerald-500" : "text-muted-foreground"
                )}
              >
                <NavIcon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })()}

          {/* Más */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
              moreOpen ? "text-emerald-500" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">Más</span>
          </button>
        </div>
      </nav>

      {/* "Más" drawer overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* "Más" bottom sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card rounded-t-2xl transition-transform duration-300 ease-out",
          moreOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <nav className="px-4 pb-8 pt-2 space-y-1 max-h-[60vh] overflow-y-auto">
          {moreItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border mt-2 pt-2">
            <button
              onClick={() => { setMoreOpen(false); handleLogout() }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar drawer overlay (legacy, still used for drawer) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
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
            <span className="hidden md:inline-flex"><ThemeToggle /></span>
            <button onClick={() => setOpen(false)} className="md:hidden p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
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
