import { NextResponse } from "next/server"
import webpush from "web-push"
import { supabaseAdmin } from "@/lib/supabase/server"
import { requireAuth, isAuthError } from "@/lib/auth"

// GET /api/push/vapid — obtener public key (o generar par si no existe)
export async function GET() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    // VAPID keys son globales — usar supabaseAdmin
    const { data: existing } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "VAPID_PUBLIC_KEY")
      .single()

    if (existing?.value) {
      return NextResponse.json({ publicKey: existing.value })
    }

    const vapidKeys = webpush.generateVAPIDKeys()

    await supabaseAdmin.from("settings").upsert([
      { key: "VAPID_PUBLIC_KEY", value: vapidKeys.publicKey },
      { key: "VAPID_PRIVATE_KEY", value: vapidKeys.privateKey },
    ], { onConflict: "key" })

    return NextResponse.json({ publicKey: vapidKeys.publicKey })
  } catch {
    return NextResponse.json({ error: "Error obteniendo VAPID key" }, { status: 500 })
  }
}
