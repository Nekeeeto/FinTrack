import { supabaseAdmin } from "@/lib/supabase/server"

export type SettingKey =
  | "TELEGRAM_BOT_TOKEN"
  | "TELEGRAM_WEBHOOK_SECRET"
  | "ANTHROPIC_API_KEY"
  | "TELEGRAM_CHAT_ID"

/**
 * Obtiene un setting de la DB. Si no existe, usa el env var como fallback.
 */
export async function getSetting(key: SettingKey): Promise<string> {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", key)
    .single()

  if (data?.value) return data.value

  // Fallback a env vars
  return process.env[key] ?? ""
}

/** Obtiene múltiples settings de una vez */
export async function getSettings(keys: SettingKey[]): Promise<Record<string, string>> {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("key, value")
    .in("key", keys)

  const result: Record<string, string> = {}
  for (const key of keys) {
    const found = data?.find((d) => d.key === key)
    result[key] = found?.value || process.env[key] || ""
  }
  return result
}

/** Guarda o actualiza un setting */
export async function setSetting(key: SettingKey, value: string) {
  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })

  if (error) throw new Error(`Error guardando setting ${key}: ${error.message}`)
}
