import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/server"

const checkEmailSchema = z.object({
  email: z.string().email("Email inválido"),
})

// POST — Verificar si un email está registrado en user_profiles
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = checkEmailSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id")
      .eq("email", parsed.data.email)
      .single()

    return NextResponse.json({ exists: !!profile })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
