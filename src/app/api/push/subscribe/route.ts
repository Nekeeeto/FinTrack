import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

// POST /api/push/subscribe
export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const body = await req.json()
    const parsed = subscriptionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { endpoint, keys } = parsed.data

    const { error } = await auth.supabase
      .from("push_subscriptions")
      .upsert(
        { endpoint, p256dh: keys.p256dh, auth: keys.auth, user_id: auth.userId },
        { onConflict: "endpoint" }
      )

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error guardando suscripción" }, { status: 500 })
  }
}

// DELETE /api/push/subscribe
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: "Falta endpoint" }, { status: 400 })

    await auth.supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("user_id", auth.userId)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error eliminando suscripción" }, { status: 500 })
  }
}
