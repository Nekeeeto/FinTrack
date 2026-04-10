"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * Padding superior en móvil: con barra fija de inicio, altura = safe-area + h-16 + separación (~1rem).
 * Sin barra: respeta notch y deja aire similar al eje horizontal (px-4 ≈ 1rem).
 */
export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showMobileTopBar = pathname === "/inicio"

  return (
    <main
      className={cn(
        "flex-1 min-w-0 bg-background px-4 pb-24 md:ml-64 md:px-8 md:pb-8 md:pt-8",
        showMobileTopBar
          ? "max-md:pt-[calc(env(safe-area-inset-top,0px)+4rem+1rem)]"
          : "max-md:pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]"
      )}
    >
      {children}
    </main>
  )
}
