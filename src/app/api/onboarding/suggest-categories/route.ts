import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"
import { getSetting } from "@/lib/settings"
import { trackUsage, DEFAULT_MODEL } from "@/lib/ai-usage"
import type { CategoryTemplate } from "@/lib/category-templates"

const vidaCotidianaSchema = z.object({
  vivienda: z.string().nullable(),
  delivery: z.string().nullable(),
  cocina: z.string().nullable(),
  trabajo: z.string(),
  transporte: z.array(z.string()),
  hijos: z.string().nullable(),
  mascotas: z.string().nullable(),
  detalles_extra: z.string(),
})

const crecimientoSchema = z.object({
  nombre_negocio: z.string(),
  descripcion_negocio: z.string(),
  plataformas: z.array(z.string()),
}).nullable()

const requestSchema = z.object({
  vida_cotidiana: vidaCotidianaSchema,
  crecimiento: crecimientoSchema,
  attempt: z.number().int().min(1).max(2),
})

function valOrNe(val: string | null): string {
  return val || "no especificó"
}

function buildPrompt(vida: z.infer<typeof vidaCotidianaSchema>, crec: z.infer<typeof crecimientoSchema>): string {
  let prompt = `Sos un asistente financiero experto para Uruguay y Argentina. Tenés que generar categorías financieras personalizadas para un usuario basándote en su perfil.

## Perfil del usuario

### Vida cotidiana
- Vivienda: ${valOrNe(vida.vivienda)}
- Cocina en casa: ${valOrNe(vida.cocina)}
- Pide delivery: ${valOrNe(vida.delivery)}
- Trabajo/ocupación: ${vida.trabajo || "no especificó"}
- Transporte: ${vida.transporte.length > 0 ? vida.transporte.join(", ") : "no especificó"}
- Hijos: ${valOrNe(vida.hijos)}
- Mascotas: ${valOrNe(vida.mascotas)}
${vida.detalles_extra ? `- Detalles adicionales: "${vida.detalles_extra}"` : ""}`

  if (crec) {
    prompt += `

### Emprendimiento / Negocio
- Nombre: ${crec.nombre_negocio || "no especificó"}
- Descripción: ${crec.descripcion_negocio || "no especificó"}
- Plataformas de venta: ${crec.plataformas.length > 0 ? crec.plataformas.join(", ") : "no especificó"}`
  }

  prompt += `

## Instrucciones OBLIGATORIAS
1. Generá entre 10 y 14 categorías financieras personalizadas.
2. **SIEMPRE incluí categorías de vida cotidiana** (comida, vivienda, transporte, salud, entretenimiento, etc.) adaptadas a lo que contó el usuario. Esto es OBLIGATORIO sin importar si tiene negocio.
3. ${crec ? "Como el usuario tiene un negocio/emprendimiento, agregá 2-4 categorías ESPECÍFICAS para ese negocio con subcategorías detalladas (costos, ventas, plataformas, logística, marketing, etc.)" : "No tiene negocio, enfocate solo en categorías personales."}
4. Incluí SIEMPRE categorías de ingreso ("income") Y de gasto ("expense"). Mínimo 1 de ingreso.
5. Cada categoría debe tener entre 3 y 6 subcategorías relevantes.
6. Nombres en español rioplatense (uruguayo/argentino).

Solo podés usar estos nombres de íconos: utensils, shopping-bag, home, car, bus, smile, monitor, landmark, trending-up, arrow-down-circle, wallet, briefcase, banknote, tag, heart-pulse, music

Usá colores hexadecimales lindos y distintos entre sí para cada categoría. Las subcategorías usan el mismo color que su categoría padre.

Respondé ÚNICAMENTE con un array JSON válido (sin texto adicional, sin markdown, sin backticks) con este formato exacto:

[
  {
    "name": "Nombre de la categoría",
    "color": "#hex",
    "icon": "nombre-del-icono",
    "type": "income" | "expense",
    "subcategories": [
      { "name": "Subcategoría", "color": "#hex", "icon": "nombre-del-icono" }
    ]
  }
]`

  return prompt
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth()
    if (isAuthError(auth)) return auth

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { vida_cotidiana, crecimiento, attempt } = parsed.data

    if (attempt > 2) {
      return NextResponse.json(
        { error: "Alcanzaste el límite de generaciones con IA." },
        { status: 429 }
      )
    }

    const apiKey = await getSetting("ANTHROPIC_API_KEY")
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key de Anthropic no configurada. Pedile al admin que la configure en Configuración." },
        { status: 500 }
      )
    }

    const client = new Anthropic({ apiKey })
    const modelSetting = await getSetting("ANTHROPIC_MODEL")
    const model = modelSetting || DEFAULT_MODEL

    const prompt = buildPrompt(vida_cotidiana, crecimiento)

    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    // Loguear uso de tokens
    await trackUsage(model, message, "onboarding-suggest", auth.userId).catch((err) =>
      console.error("Error tracking usage:", err)
    )

    const textBlock = message.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Error al generar categorías" },
        { status: 500 }
      )
    }

    const raw = textBlock.text.trim()
    let categories: CategoryTemplate[]

    try {
      categories = JSON.parse(raw)
    } catch {
      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          categories = JSON.parse(jsonMatch[0])
        } catch {
          console.error("JSON inválido de Anthropic:", raw.slice(0, 500))
          return NextResponse.json(
            { error: "Error al parsear la respuesta de IA. Intentá de nuevo." },
            { status: 500 }
          )
        }
      } else {
        console.error("JSON inválido de Anthropic:", raw.slice(0, 500))
        return NextResponse.json(
          { error: "Error al parsear la respuesta de IA. Intentá de nuevo." },
          { status: 500 }
        )
      }
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: "Respuesta de IA con formato inválido" },
        { status: 500 }
      )
    }

    const validTypes = ["income", "expense"]
    for (const cat of categories) {
      if (
        typeof cat.name !== "string" ||
        typeof cat.color !== "string" ||
        typeof cat.icon !== "string" ||
        !validTypes.includes(cat.type) ||
        !Array.isArray(cat.subcategories)
      ) {
        return NextResponse.json(
          { error: "Respuesta de IA con formato inválido" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error en suggest-categories:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
