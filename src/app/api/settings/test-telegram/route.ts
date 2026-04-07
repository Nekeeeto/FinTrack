import { NextResponse } from "next/server"
import { getSetting } from "@/lib/settings"

export async function POST() {
  try {
    const token = await getSetting("TELEGRAM_BOT_TOKEN")
    const chatId = await getSetting("TELEGRAM_CHAT_ID")

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "TELEGRAM_BOT_TOKEN no está configurado." },
        { status: 400 }
      )
    }

    if (!chatId) {
      return NextResponse.json(
        { ok: false, error: "TELEGRAM_CHAT_ID no está configurado. Mandá /start al bot y copiá tu chat ID." },
        { status: 400 }
      )
    }

    // Enviar mensaje de prueba
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ Bot test — Conexión exitosa con Biyuya!",
      }),
    })

    const data = await res.json()

    if (!data.ok) {
      return NextResponse.json(
        { ok: false, error: `Telegram respondió: ${data.description}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, message: "Mensaje enviado a Telegram." })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
