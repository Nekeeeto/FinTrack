"use client"

import { useEffect, useState } from "react"
import { ChevronDown, RefreshCw } from "lucide-react"
import type { ExchangeRate } from "@/types/database"

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  BRL: "🇧🇷",
  ARS: "🇦🇷",
}

const CURRENCY_NAMES: Record<string, string> = {
  USD: "Dólar",
  BRL: "Real brasileño",
  ARS: "Peso argentino",
}

export function ExchangeRatesWidget() {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function fetchRates() {
    try {
      const res = await fetch("/api/exchange-rates")
      const data = await res.json()
      setRates(data.rates || [])
      setLastUpdated(data.last_updated)
    } catch {
      console.error("Error cargando cotizaciones")
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await fetch("/api/exchange-rates", { method: "POST" })
      await fetchRates()
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  // Las tasas del BCU vienen como: cuántos UYU cuesta 1 unidad extranjera
  // Pero nosotros guardamos base=UYU, target=X, rate = cuántas X por 1 UYU
  // Para mostrar al usuario: "1 USD = X UYU" necesitamos invertir
  function getDisplayRate(rate: ExchangeRate) {
    if (rate.buy_rate > 0 && rate.buy_rate < 1) {
      // Guardado como fracción: 1 UYU = 0.023 USD -> invertir para mostrar 1 USD = 42 UYU
      return {
        buy: (1 / rate.sell_rate), // Invertimos compra/venta
        sell: (1 / rate.buy_rate),
        label: `1 ${rate.target_currency} =`,
        suffix: "UYU",
      }
    }
    // Ya está como 1 X = N UYU (viene del BCU directamente)
    return {
      buy: rate.buy_rate,
      sell: rate.sell_rate,
      label: `1 ${rate.target_currency} =`,
      suffix: "UYU",
    }
  }

  const formatRate = (n: number) =>
    n.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const timeAgo = lastUpdated
    ? getTimeAgo(new Date(lastUpdated))
    : null

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center justify-between rounded-md px-1 py-0.5 text-left transition-colors hover:bg-accent/60"
          aria-expanded={expanded}
          aria-label="Mostrar u ocultar cotizaciones"
        >
          <span className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Cotizaciones</h3>
            {timeAgo ? <span className="text-xs text-muted-foreground">{timeAgo}</span> : null}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-md p-1 transition-colors hover:bg-accent disabled:opacity-50"
            title="Actualizar cotizaciones"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {expanded ? (
        <>
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Cargando cotizaciones...
            </div>
          ) : rates.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Sin cotizaciones disponibles.
              <button onClick={handleRefresh} className="text-emerald-500 ml-1 hover:underline">
                Actualizar
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rates
                .filter((r) => r.target_currency !== "UYU")
                .sort((a, b) => {
                  const order = ["USD", "BRL", "ARS"]
                  return order.indexOf(a.target_currency) - order.indexOf(b.target_currency)
                })
                .map((rate) => {
                  const display = getDisplayRate(rate)
                  return (
                    <div key={rate.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-lg">{CURRENCY_FLAGS[rate.target_currency] || "💱"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {CURRENCY_NAMES[rate.target_currency] || rate.target_currency}
                        </p>
                        <p className="text-xs text-muted-foreground">{display.label}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3 text-sm">
                          <div>
                            <span className="text-xs text-muted-foreground block">Compra</span>
                            <span className="font-semibold text-emerald-500">
                              ${formatRate(display.buy)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">Venta</span>
                            <span className="font-semibold text-red-400">
                              ${formatRate(display.sell)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
          {rates.length > 0 && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground">
                Fuente: {rates[0]?.source === "bcu" ? "BCU (Banco Central del Uruguay)" : rates[0]?.source === "manual" ? "Manual" : "ExchangeRate API"}
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "ahora"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}
