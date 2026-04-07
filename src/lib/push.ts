import webpush from "web-push"
import { supabaseAdmin } from "@/lib/supabase/server"

// Obtener VAPID keys de la BD
async function getVapidKeys() {
  const { data: publicKey } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "VAPID_PUBLIC_KEY")
    .single()

  const { data: privateKey } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "VAPID_PRIVATE_KEY")
    .single()

  if (!publicKey?.value || !privateKey?.value) return null

  return {
    publicKey: publicKey.value,
    privateKey: privateKey.value,
  }
}

export async function sendPushNotification(title: string, body: string, url?: string, userId?: string) {
  const keys = await getVapidKeys()
  if (!keys) return { sent: 0 }

  webpush.setVapidDetails(
    "mailto:biyuya@example.com",
    keys.publicKey,
    keys.privateKey
  )

  // Obtener suscripciones del usuario (o todas si no se especifica)
  let query = supabaseAdmin.from("push_subscriptions").select("*")
  if (userId) query = query.eq("user_id", userId)
  const { data: subs } = await query

  if (!subs || subs.length === 0) return { sent: 0 }

  const payload = JSON.stringify({ title, body, url: url ?? "/" })

  let sent = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      )
      sent++
    } catch (err: unknown) {
      // Si la suscripción expiró, eliminarla
      const statusCode = (err as { statusCode?: number })?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint)
      }
    }
  }

  return { sent }
}
