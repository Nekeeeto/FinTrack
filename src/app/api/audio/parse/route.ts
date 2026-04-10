import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["income", "expense"]),
  parent_id: z.string().uuid().nullable(),
})

const accountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]),
})

const requestSchema = z.object({
  text: z.string().min(1).max(8000),
  categories: z.array(categorySchema),
  accounts: z.array(accountSchema),
})

const parsedItemSchema = z.object({
  type: z.enum(["expense", "income"]).default("expense"),
  amount: z.number().positive().nullable(),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]).nullable(),
  category_name: z.string().nullable(),
  account_name: z.string().nullable(),
  description: z.string().default(""),
  source_text: z.string().default(""),
  confidence: z.number().min(0).max(1).nullable().optional(),
})

const modelResponseSchema = z.object({
  items: z.array(parsedItemSchema),
  notes: z.array(z.string()).optional().default([]),
})

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function pickCategoryId(
  categoryName: string | null,
  itemType: "income" | "expense",
  sourceText: string,
  categories: z.infer<typeof categorySchema>[]
): string | null {
  const validCategories = categories.filter((c) => c.type === itemType)
  if (validCategories.length === 0) return null

  const normalizedName = normalizeText(categoryName || "")
  if (normalizedName) {
    const exact = validCategories.find((c) => normalizeText(c.name) === normalizedName)
    if (exact) return exact.id

    const partial = validCategories.find((c) => {
      const cat = normalizeText(c.name)
      return normalizedName.includes(cat) || cat.includes(normalizedName)
    })
    if (partial) return partial.id
  }

  const text = normalizeText(sourceText)
  const fallbackAliases: Record<string, string[]> = {
    supermercado: ["super", "supermercado", "almacen", "compras", "chino", "papas"],
    transporte: ["nafta", "combustible", "uber", "taxi", "bondi", "bus", "omnibus"],
    restaurante: ["morfi", "comida", "almuerzo", "cena", "bar", "delivery"],
    entretenimiento: ["faso", "cigarro", "cigarros", "pucho", "puchos", "tabaco"],
    salud: ["farmacia", "medico", "remedio", "clinica"],
    servicios: ["luz", "agua", "gas", "internet", "antel", "ute", "ose"],
    sueldo: ["sueldo", "salario", "nomina", "cobre", "cobro"],
  }

  for (const cat of validCategories) {
    const catName = normalizeText(cat.name)
    const aliases = fallbackAliases[catName] || []
    if (aliases.some((alias) => text.includes(alias))) {
      return cat.id
    }
  }

  return null
}

function pickAccountId(
  accountName: string | null,
  currency: "UYU" | "USD" | "BRL" | "ARS" | null,
  accounts: z.infer<typeof accountSchema>[]
): string | null {
  if (accounts.length === 0) return null
  const normalizedName = normalizeText(accountName || "")

  if (normalizedName) {
    const exact = accounts.find((a) => normalizeText(a.name) === normalizedName)
    if (exact) return exact.id

    const partial = accounts.find((a) => {
      const acc = normalizeText(a.name)
      return normalizedName.includes(acc) || acc.includes(normalizedName)
    })
    if (partial) return partial.id
  }

  if (currency) {
    const byCurrency = accounts.find((a) => a.currency === currency)
    if (byCurrency) return byCurrency.id
  }

  const general = accounts.find((a) => normalizeText(a.name) === "general")
  return general?.id ?? accounts[0]?.id ?? null
}

function extractJson(raw: string): string {
  const text = raw.trim()
  if (text.startsWith("{")) return text

  const fenced = text.match(/```json\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return fenced[1].trim()

  const generic = text.match(/\{[\s\S]*\}/)
  return generic?.[0]?.trim() || text
}

function buildPrompt(
  transcript: string,
  categories: z.infer<typeof categorySchema>[],
  accounts: z.infer<typeof accountSchema>[]
): string {
  const categoryList = categories
    .map((c) => `- ${c.name} (${c.type})`)
    .join("\n")
  const accountList = accounts
    .map((a) => `- ${a.name} (${a.currency})`)
    .join("\n")

  return [
    "Sos un parser financiero para español rioplatense (Uruguay).",
    "Tu tarea es convertir una transcripción de voz en movimientos financieros estructurados.",
    "",
    "Reglas obligatorias:",
    "1) Detectar múltiples movimientos en un solo texto. Ejemplo: '20 faso 15 papas 80 nafta' = 3 gastos separados.",
    "2) Mantener monto exacto. Si no hay monto claro, amount=null.",
    "3) Inferir type (expense/income) según contexto. Por defecto expense.",
    "4) Asignar category_name usando SOLO categorías disponibles si hay coincidencia semántica.",
    "5) Asignar account_name solo si se menciona o se infiere por moneda.",
    "6) Soportar modismos: faso, pucho/puchos, nafta, bondi, morfi, super.",
    "7) No inventar información. Si no se sabe, usar null.",
    "8) Devolver SIEMPRE JSON válido, sin markdown.",
    "",
    "Formato de salida exacto:",
    '{"items":[{"type":"expense","amount":80,"currency":"UYU","category_name":"Transporte","account_name":"GENERAL","description":"nafta","source_text":"80 nafta","confidence":0.88}],"notes":[]}',
    "",
    "Categorías disponibles:",
    categoryList || "- (sin categorías)",
    "",
    "Cuentas disponibles:",
    accountList || "- (sin cuentas)",
    "",
    "Transcripción:",
    transcript,
  ].join("\n")
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY no configurada. Agregala en Vercel." }, { status: 500 })
  }

  try {
    const body = await req.json()
    const parsedReq = requestSchema.safeParse(body)
    if (!parsedReq.success) {
      return NextResponse.json({ error: parsedReq.error.flatten() }, { status: 400 })
    }

    const { text, categories, accounts } = parsedReq.data
    const model = process.env.GROQ_AUDIO_PARSE_MODEL || "llama-3.1-8b-instant"
    const prompt = buildPrompt(text, categories, accounts)

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Extrae transacciones de texto de voz y devuelve JSON exacto.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error("Groq parse error:", groqRes.status, errText)
      return NextResponse.json(
        { error: `Error de Groq parse (${groqRes.status}): ${errText}` },
        { status: 502 }
      )
    }

    const completion = await groqRes.json()
    const rawContent = completion?.choices?.[0]?.message?.content

    if (typeof rawContent !== "string" || !rawContent.trim()) {
      return NextResponse.json({ error: "Respuesta vacía del modelo de parseo." }, { status: 502 })
    }

    const jsonText = extractJson(rawContent)
    let modelData: z.infer<typeof modelResponseSchema>
    try {
      modelData = modelResponseSchema.parse(JSON.parse(jsonText))
    } catch (err) {
      console.error("Error parseando JSON de audio parser:", err)
      return NextResponse.json({ error: "Respuesta inválida del parser de audio." }, { status: 502 })
    }

    const items = modelData.items
      .filter((item) => item.amount !== null || item.description.trim().length > 0)
      .map((item) => {
        const category_id = pickCategoryId(
          item.category_name,
          item.type,
          item.source_text || item.description,
          categories
        )
        const account_id = pickAccountId(item.account_name, item.currency, accounts)
        return {
          ...item,
          description: item.description.trim(),
          source_text: (item.source_text || item.description).trim(),
          category_id,
          account_id,
        }
      })

    return NextResponse.json({
      items,
      notes: modelData.notes,
      model,
    })
  } catch (err) {
    console.error("Error en parseo de audio:", err)
    return NextResponse.json({ error: `Error interno: ${err}` }, { status: 500 })
  }
}
