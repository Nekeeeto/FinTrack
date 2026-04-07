import { NextResponse } from "next/server"
import { requireAdmin, isAuthError } from "@/lib/auth"
import { getSetting } from "@/lib/settings"
import Anthropic from "@anthropic-ai/sdk"

export async function POST() {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

  try {
    const apiKey = await getSetting("ANTHROPIC_API_KEY")

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "ANTHROPIC_API_KEY no está configurada." },
        { status: 400 }
      )
    }

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 50,
      messages: [{ role: "user", content: "Respondé solo 'OK' si podés leer esto." }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    return NextResponse.json({
      ok: true,
      message: `Anthropic respondió: "${text.trim()}"`,
      model: response.model,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
