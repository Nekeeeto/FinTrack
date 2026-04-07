import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

// POST — Crear el usuario super admin (ejecutar UNA sola vez)
// Después de ejecutar, eliminar este archivo
export async function POST() {
  const ADMIN_EMAIL = "nicoinfantedecano@gmail.com"
  const ADMIN_PASSWORD = "Biyuya2026!"

  try {
    // 1. Verificar si ya existe el admin
    const { data: existingProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id")
      .eq("email", ADMIN_EMAIL)
      .single()

    if (existingProfile) {
      return NextResponse.json({ message: "Admin ya existe", userId: existingProfile.user_id })
    }

    // 2. Crear usuario en auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // confirmar email automáticamente
    })

    if (authError) {
      // Si el usuario ya existe en auth pero no en profiles
      if (authError.message.includes("already been registered")) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = users.find(u => u.email === ADMIN_EMAIL)

        if (existingUser) {
          // Actualizar contraseña
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: ADMIN_PASSWORD,
          })

          // Crear perfil
          const { error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .upsert({
              user_id: existingUser.id,
              name: "Nico",
              email: ADMIN_EMAIL,
              role: "admin",
              plan: "premium",
              onboarding_completed: true,
              photo_count_month: 0,
            })

          if (profileError) {
            return NextResponse.json({ error: "Error creando perfil: " + profileError.message }, { status: 500 })
          }

          // Asignar datos huérfanos
          await assignOrphanData(existingUser.id)

          return NextResponse.json({
            message: "Admin configurado (usuario existente)",
            userId: existingUser.id,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          })
        }
      }
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const userId = authData.user.id

    // 3. Crear perfil admin
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        user_id: userId,
        name: "Nico",
        email: ADMIN_EMAIL,
        role: "admin",
        plan: "premium",
        onboarding_completed: true,
        photo_count_month: 0,
      })

    if (profileError) {
      return NextResponse.json({ error: "Error creando perfil: " + profileError.message }, { status: 500 })
    }

    // 4. Asignar datos huérfanos al admin
    await assignOrphanData(userId)

    return NextResponse.json({
      message: "Admin creado exitosamente",
      userId,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function assignOrphanData(adminId: string) {
  // Asignar todos los datos existentes sin user_id al admin
  const tables = ["accounts", "categories", "transactions", "budget_limits", "pending_receipts", "settings", "push_subscriptions", "model_usage"]

  for (const table of tables) {
    await supabaseAdmin
      .from(table)
      .update({ user_id: adminId })
      .is("user_id", null)
  }
}
