import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, isAuthError } from "@/lib/auth"
import { getSettings, setSetting, type SettingKey } from "@/lib/settings"

const ALLOWED_KEYS: SettingKey[] = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "ANTHROPIC_API_KEY",
  "TELEGRAM_CHAT_ID",
  "ANTHROPIC_MODEL",
]

// GET /api/settings — admin only
export async function GET() {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

  try {
    const settings = await getSettings(ALLOWED_KEYS)

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

// POST /api/settings — admin only
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

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
