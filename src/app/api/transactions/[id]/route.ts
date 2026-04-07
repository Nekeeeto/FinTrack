import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"

const updateSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]).optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

// GET /api/transactions/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params

  const { data, error } = await auth.supabase
    .from("transactions")
    .select("*, account:accounts(*), category:categories(*)")
    .eq("id", id)
    .eq("user_id", auth.userId)
    .single()

  if (error) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  return NextResponse.json(data)
}

// PATCH /api/transactions/[id]
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

  const { data: oldTx } = await auth.supabase
    .from("transactions")
    .select("*, category:categories(type)")
    .eq("id", id)
    .eq("user_id", auth.userId)
    .single()

  if (!oldTx) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const { data, error } = await auth.supabase
    .from("transactions")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", auth.userId)
    .select("*, account:accounts(*), category:categories(*)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (parsed.data.amount || parsed.data.category_id) {
    const oldSign = oldTx.category?.type === "income" ? 1 : -1
    const oldEffect = oldSign * Number(oldTx.amount)

    const { data: newCat } = await auth.supabase
      .from("categories")
      .select("type")
      .eq("id", data.category_id)
      .single()
    const newSign = newCat?.type === "income" ? 1 : -1
    const newEffect = newSign * Number(data.amount)

    const diff = newEffect - oldEffect

    const { data: account } = await auth.supabase
      .from("accounts")
      .select("balance")
      .eq("id", data.account_id)
      .single()

    if (account) {
      await auth.supabase
        .from("accounts")
        .update({ balance: Number(account.balance) + diff })
        .eq("id", data.account_id)
    }
  }

  return NextResponse.json(data)
}

// DELETE /api/transactions/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params

  const { data: tx } = await auth.supabase
    .from("transactions")
    .select("*, category:categories(type)")
    .eq("id", id)
    .eq("user_id", auth.userId)
    .single()

  if (!tx) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const { error } = await auth.supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const balanceReverse = tx.category?.type === "income" ? -Number(tx.amount) : Number(tx.amount)
  const { data: account } = await auth.supabase
    .from("accounts")
    .select("balance")
    .eq("id", tx.account_id)
    .single()

  if (account) {
    await auth.supabase
      .from("accounts")
      .update({ balance: Number(account.balance) + balanceReverse })
      .eq("id", tx.account_id)
  }

  return NextResponse.json({ ok: true })
}
