"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * Padding superior en móvil: reserva espacio solo cuando existe la barra fija de inicio (`Sidebar`).
 */
export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showMobileTopBar = pathname === "/inicio"

  return (
    <main
      className={cn(
        "flex-1 min-w-0 bg-background px-4 pb-24 md:ml-64 md:px-8 md:pb-8 md:pt-8",
        showMobileTopBar ? "pt-18" : "pt-4"
      )}
    >
      {children}
    </main>
  )
}
