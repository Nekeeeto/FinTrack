import { NextResponse } from "next/server"
import { createUserClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import type { SupabaseClient, User } from "@supabase/supabase-js"

export interface AuthResult {
  user: User
  userId: string
  supabase: SupabaseClient
}

// Devuelve el usuario autenticado o null
export async function getAuthUser(): Promise<AuthResult | null> {
  const supabase = await createUserClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  return { user, userId: user.id, supabase }
}

// Helper para API routes — devuelve AuthResult o NextResponse 401
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const auth = await getAuthUser()
  if (!auth) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  return auth
}

// Helper para rutas admin — verifica role === 'admin' en user_profiles
export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  const auth = await getAuthUser()
  if (!auth) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("role")
    .eq("user_id", auth.userId)
    .single()

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  return auth
}

// Type guard para verificar si el resultado es un error HTTP
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}
