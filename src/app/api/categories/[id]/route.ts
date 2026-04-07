import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Verificar que no tenga transacciones asociadas
  const { count } = await supabaseAdmin
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)

  if (count && count > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${count} transacciones asociadas.` },
      { status: 409 }
    )
  }

  const { error } = await supabaseAdmin.from("categories").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
