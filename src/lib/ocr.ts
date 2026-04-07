import Anthropic from "@anthropic-ai/sdk"
import { getSetting } from "@/lib/settings"

export interface OCRResult {
  monto: number | null
  moneda: "UYU" | "USD"
  comercio: string | null
  fecha: string | null // YYYY-MM-DD
  items: string[]
  confianza: "alta" | "media" | "baja"
  texto_raw: string
}

/**
 * Procesa una foto de ticket/boleta con Claude Vision.
 * Extrae monto, comercio, fecha, ítems y devuelve JSON estructurado.
 */
export async function processReceiptImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<OCRResult> {
  const apiKey = await getSetting("ANTHROPIC_API_KEY")
  const anthropic = new Anthropic({ apiKey })
  const base64 = imageBuffer.toString("base64")

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
              data: base64,
            },
          },
          {
            type: "text",
            text: `Sos un asistente de finanzas personales en Uruguay. Analizá esta imagen de un ticket o boleta de compra.

Extraé la siguiente información y respondé ÚNICAMENTE con un JSON válido (sin markdown, sin backticks):

{
  "monto": <número total en la moneda detectada, o null si no se lee>,
  "moneda": "UYU" o "USD",
  "comercio": "<nombre del comercio o null>",
  "fecha": "<YYYY-MM-DD o null si no se lee>",
  "items": ["<lista de ítems principales si se leen>"],
  "confianza": "alta" | "media" | "baja",
  "texto_raw": "<transcripción breve del texto visible>"
}

Reglas:
- Si la imagen NO es un ticket/boleta/factura, respondé: {"error": "no_ticket"}
- Si el monto es ilegible, poné null y confianza "baja"
- El monto siempre es el TOTAL de la boleta (no subtotales)
- Moneda: en Uruguay asumir UYU salvo que diga USD o U$S
- Fecha: si solo dice día/mes, asumir el año actual (2026)`,
          },
        ],
      },
    ],
  })

  const text =
    response.content[0].type === "text" ? response.content[0].text : ""

  try {
    const parsed = JSON.parse(text)

    if (parsed.error === "no_ticket") {
      return {
        monto: null,
        moneda: "UYU",
        comercio: null,
        fecha: null,
        items: [],
        confianza: "baja",
        texto_raw: "La imagen no parece ser un ticket o boleta.",
      }
    }

    return {
      monto: parsed.monto ?? null,
      moneda: parsed.moneda === "USD" ? "USD" : "UYU",
      comercio: parsed.comercio ?? null,
      fecha: parsed.fecha ?? null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      confianza: parsed.confianza ?? "media",
      texto_raw: parsed.texto_raw ?? "",
    }
  } catch {
    return {
      monto: null,
      moneda: "UYU",
      comercio: null,
      fecha: null,
      items: [],
      confianza: "baja",
      texto_raw: text.slice(0, 500),
    }
  }
}
