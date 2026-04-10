"use client"

import { useState } from "react"
import { format, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type DashboardPeriodPreset =
  | "today"
  | "last_7_days"
  | "this_week"
  | "this_month"
  | "last_month"
  | "this_year"

export type DashboardPeriodState =
  | { kind: "preset"; id: DashboardPeriodPreset }
  | { kind: "custom"; from: string; to: string }

export function buildDashboardQuery(period: DashboardPeriodState): string {
  if (period.kind === "custom") {
    return new URLSearchParams({
      period: "custom",
      from: period.from,
      to: period.to,
    }).toString()
  }
  return new URLSearchParams({ period: period.id }).toString()
}

export function formatDashboardRangeLabel(from: string, to: string): string {
  const a = parseISO(from)
  const b = parseISO(to)
  if (!isValid(a) || !isValid(b)) return ""
  if (from === to) {
    return format(a, "d MMM yyyy", { locale: es })
  }
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
    return `${format(a, "d", { locale: es })} – ${format(b, "d MMM yyyy", { locale: es })}`
  }
  return `${format(a, "d MMM yyyy", { locale: es })} – ${format(b, "d MMM yyyy", { locale: es })}`
}

function periodEquals(a: DashboardPeriodState, b: DashboardPeriodState): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === "preset" && b.kind === "preset") return a.id === b.id
  if (a.kind === "custom" && b.kind === "custom") return a.from === b.from && a.to === b.to
  return false
}

const QUICK: { id: DashboardPeriodPreset; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "last_7_days", label: "Últimos 7 días" },
  { id: "this_week", label: "Esta semana" },
  { id: "this_month", label: "Este mes" },
  { id: "last_month", label: "Mes pasado" },
  { id: "this_year", label: "Este año" },
]

export function DashboardPeriodFilter({
  period,
  onPeriodChange,
  disabled,
}: {
  period: DashboardPeriodState
  onPeriodChange: (next: DashboardPeriodState) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [fromDraft, setFromDraft] = useState("")
  const [toDraft, setToDraft] = useState("")
  const [customError, setCustomError] = useState("")

  function openCustomSection() {
    setCustomOpen(true)
    if (period.kind === "custom") {
      setFromDraft(period.from)
      setToDraft(period.to)
    } else {
      const t = format(new Date(), "yyyy-MM-dd")
      setFromDraft(t)
      setToDraft(t)
    }
    setCustomError("")
  }

  function applyPreset(id: DashboardPeriodPreset) {
    onPeriodChange({ kind: "preset", id })
    setOpen(false)
    setCustomOpen(false)
  }

  function applyCustom() {
    const a = parseISO(fromDraft)
    const b = parseISO(toDraft)
    if (!isValid(a) || !isValid(b)) {
      setCustomError("Revisá las fechas.")
      return
    }
    const from = format(a, "yyyy-MM-dd")
    const to = format(b, "yyyy-MM-dd")
    onPeriodChange({ kind: "custom", from, to })
    setCustomError("")
    setOpen(false)
    setCustomOpen(false)
  }

  const isCustomActive = period.kind === "custom"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        disabled={disabled}
        className={cn(
          "h-9 w-9 rounded-full bg-black/20 hover:bg-black/30 inline-flex items-center justify-center transition-colors",
          "disabled:opacity-50",
          isCustomActive || (period.kind === "preset" && period.id !== "this_month")
            ? "ring-2 ring-black/25"
            : ""
        )}
        title="Filtrar por fechas"
        aria-label="Filtrar ingresos y gastos por fechas"
      >
        <CalendarRange className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(100vw-2rem,280px)] p-3" sideOffset={8}>
        <p className="text-xs font-medium text-muted-foreground mb-2">Movimientos del período</p>
        <div className="flex flex-col gap-1">
          {QUICK.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={periodEquals(period, { kind: "preset", id: item.id }) ? "secondary" : "ghost"}
              size="sm"
              className="justify-start font-normal h-9"
              onClick={() => applyPreset(item.id)}
            >
              {item.label}
            </Button>
          ))}
          <Button
            type="button"
            variant={isCustomActive ? "secondary" : "ghost"}
            size="sm"
            className="justify-start font-normal h-9"
            onClick={() => (customOpen ? setCustomOpen(false) : openCustomSection())}
          >
            Personalizado…
          </Button>
        </div>
        {customOpen && (
          <div className="mt-3 pt-3 border-t border-border space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="dash-from" className="text-xs">
                  Desde
                </Label>
                <Input
                  id="dash-from"
                  type="date"
                  value={fromDraft}
                  onChange={(e) => setFromDraft(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dash-to" className="text-xs">
                  Hasta
                </Label>
                <Input
                  id="dash-to"
                  type="date"
                  value={toDraft}
                  onChange={(e) => setToDraft(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            {customError && <p className="text-xs text-red-500">{customError}</p>}
            <Button type="button" size="sm" className="w-full" onClick={applyCustom}>
              Aplicar fechas
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
