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

    const { data: usageData } = await supabaseAdmin
      .from("model_usage")
      .select("cost_usd")
      .eq("user_id", id)

    const totalModelCost = (usageData ?? []).reduce(
      (sum, row) => sum + (Number(row.cost_usd) || 0),
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

// Esquema de validación para actualizar perfil (admin)
const updateProfileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email("Email inválido").optional(),
    role: z.enum(["admin", "user"]).optional(),
    plan: z.enum(["free", "premium"]).optional(),
    onboarding_completed: z.boolean().optional(),
    photo_count_month: z.number().int().min(0).max(10_000_000).optional(),
    password: z
      .union([
        z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        z.literal(""),
      ])
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.email !== undefined ||
      data.role !== undefined ||
      data.plan !== undefined ||
      data.onboarding_completed !== undefined ||
      data.photo_count_month !== undefined ||
      (data.password !== undefined && data.password.length >= 6),
    { message: "Debe enviar al menos un campo para actualizar" }
  )

// PATCH — Actualizar perfil de usuario (y opcionalmente auth: email / contraseña)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Datos inválidos"
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", id)
      .single()

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const incoming = parsed.data

    if (id === auth.userId && incoming.role === "user") {
      return NextResponse.json(
        { error: "No podés quitarte el rol de administrador" },
        { status: 400 }
      )
    }

    if (existing.role === "admin" && incoming.role === "user") {
      const { count } = await supabaseAdmin
        .from("user_profiles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "admin")

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "Tiene que haber al menos un administrador" },
          { status: 400 }
        )
      }
    }

    const newEmail =
      incoming.email !== undefined ? incoming.email.trim() : undefined
    if (newEmail && newEmail !== existing.email) {
      const { data: dup } = await supabaseAdmin
        .from("user_profiles")
        .select("user_id")
        .eq("email", newEmail)
        .neq("user_id", id)
        .maybeSingle()

      if (dup) {
        return NextResponse.json(
          { error: "Ya existe otro usuario con ese email" },
          { status: 409 }
        )
      }
    }

    const authAttrs: {
      email?: string
      password?: string
      email_confirm?: boolean
    } = {}
    if (newEmail && newEmail !== existing.email) {
      authAttrs.email = newEmail
      authAttrs.email_confirm = true
    }
    if (incoming.password !== undefined && incoming.password.length >= 6) {
      authAttrs.password = incoming.password
    }

    if (Object.keys(authAttrs).length > 0) {
      const { error: authUpdateErr } =
        await supabaseAdmin.auth.admin.updateUserById(id, authAttrs)
      if (authUpdateErr) {
        return NextResponse.json({ error: authUpdateErr.message }, { status: 500 })
      }
    }

    const row: Record<string, string | boolean | number> = {}
    if (incoming.name !== undefined) row.name = incoming.name
    if (incoming.role !== undefined) row.role = incoming.role
    if (incoming.plan !== undefined) row.plan = incoming.plan
    if (incoming.onboarding_completed !== undefined) {
      row.onboarding_completed = incoming.onboarding_completed
    }
    if (incoming.photo_count_month !== undefined) {
      row.photo_count_month = incoming.photo_count_month
    }
    if (newEmail && newEmail !== existing.email) {
      row.email = newEmail
    }

    let updated = existing
    if (Object.keys(row).length > 0) {
      const { data: up, error: updErr } = await supabaseAdmin
        .from("user_profiles")
        .update(row)
        .eq("user_id", id)
        .select()
        .single()

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 500 })
      }
      if (up) updated = up
    }

    const { count: transactionCount } = await supabaseAdmin
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id)

    const { data: usageData } = await supabaseAdmin
      .from("model_usage")
      .select("cost_usd")
      .eq("user_id", id)

    const totalModelCost = (usageData ?? []).reduce(
      (sum, r) => sum + (Number(r.cost_usd) || 0),
      0
    )

    return NextResponse.json({
      ...updated,
      transaction_count: transactionCount ?? 0,
      total_model_cost: totalModelCost,
    })
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
