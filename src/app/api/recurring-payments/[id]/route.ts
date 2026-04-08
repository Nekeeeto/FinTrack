import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"

const updateSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]).optional(),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]).optional(),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  day_of_week: z.number().int().min(0).max(6).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  next_due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  active: z.boolean().optional(),
})

// PATCH /api/recurring-payments/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from("recurring_payments")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.userId)
    .select("*, account:accounts(*), category:categories(*)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/recurring-payments/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params

  const { error } = await auth.supabase
    .from("recurring_payments")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
