import type { User } from "@supabase/supabase-js"
import { supabaseAdmin } from "@/lib/supabase/server"

/**
 * Garantiza una fila en user_profiles tras login (OAuth, signUp o magic link).
 * Usa service role (bypasea RLS). Idempotente: no pisa perfil existente.
 */
export async function ensureUserProfile(user: User): Promise<void> {
  const { data: existing } = await supabaseAdmin
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) return

  const email = user.email ?? ""
  const meta = user.user_metadata ?? {}
  const name =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    (email ? email.split("@")[0] : "") ||
    "Usuario"

  const { error } = await supabaseAdmin.from("user_profiles").insert({
    user_id: user.id,
    email,
    name,
    role: "user",
    plan: "free",
    onboarding_completed: false,
  })

  if (error) {
    console.error("[ensureUserProfile]", error.message)
  }
}
