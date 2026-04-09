"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function LandingThemeSwitch({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  if (!mounted) {
    return (
      <div
        className={cn("h-7 w-11 shrink-0 rounded-full bg-white/10", className)}
        aria-hidden
      />
    )
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-7 w-11 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-[colors,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5DBCD2] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDark
          ? "justify-end border-white/20 bg-white/10"
          : "justify-start border-slate-300/90 bg-slate-200/90 shadow-inner",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none flex h-5 w-5 items-center justify-center rounded-full shadow-md transition-transform duration-200",
          isDark ? "bg-[#5DBCD2] text-[#020617]" : "bg-white text-amber-500"
        )}
      >
        {isDark ? (
          <Moon className="h-3 w-3" aria-hidden />
        ) : (
          <Sun className="h-3 w-3" aria-hidden />
        )}
      </span>
    </button>
  )
}
