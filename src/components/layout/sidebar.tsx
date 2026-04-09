"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  Tags,
  Settings,
  X,
  Target,
  Brain,
  FileSpreadsheet,
  Shield,
  LogOut,
  Camera,
  Plus,
  CalendarClock,
  HelpCircle,
  User,
  Bot,
  Grid2x2,
  Mic,
  Bookmark,
  CirclePlus,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import { PlatitaBrandLockup } from "@/components/PlatitaBrandLockup"

const baseNavItems = [
  { href: "/inicio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacciones", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/escaner", label: "Escáner", icon: Camera },
  { href: "/cuentas", label: "Cuentas", icon: Landmark },
  { href: "/categorias", label: "Categorías", icon: Tags },
  { href: "/presupuestos", label: "Presupuestos", icon: Target },
  { href: "/recurrentes", label: "Recurrentes", icon: CalendarClock },
  { href: "/analisis", label: "Análisis IA", icon: Brain },
  { href: "/importar", label: "Importar CSV", icon: FileSpreadsheet },
  { href: "/ayuda", label: "Ayuda", icon: HelpCircle },
]

// Items para la bottom nav en mobile
const bottomNavItems = [
  { href: "/inicio", label: "Inicio", icon: LayoutDashboard },
  { href: "/presupuestos", label: "Presupuestos", icon: Target },
  { href: "/analisis", label: "Análisis IA", icon: Bot },
  { href: "/menu", label: "Menú", icon: Grid2x2 },
]

type QuickActionRow =
  | {
      key: string
      kind: "link"
      href: string
      title: string
      subtitle: string
      Icon: LucideIcon
      iconClassName: string
    }
  | {
      key: string
      kind: "voice"
      title: string
      subtitle: string
      Icon: LucideIcon
      iconClassName: string
    }
  | {
      key: string
      kind: "soon"
      title: string
      subtitle: string
      Icon: LucideIcon
      iconClassName: string
    }

const quickActionRows: QuickActionRow[] = [
  {
    key: "new",
    kind: "link",
    href: "/transacciones?new=1",
    title: "Nuevo movimiento",
    subtitle: "Registrar ingreso o gasto",
    Icon: CirclePlus,
    iconClassName: "text-primary",
  },
  {
    key: "voice",
    kind: "voice",
    title: "Registro por voz",
    subtitle: "Dictá tu movimiento",
    Icon: Mic,
    iconClassName: "text-violet-400",
  },
  {
    key: "scan",
    kind: "link",
    href: "/escaner",
    title: "Escanear foto",
    subtitle: "Subí ticket o factura",
    Icon: Camera,
    iconClassName: "text-sky-400",
  },
  {
    key: "transfer",
    kind: "soon",
    title: "Nueva transferencia",
    subtitle: "Próximamente",
    Icon: ArrowLeftRight,
    iconClassName: "text-blue-400/85",
  },
  {
    key: "template",
    kind: "soon",
    title: "Usar plantilla",
    subtitle: "Próximamente",
    Icon: Bookmark,
    iconClassName: "text-amber-400/85",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)

  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const firstName = profile?.name?.split(" ")[0] || "Hola"
  const isMenuPage = pathname === "/menu"

  function openVoiceAssistant() {
    window.dispatchEvent(new CustomEvent("fintrack:open-voice-assistant"))
    setQuickActionsOpen(false)
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 flex items-center px-4 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isMenuPage ? (
            <h1 className="text-3xl font-semibold tracking-tight">Menú</h1>
          ) : (
            <>
              <span className="h-8 w-8 rounded-full border border-border/70 inline-flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </span>
              <span className="text-xl font-semibold truncate">{firstName}</span>
            </>
          )}
        </div>
        {isMenuPage ? (
          <Link
            href="/configuracion"
            className="h-10 w-10 rounded-full bg-muted/60 inline-flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
        ) : (
          <>
            <span className="hidden min-[380px]:inline-flex">
              <PlatitaBrandLockup size="sm" href="/inicio" wordmarkClassName="text-base" />
            </span>
            <span className="min-[380px]:hidden inline-flex">
              <ThemeToggle />
            </span>
          </>
        )}
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden rounded-3xl border border-white/10 bg-card/65 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const NavIcon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300",
                  isActive(item.href)
                    ? "bg-primary/18 text-primary scale-105 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.25)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <NavIcon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      {quickActionsOpen && (
        <button
          onClick={() => setQuickActionsOpen(false)}
          className="fixed inset-0 z-40 bg-black/45"
          aria-label="Cerrar acciones rápidas"
        />
      )}

      <div
        className={cn(
          "fixed z-50 right-4 flex flex-col items-end gap-3",
          "bottom-24 md:bottom-8 md:right-8"
        )}
      >
        {quickActionsOpen && (
          <div className="w-[280px] max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-card/90 backdrop-blur-xl p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.5)]">
            {quickActionRows.map((row) => {
              const Icon = row.Icon
              const text = (
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-lg leading-tight font-semibold">{row.title}</span>
                  <span className="block text-sm text-muted-foreground">{row.subtitle}</span>
                </span>
              )
              const iconEl = (
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center"
                  aria-hidden
                >
                  <Icon className={cn("h-[15px] w-[15px]", row.iconClassName)} />
                </span>
              )
              const rowClass = cn(
                "flex w-full items-start justify-start gap-2.5 rounded-2xl px-2.5 py-2 text-left transition-colors"
              )

              if (row.kind === "link") {
                return (
                  <Link
                    key={row.key}
                    href={row.href}
                    onClick={() => setQuickActionsOpen(false)}
                    className={cn(rowClass, "hover:bg-accent/60")}
                  >
                    {iconEl}
                    {text}
                  </Link>
                )
              }
              if (row.kind === "voice") {
                return (
                  <button
                    key={row.key}
                    type="button"
                    onClick={openVoiceAssistant}
                    className={cn(rowClass, "hover:bg-accent/60")}
                  >
                    {iconEl}
                    {text}
                  </button>
                )
              }
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => setQuickActionsOpen(false)}
                  className={cn(rowClass, "opacity-70")}
                >
                  {iconEl}
                  {text}
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={() => setQuickActionsOpen((prev) => !prev)}
          className={cn(
            "flex shrink-0 items-center justify-center h-12 w-12 md:h-[3.25rem] md:w-[3.25rem] rounded-full shadow-lg active:scale-95 transition-all",
            quickActionsOpen
              ? "bg-primary/90 text-primary-foreground rotate-45"
              : "bg-primary text-primary-foreground shadow-primary/30"
          )}
          aria-label="Acciones rápidas"
        >
          <Plus className="h-5 w-5" />
        </button>
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
            <span className="text-primary">$</span> PLATITA
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
                  ? "bg-primary/10 text-primary"
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
          <p className="text-xs text-muted-foreground">PLATITA v1.0</p>
        </div>
      </aside>
    </>
  )
}
