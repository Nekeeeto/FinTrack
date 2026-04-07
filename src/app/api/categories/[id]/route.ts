import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params
  const body = await req.json()

  const { data, error } = await auth.supabase
    .from("categories")
    .update(body)
    .eq("id", id)
    .eq("user_id", auth.userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params

  const { count } = await auth.supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("user_id", auth.userId)

  if (count && count > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${count} transacciones asociadas.` },
      { status: 409 }
    )
  }

  const { error } = await auth.supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
