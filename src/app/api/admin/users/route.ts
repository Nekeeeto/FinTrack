import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin, isAuthError } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"

// GET — Listar todos los usuarios con estadísticas
export async function GET() {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

  try {
    // Traer todos los perfiles
    const { data: profiles, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: usageRows, error: usageErr } = await supabaseAdmin
      .from("model_usage")
      .select("user_id, cost_usd")

    if (usageErr) {
      return NextResponse.json({ error: usageErr.message }, { status: 500 })
    }

    const costByUserId = new Map<string, number>()
    for (const row of usageRows ?? []) {
      if (row.user_id == null) continue
      const add = Number(row.cost_usd) || 0
      costByUserId.set(row.user_id, (costByUserId.get(row.user_id) ?? 0) + add)
    }

    // Por usuario: transacciones + costo modelo (columna real: cost_usd)
    const usersWithStats = await Promise.all(
      (profiles ?? []).map(async (profile) => {
        const { count: txCount } = await supabaseAdmin
          .from("transactions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.user_id)

        return {
          ...profile,
          transaction_count: txCount ?? 0,
          total_model_cost: costByUserId.get(profile.user_id) ?? 0,
        }
      })
    )

    return NextResponse.json(usersWithStats)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Esquema de validación para crear usuario
const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

// POST — Crear nuevo usuario (solo admin)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (isAuthError(auth)) return auth

  try {
    const body = await req.json()
    const parsed = createUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, name, password } = parsed.data

    // Verificar si ya existe un perfil con ese email
    const { data: existing } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id")
      .eq("email", email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 409 }
      )
    }

    // Crear usuario en Supabase Auth con contraseña
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Crear perfil en user_profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        user_id: authData.user.id,
        email,
        name,
        role: "user",
        plan: "free",
        onboarding_completed: false,
      })
      .select()
      .single()

    if (profileError) {
      // Si falla el perfil, eliminar el usuario de auth para no dejar inconsistencia
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        profile,
        credentials: { email, password },
        message: "Usuario creado. Ya puede iniciar sesión.",
      },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
