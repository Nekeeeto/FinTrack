import { NextRequest, NextResponse } from "next/server"
import { getSettings, setSetting, type SettingKey } from "@/lib/settings"

const ALLOWED_KEYS: SettingKey[] = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "ANTHROPIC_API_KEY",
  "TELEGRAM_CHAT_ID",
  "ANTHROPIC_MODEL",
]

// GET /api/settings — devuelve las settings (valores enmascarados)
export async function GET() {
  try {
    const settings = await getSettings(ALLOWED_KEYS)

    // Enmascarar valores sensibles para mostrar en UI
    const masked: Record<string, { configured: boolean; preview: string }> = {}
    for (const key of ALLOWED_KEYS) {
      const val = settings[key] || ""
      masked[key] = {
        configured: val.length > 0,
        preview: val.length > 8 ? `${val.slice(0, 4)}...${val.slice(-4)}` : val ? "****" : "",
      }
    }

    return NextResponse.json(masked)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/settings — guarda una setting
export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json()

    if (!ALLOWED_KEYS.includes(key)) {
      return NextResponse.json({ error: "Key no permitida" }, { status: 400 })
    }

    await setSetting(key, value)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
