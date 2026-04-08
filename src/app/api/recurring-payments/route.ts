import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"

const createSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]).default("UYU"),
  description: z.string().default(""),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]),
  day_of_month: z.number().int().min(1).max(31).nullable().default(null),
  day_of_week: z.number().int().min(0).max(6).nullable().default(null),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  next_due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  active: z.boolean().default(true),
})

// GET /api/recurring-payments
export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { data, error } = await auth.supabase
    .from("recurring_payments")
    .select("*, account:accounts(*), category:categories(*)")
    .eq("user_id", auth.userId)
    .order("next_due_date", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/recurring-payments
export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const body = await req.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from("recurring_payments")
    .insert({ ...parsed.data, user_id: auth.userId })
    .select("*, account:accounts(*), category:categories(*)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
