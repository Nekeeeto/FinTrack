import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, isAuthError } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"

type RouteParams = { params: Promise<{ id: string }> }

// GET — Últimas 10 transacciones de un usuario
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

  const { id } = await params

  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", id)
      .order("date", { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
