import { NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"

// GET — Devuelve el perfil del usuario autenticado
export async function GET() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const { data: profile, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", auth.userId)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
