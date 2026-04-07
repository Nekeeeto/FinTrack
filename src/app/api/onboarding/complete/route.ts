import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"

// Schema de validacion para el request de onboarding
const subcategorySchema = z.object({
  name: z.string().min(1),
  color: z.string(),
  icon: z.string(),
})

const categorySchema = z.object({
  name: z.string().min(1),
  color: z.string(),
  icon: z.string(),
  type: z.enum(["income", "expense"]),
  subcategories: z.array(subcategorySchema),
})

const accountSchema = z.object({
  name: z.string().min(1),
  type: z.string(),
  currency: z.string(),
})

const onboardingSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  categories: z.array(categorySchema).min(1, "Selecciona al menos una categoria"),
  accounts: z.array(accountSchema).min(1, "Crea al menos una cuenta"),
})

// POST /api/onboarding/complete — Completa el onboarding del usuario nuevo
export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const body = await req.json()
    const parsed = onboardingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, categories, accounts } = parsed.data
    const userId = auth.userId

    // 1. Actualizar nombre en user_profiles
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .update({ name })
      .eq("user_id", userId)

    if (profileError) {
      return NextResponse.json(
        { error: `Error actualizando perfil: ${profileError.message}` },
        { status: 500 }
      )
    }

    // 2. Insertar categorias padre e hijas
    for (let sortOrder = 0; sortOrder < categories.length; sortOrder++) {
      const cat = categories[sortOrder]

      // Insertar categoria padre
      const { data: parentData, error: parentError } = await supabaseAdmin
        .from("categories")
        .insert({
          user_id: userId,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          type: cat.type,
          sort_order: sortOrder + 1,
        })
        .select("id")
        .single()

      if (parentError || !parentData) {
        return NextResponse.json(
          { error: `Error insertando categoria "${cat.name}": ${parentError?.message}` },
          { status: 500 }
        )
      }

      // Insertar subcategorias si hay
      if (cat.subcategories.length > 0) {
        const subcats = cat.subcategories.map((sub, subIndex) => ({
          user_id: userId,
          parent_id: parentData.id,
          name: sub.name,
          color: sub.color,
          icon: sub.icon,
          type: cat.type,
          sort_order: subIndex + 1,
        }))

        const { error: subError } = await supabaseAdmin
          .from("categories")
          .insert(subcats)

        if (subError) {
          return NextResponse.json(
            { error: `Error insertando subcategorias de "${cat.name}": ${subError.message}` },
            { status: 500 }
          )
        }
      }
    }

    // 3. Insertar cuentas
    const accountRows = accounts.map((acc) => ({
      user_id: userId,
      name: acc.name,
      type: acc.type,
      currency: acc.currency,
      balance: 0,
      color: acc.type === "cash" ? "#1a1a1a" : acc.type === "business" ? "#1e3a8a" : "#6b7280",
      icon: acc.type === "cash" ? "wallet" : acc.type === "business" ? "briefcase" : "landmark",
    }))

    const { error: accountsError } = await supabaseAdmin
      .from("accounts")
      .insert(accountRows)

    if (accountsError) {
      return NextResponse.json(
        { error: `Error insertando cuentas: ${accountsError.message}` },
        { status: 500 }
      )
    }

    // 4. Marcar onboarding como completado
    const { error: completeError } = await supabaseAdmin
      .from("user_profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", userId)

    if (completeError) {
      return NextResponse.json(
        { error: `Error completando onboarding: ${completeError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
