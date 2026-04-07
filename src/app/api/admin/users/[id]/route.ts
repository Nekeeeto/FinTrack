import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin, isAuthError } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"

type RouteParams = { params: Promise<{ id: string }> }

// GET — Detalle de un usuario con estadísticas
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

  const { id } = await params

  try {
    // Obtener perfil
    const { data: profile, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", id)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Obtener cantidad de transacciones
    const { count: transactionCount } = await supabaseAdmin
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id)

    // Obtener costo total de model_usage
    const { data: usageData } = await supabaseAdmin
      .from("model_usage")
      .select("cost")
      .eq("user_id", id)

    const totalModelCost = (usageData ?? []).reduce(
      (sum, row) => sum + (Number(row.cost) || 0),
      0
    )

    return NextResponse.json({
      ...profile,
      transaction_count: transactionCount ?? 0,
      total_model_cost: totalModelCost,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Esquema de validación para actualizar perfil
const updateProfileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    role: z.enum(["admin", "user"]).optional(),
    plan: z.enum(["free", "premium"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar",
  })

// PATCH — Actualizar perfil de usuario
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { data: updated, error } = await supabaseAdmin
      .from("user_profiles")
      .update(parsed.data)
      .eq("user_id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — Eliminar usuario (auth + perfil)
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

  const { id } = await params

  // No permitir que el admin se elimine a sí mismo
  if (id === auth.userId) {
    return NextResponse.json(
      { error: "No podés eliminarte a vos mismo" },
      { status: 400 }
    )
  }

  try {
    // Eliminar de user_profiles (cascade se encarga del resto)
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .delete()
      .eq("user_id", id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Eliminar de Supabase Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
