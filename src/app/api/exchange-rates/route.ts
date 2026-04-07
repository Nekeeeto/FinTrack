import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { fetchBCURates, fetchExchangeRateAPIRates } from "@/lib/currency"

/**
 * GET /api/exchange-rates
 * Devuelve las cotizaciones más recientes.
 * Si las últimas tienen más de 4 horas, intenta actualizar desde BCU.
 */
export async function GET() {
  try {
    // Obtener las cotizaciones más recientes
    const { data: rates } = await supabaseAdmin
      .from("exchange_rates")
      .select("*")
      .order("fetched_at", { ascending: false })
      .limit(10)

    // Agrupar por par de monedas (más reciente de cada una)
    const latestByPair: Record<string, typeof rates extends (infer T)[] | null ? T : never> = {}
    for (const rate of rates || []) {
      const key = `${rate.base_currency}-${rate.target_currency}`
      if (!latestByPair[key]) {
        latestByPair[key] = rate
      }
    }

    const latestRates = Object.values(latestByPair)

    // Verificar si necesitamos actualizar (más de 4 horas)
    const needsUpdate = latestRates.length === 0 || latestRates.some((r) => {
      const age = Date.now() - new Date(r.fetched_at).getTime()
      return age > 4 * 60 * 60 * 1000 // 4 horas
    })

    if (needsUpdate) {
      // Intentar actualizar en background (no bloquear la respuesta)
      refreshRates().catch(console.error)
    }

    return NextResponse.json({
      rates: latestRates,
      last_updated: latestRates[0]?.fetched_at || null,
    })
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 })
  }
}

/**
 * POST /api/exchange-rates/refresh
 * Fuerza actualización de cotizaciones
 */
export async function POST() {
  try {
    const result = await refreshRates()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error refreshing rates:", error)
    return NextResponse.json({ error: "Error al actualizar cotizaciones" }, { status: 500 })
  }
}

async function refreshRates() {
  let source = "bcu"
  let ratesData

  try {
    // Intentar BCU primero
    ratesData = await fetchBCURates()
    if (ratesData.length === 0) throw new Error("BCU devolvió 0 cotizaciones")
  } catch (bcuError) {
    console.warn("BCU falló, usando exchangerate-api como fallback:", bcuError)
    try {
      ratesData = await fetchExchangeRateAPIRates()
      source = "exchangerate-api"
    } catch (fallbackError) {
      throw new Error(`No se pudieron obtener cotizaciones: BCU y fallback fallaron`)
    }
  }

  const now = new Date().toISOString()
  const rows = ratesData.map((r) => ({
    base_currency: "UYU",
    target_currency: r.currency,
    buy_rate: r.buy,
    sell_rate: r.sell,
    source,
    fetched_at: now,
  }))

  const { error } = await supabaseAdmin.from("exchange_rates").insert(rows)
  if (error) {
    console.error("Error guardando cotizaciones:", error)
    throw error
  }

  return { updated: true, source, currencies: ratesData.map((r) => r.currency), fetched_at: now }
}
