import type { Currency, ExchangeRate } from "@/types/database"

// Códigos BCU para cada moneda
const BCU_CURRENCY_CODES: Record<string, number> = {
  USD: 2225,
  BRL: 1055,
  ARS: 500,
}

// Monedas soportadas (excluyendo UYU que es la base)
export const SUPPORTED_CURRENCIES: Currency[] = ["UYU", "USD", "BRL", "ARS"]
export const FOREIGN_CURRENCIES = ["USD", "BRL", "ARS"] as const

interface BCURateResult {
  currency: string
  buy: number
  sell: number
}

/**
 * Obtiene cotizaciones desde el BCU (Banco Central del Uruguay) via SOAP
 * El BCU publica tasas de referencia: cuántos UYU por 1 unidad de moneda extranjera
 */
export async function fetchBCURates(): Promise<BCURateResult[]> {
  const today = new Date()
  const dateStr = formatBCUDate(today)

  const currencyCodes = Object.values(BCU_CURRENCY_CODES)
  const monedaItems = currencyCodes.map((code) => `<wsbcu:item>${code}</wsbcu:item>`).join("")

  const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsbcu="wsbcu">
  <soapenv:Header/>
  <soapenv:Body>
    <wsbcu:Execute>
      <wsbcu:Ession>
        <wsbcu:Ession>0</wsbcu:Ession>
      </wsbcu:Ession>
      <wsbcu:Moneda>
        ${monedaItems}
      </wsbcu:Moneda>
      <wsbcu:FechaDesde>${dateStr}</wsbcu:FechaDesde>
      <wsbcu:FechaHasta>${dateStr}</wsbcu:FechaHasta>
      <wsbcu:Grupo>0</wsbcu:Grupo>
    </wsbcu:Execute>
  </wsbcu:Body>
</soapenv:Envelope>`

  const res = await fetch(
    "https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsbcucotizaciones",
    {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        SOAPAction: "Execute",
      },
      body: soapBody,
      signal: AbortSignal.timeout(10000),
    }
  )

  if (!res.ok) {
    throw new Error(`BCU API error: ${res.status}`)
  }

  const xml = await res.text()
  return parseBCUResponse(xml)
}

function formatBCUDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Parsea la respuesta SOAP del BCU.
 * El BCU devuelve tasas como "cuántos UYU cuesta 1 unidad de moneda extranjera"
 * Ej: USD = 42.5 significa 1 USD = 42.5 UYU
 */
function parseBCUResponse(xml: string): BCURateResult[] {
  const results: BCURateResult[] = []

  // Mapeo inverso: código BCU -> nombre moneda
  const codeToName: Record<number, string> = {}
  for (const [name, code] of Object.entries(BCU_CURRENCY_CODES)) {
    codeToName[code] = name
  }

  // Buscar cada bloque de cotización en el XML
  // El BCU devuelve <Datum> blocks con <Moneda>, <TCC> (compra) y <TCV> (venta)
  const datumRegex = /<Datum>([\s\S]*?)<\/Datum>/g
  let match

  while ((match = datumRegex.exec(xml)) !== null) {
    const block = match[1]

    const moneda = extractXMLValue(block, "Moneda")
    const tcc = extractXMLValue(block, "TCC") // Tipo Cambio Compra
    const tcv = extractXMLValue(block, "TCV") // Tipo Cambio Venta

    if (moneda && tcc && tcv) {
      const code = parseInt(moneda)
      const currency = codeToName[code]
      if (currency) {
        results.push({
          currency,
          buy: parseFloat(tcc),
          sell: parseFloat(tcv),
        })
      }
    }
  }

  return results
}

function extractXMLValue(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`)
  const match = regex.exec(xml)
  return match ? match[1].trim() : null
}

/**
 * Fallback: obtiene cotizaciones desde exchangerate-api.com (free tier)
 * Devuelve tasas cruzadas relativas a UYU
 */
export async function fetchExchangeRateAPIRates(): Promise<BCURateResult[]> {
  const res = await fetch(
    "https://open.er-api.com/v6/latest/UYU",
    { signal: AbortSignal.timeout(10000) }
  )

  if (!res.ok) {
    throw new Error(`ExchangeRate API error: ${res.status}`)
  }

  const data = await res.json()
  if (data.result !== "success") {
    throw new Error("ExchangeRate API returned error")
  }

  const rates = data.rates as Record<string, number>
  const results: BCURateResult[] = []

  for (const currency of FOREIGN_CURRENCIES) {
    const rate = rates[currency]
    if (rate) {
      // rate = cuántos [currency] por 1 UYU
      // Nosotros guardamos como: 1 UYU = X [currency] (compra/venta, sin spread en API free)
      results.push({
        currency,
        buy: rate,
        sell: rate,
      })
    }
  }

  return results
}

/**
 * Convierte un monto de una moneda a otra usando las tasas disponibles.
 * Las tasas están guardadas como: base=UYU, target=X, buy/sell = cuántas X por 1 UYU
 *
 * Para convertir:
 * - UYU -> USD: amount * rate (UYU->USD)
 * - USD -> UYU: amount / rate (UYU->USD)
 * - BRL -> USD: BRL->UYU->USD (doble conversión)
 */
export function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRate[]
): number {
  if (from === to) return amount

  // Si uno de los dos es UYU, conversión directa
  if (from === "UYU") {
    const rate = rates.find((r) => r.base_currency === "UYU" && r.target_currency === to)
    if (!rate) return amount
    return amount * rate.sell_rate // Vendemos UYU, compramos otra
  }

  if (to === "UYU") {
    const rate = rates.find((r) => r.base_currency === "UYU" && r.target_currency === from)
    if (!rate) return amount
    return amount / rate.buy_rate // Compramos UYU, vendemos otra
  }

  // Cruzado: from -> UYU -> to
  const fromToUYU = convertAmount(amount, from, "UYU", rates)
  return convertAmount(fromToUYU, "UYU", to, rates)
}

/**
 * Convierte un monto a UYU (moneda base del sistema) usando tasa promedio
 */
export function toUYU(
  amount: number,
  currency: Currency,
  rates: ExchangeRate[]
): number {
  if (currency === "UYU") return amount
  return convertAmount(amount, currency, "UYU", rates)
}
