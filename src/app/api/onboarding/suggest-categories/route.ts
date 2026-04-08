import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireAuth, isAuthError } from "@/lib/auth"
import type { CategoryTemplate } from "@/lib/category-templates"

export async function POST(request: Request) {
  try {
    const auth = await requireAuth()
    if (isAuthError(auth)) return auth

    const body = await request.json()
    const { description } = body as { description: string }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Se requiere una descripcion valida" },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY no configurada")
      return NextResponse.json(
        { error: "Error de configuracion del servidor" },
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

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const textBlock = message.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      console.error("Respuesta de Anthropic sin bloque de texto")
      return NextResponse.json(
        { error: "Error al generar categorias" },
        { status: 500 }
      )
    }

    const raw = textBlock.text.trim()
    let categories: CategoryTemplate[]

    try {
      categories = JSON.parse(raw)
    } catch {
      console.error("JSON invalido de Anthropic:", raw)
      return NextResponse.json(
        { error: "Error al parsear la respuesta de IA" },
        { status: 500 }
      )
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      console.error("Respuesta no es un array valido:", categories)
      return NextResponse.json(
        { error: "Respuesta de IA con formato invalido" },
        { status: 500 }
      )
    }

    // Validar estructura basica de cada categoria
    const validTypes = ["income", "expense"]
    for (const cat of categories) {
      if (
        typeof cat.name !== "string" ||
        typeof cat.color !== "string" ||
        typeof cat.icon !== "string" ||
        !validTypes.includes(cat.type) ||
        !Array.isArray(cat.subcategories)
      ) {
        console.error("Categoria con formato invalido:", cat)
        return NextResponse.json(
          { error: "Respuesta de IA con formato invalido" },
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
