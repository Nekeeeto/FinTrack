import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireAuth, isAuthError } from "@/lib/auth"
import { getSetting } from "@/lib/settings"
import type { CategoryTemplate } from "@/lib/category-templates"

export async function POST(request: Request) {
  try {
    const auth = await requireAuth()
    if (isAuthError(auth)) return auth

    const body = await request.json()
    const { description } = body as { description: string }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Se requiere una descripción válida" },
        { status: 400 }
      )
    }

    const apiKey = await getSetting("ANTHROPIC_API_KEY")
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY no configurada en settings ni en env")
      return NextResponse.json(
        { error: "API key de Anthropic no configurada. Pedile al admin que la configure en Configuración." },
        { status: 500 }
      )
    }

    const client = new Anthropic({ apiKey })

    const prompt = `Sos un asistente financiero experto. El usuario describe lo que hace o su negocio asi:

"${description.trim()}"

Genera entre 8 y 12 categorias financieras personalizadas para esta persona. Debe incluir tanto categorias de ingreso ("income") como de gasto ("expense"). Cada categoria debe tener entre 3 y 6 subcategorias.

Usa nombres en español rioplatense (argentino/uruguayo).

Solo podes usar estos nombres de iconos: utensils, shopping-bag, home, car, bus, smile, monitor, landmark, trending-up, arrow-down-circle, wallet, briefcase, banknote, tag, heart-pulse, music

Usa colores hexadecimales lindos y distintos entre si para cada categoria. Las subcategorias pueden usar el mismo color que su categoria padre.

Responde UNICAMENTE con un array JSON valido (sin texto adicional, sin markdown, sin backticks) con este formato exacto:

[
  {
    "name": "Nombre de la categoria",
    "color": "#hex",
    "icon": "nombre-del-icono",
    "type": "income" | "expense",
    "subcategories": [
      { "name": "Subcategoria", "color": "#hex", "icon": "nombre-del-icono" }
    ]
  }
]`

    const modelSetting = await getSetting("ANTHROPIC_MODEL")
    const model = modelSetting || "claude-sonnet-4-20250514"

    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const textBlock = message.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      console.error("Respuesta de Anthropic sin bloque de texto")
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
      // Intentar extraer JSON del texto si viene con markdown
      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          categories = JSON.parse(jsonMatch[0])
        } catch {
          console.error("JSON inválido de Anthropic:", raw)
          return NextResponse.json(
            { error: "Error al parsear la respuesta de IA" },
            { status: 500 }
          )
        }
      } else {
        console.error("JSON inválido de Anthropic:", raw)
        return NextResponse.json(
          { error: "Error al parsear la respuesta de IA" },
          { status: 500 }
        )
      }
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      console.error("Respuesta no es un array válido:", categories)
      return NextResponse.json(
        { error: "Respuesta de IA con formato inválido" },
        { status: 500 }
      )
    }

    // Validar estructura básica de cada categoría
    const validTypes = ["income", "expense"]
    for (const cat of categories) {
      if (
        typeof cat.name !== "string" ||
        typeof cat.color !== "string" ||
        typeof cat.icon !== "string" ||
        !validTypes.includes(cat.type) ||
        !Array.isArray(cat.subcategories)
      ) {
        console.error("Categoría con formato inválido:", cat)
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
