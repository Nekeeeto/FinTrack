import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"

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

function isAllowedLogoUrl(s: string) {
  if (s.length > 512) return false
  if (s.startsWith("/")) return /^\/[\w./-]+$/.test(s)
  try {
    const u = new URL(s)
    return u.protocol === "https:" || u.protocol === "http:"
  } catch {
    return false
  }
}

const accountSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(["checking", "savings", "cash", "investment", "business"]).default("checking"),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]).default("UYU"),
  balance: z.number().min(0).default(0),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#1a1a1a"),
  icon: z.string().min(1).max(30).default("wallet"),
  logo_url: z
    .union([
      z.literal(""),
      z.string().max(512).refine((s) => s.length > 0 && isAllowedLogoUrl(s), "logo_url inválida"),
      z.null(),
    ])
    .optional(),
  usd_enabled: z.boolean().default(false),
  usd_balance: z.number().min(0).default(0),
})

const metadataSchema = z.object({
  flow_version: z.string().default("onboarding_v2_mobile"),
  total_duration_ms: z.number().int().nonnegative().optional(),
  steps_timing_ms: z.record(z.string(), z.number().int().nonnegative()).optional(),
  ai_used: z.boolean().optional(),
  ai_attempts: z.number().int().min(0).max(2).optional(),
})

const onboardingSchema = z.object({
  objectives: z.array(z.string().min(1)).min(1, "Selecciona al menos un objetivo"),
  account: accountSchema,
  categories: z.array(categorySchema).min(1, "Selecciona al menos una categoria"),
  metadata: metadataSchema.optional(),
})

function getDefaultUserName(email: string): string {
  if (!email) return "Usuario"
  const base = email.split("@")[0] || "Usuario"
  return base.slice(0, 40)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const body = await req.json()
    const parsed = onboardingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { objectives, account, categories, metadata } = parsed.data
    const userId = auth.userId

    const {
      data: { user },
    } = await auth.supabase.auth.getUser()
    const userEmail = user?.email ?? ""

    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()

    if (existingProfileError) {
      return NextResponse.json(
        { error: `Error verificando perfil: ${existingProfileError.message}` },
        { status: 500 }
      )
    }

    if (!existingProfile) {
      const { error: insertError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          user_id: userId,
          name: getDefaultUserName(userEmail),
          email: userEmail,
          role: "user",
          plan: "free",
          onboarding_completed: false,
        })

      if (insertError) {
        return NextResponse.json(
          { error: `Error creando perfil: ${insertError.message}` },
          { status: 500 }
        )
      }
    } else {
      const { error: updateEmailError } = await supabaseAdmin
        .from("user_profiles")
        .update({ email: userEmail })
        .eq("user_id", userId)

      if (updateEmailError) {
        return NextResponse.json(
          { error: `Error actualizando perfil: ${updateEmailError.message}` },
          { status: 500 }
        )
      }
    }

    await supabaseAdmin.from("categories").delete().eq("user_id", userId)
    await supabaseAdmin.from("accounts").delete().eq("user_id", userId)

    for (let sortOrder = 0; sortOrder < categories.length; sortOrder++) {
      const category = categories[sortOrder]

      const { data: parentData, error: parentError } = await supabaseAdmin
        .from("categories")
        .insert({
          user_id: userId,
          name: category.name,
          color: category.color,
          icon: category.icon,
          type: category.type,
          sort_order: sortOrder + 1,
        })
        .select("id")
        .single()

      if (parentError || !parentData) {
        return NextResponse.json(
          { error: `Error insertando categoria "${category.name}": ${parentError?.message}` },
          { status: 500 }
        )
      }

      if (category.subcategories.length > 0) {
        const subcategoryRows = category.subcategories.map((subcategory, subIndex) => ({
          user_id: userId,
          parent_id: parentData.id,
          name: subcategory.name,
          color: subcategory.color,
          icon: subcategory.icon,
          type: category.type,
          sort_order: subIndex + 1,
        }))

        const { error: subcategoryError } = await supabaseAdmin
          .from("categories")
          .insert(subcategoryRows)

        if (subcategoryError) {
          return NextResponse.json(
            { error: `Error insertando subcategorias de "${category.name}": ${subcategoryError.message}` },
            { status: 500 }
          )
        }
      }
    }

    const { error: accountError } = await supabaseAdmin.from("accounts").insert({
      user_id: userId,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
      color: account.color,
      icon: account.icon,
      logo_url: account.logo_url ?? null,
    })

    if (accountError) {
      return NextResponse.json(
        { error: `Error creando cuenta inicial: ${accountError.message}` },
        { status: 500 }
      )
    }

    if (account.currency === "UYU" && account.usd_enabled) {
      const { error: usdAccountError } = await supabaseAdmin.from("accounts").insert({
        user_id: userId,
        name: `${account.name} USD`,
        type: account.type,
        currency: "USD",
        balance: account.usd_balance,
        color: account.color,
        icon: account.icon,
        logo_url: account.logo_url ?? null,
      })

      if (usdAccountError) {
        return NextResponse.json(
          { error: `Error creando cuenta en dólares: ${usdAccountError.message}` },
          { status: 500 }
        )
      }
    }

    const { error: analyticsError } = await supabaseAdmin
      .from("onboarding_sessions")
      .insert({
        user_id: userId,
        flow_version: metadata?.flow_version ?? "onboarding_v2_mobile",
        objectives,
        selected_categories: categories,
        total_duration_ms: metadata?.total_duration_ms ?? null,
        steps_timing_ms: metadata?.steps_timing_ms ?? null,
        ai_used: metadata?.ai_used ?? false,
        ai_attempts: metadata?.ai_attempts ?? 0,
      })

    if (analyticsError) {
      // Analytics no debe bloquear la finalizacion del onboarding.
      console.warn("[onboarding.complete] No se pudo guardar analytics", {
        userId,
        error: analyticsError.message,
      })
    }

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
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
