import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"
import { z } from "zod"

export async function GET() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { data, error } = await auth.supabase
    .from("accounts")
    .select("*")
    .eq("user_id", auth.userId)
    .order("created_at")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

const createAccountSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(["checking", "savings", "cash", "investment", "business"]).default("cash"),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]).default("UYU"),
  balance: z.number().min(0).default(0),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#1a1a1a"),
  icon: z.string().min(1).max(30).default("wallet"),
})

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const body = await request.json()
  const parsed = createAccountSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from("accounts")
    .insert({ ...parsed.data, user_id: auth.userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

const updateAccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().min(1).max(30).optional(),
  type: z.enum(["checking", "savings", "cash", "investment", "business"]).optional(),
})

export async function PUT(request: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const body = await request.json()
  const parsed = updateAccountSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { id, ...updates } = parsed.data

  // Solo actualizar si hay campos para cambiar
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from("accounts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", auth.userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
