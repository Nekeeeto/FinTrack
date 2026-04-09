import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY no configurada. Agregala en Vercel." }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const audio = formData.get("audio") as File | null

    if (!audio) {
      return NextResponse.json({ error: "No se recibió audio" }, { status: 400 })
    }

    // Convertir a buffer para re-enviar a Groq correctamente
    const arrayBuffer = await audio.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Detectar extensión según el tipo MIME
    const mimeType = audio.type || "audio/webm"
    const ext = mimeType.includes("mp4") ? "mp4"
      : mimeType.includes("ogg") ? "ogg"
      : mimeType.includes("wav") ? "wav"
      : "webm"

    const file = new File([buffer], `audio.${ext}`, { type: mimeType })

    // Enviar a Groq Whisper
    const groqForm = new FormData()
    groqForm.append("file", file)
    groqForm.append("model", "whisper-large-v3-turbo")
    groqForm.append("language", "es")
    groqForm.append("response_format", "json")

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqForm,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Groq error:", res.status, errText)
      return NextResponse.json(
        { error: `Error de Groq (${res.status}): ${errText}` },
        { status: 502 }
      )
    }

    const data = await res.json()

    return NextResponse.json({ text: data.text })
  } catch (err) {
    console.error("Error en transcripción:", err)
    return NextResponse.json({ error: `Error interno: ${err}` }, { status: 500 })
  }
}
