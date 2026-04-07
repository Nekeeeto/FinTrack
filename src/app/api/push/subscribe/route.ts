import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/server"

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

// POST /api/push/subscribe — guardar suscripción push
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = subscriptionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { endpoint, keys } = parsed.data

    // Upsert: si ya existe el endpoint, actualizar keys
    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(
        { endpoint, p256dh: keys.p256dh, auth: keys.auth },
        { onConflict: "endpoint" }
      )

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error guardando suscripción" }, { status: 500 })
  }
}

// DELETE /api/push/subscribe — eliminar suscripción
export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: "Falta endpoint" }, { status: 400 })

    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error eliminando suscripción" }, { status: 500 })
  }
}
