import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"
import { startOfMonth, endOfMonth, format } from "date-fns"

const createSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]).default("UYU"),
})

// GET /api/budgets?month=2026-04
export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const params = req.nextUrl.searchParams
  const monthParam = params.get("month")

  const now = monthParam ? new Date(monthParam + "-01") : new Date()
  const from = format(startOfMonth(now), "yyyy-MM-dd")
  const to = format(endOfMonth(now), "yyyy-MM-dd")

  const { data: budgets, error } = await auth.supabase
    .from("budget_limits")
    .select("*, category:categories(*)")
    .eq("user_id", auth.userId)
    .order("created_at")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const categoryIds = (budgets || []).map((b) => b.category_id)

  let spending: Record<string, number> = {}
  if (categoryIds.length > 0) {
    const { data: allCategories } = await auth.supabase
      .from("categories")
      .select("id, parent_id")
      .eq("user_id", auth.userId)

    const expandedIds: Record<string, string[]> = {}
    for (const catId of categoryIds) {
      const children = (allCategories || [])
        .filter((c) => c.parent_id === catId)
        .map((c) => c.id)
      expandedIds[catId] = [catId, ...children]
    }

    const allIds = [...new Set(Object.values(expandedIds).flat())]

    const { data: transactions } = await auth.supabase
      .from("transactions")
      .select("category_id, amount")
      .eq("user_id", auth.userId)
      .in("category_id", allIds)
      .gte("date", from)
      .lte("date", to)

    for (const catId of categoryIds) {
      const childIds = expandedIds[catId]
      const total = (transactions || [])
        .filter((tx) => childIds.includes(tx.category_id))
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      spending[catId] = total
    }
  }

  const result = (budgets || []).map((b) => ({
    ...b,
    spent: spending[b.category_id] || 0,
    percentage: b.amount > 0
      ? Math.round(((spending[b.category_id] || 0) / b.amount) * 100)
      : 0,
  }))

  return NextResponse.json(result)
}

// POST /api/budgets
export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const body = await req.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: existing } = await auth.supabase
    .from("budget_limits")
    .select("id")
    .eq("category_id", parsed.data.category_id)
    .eq("user_id", auth.userId)
    .single()

  if (existing) {
    const { data, error } = await auth.supabase
      .from("budget_limits")
      .update({
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("user_id", auth.userId)
      .select("*, category:categories(*)")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await auth.supabase
    .from("budget_limits")
    .insert({
      ...parsed.data,
      user_id: auth.userId,
      period: "monthly",
    })
    .select("*, category:categories(*)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
