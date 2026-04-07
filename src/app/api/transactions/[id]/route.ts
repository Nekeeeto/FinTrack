import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/server"

const updateSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  currency: z.enum(["UYU", "USD"]).optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

// GET /api/transactions/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("*, account:accounts(*), category:categories(*)")
    .eq("id", id)
    .single()

  if (error) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  return NextResponse.json(data)
}

// PATCH /api/transactions/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Get old transaction to adjust balance
  const { data: oldTx } = await supabaseAdmin
    .from("transactions")
    .select("*, category:categories(type)")
    .eq("id", id)
    .single()

  if (!oldTx) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .update(parsed.data)
    .eq("id", id)
    .select("*, account:accounts(*), category:categories(*)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Recalculate balance if amount or category changed
  if (parsed.data.amount || parsed.data.category_id) {
    const oldSign = oldTx.category?.type === "income" ? 1 : -1
    const oldEffect = oldSign * Number(oldTx.amount)

    const { data: newCat } = await supabaseAdmin
      .from("categories")
      .select("type")
      .eq("id", data.category_id)
      .single()
    const newSign = newCat?.type === "income" ? 1 : -1
    const newEffect = newSign * Number(data.amount)

    const diff = newEffect - oldEffect

    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("balance")
      .eq("id", data.account_id)
      .single()

    if (account) {
      await supabaseAdmin
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
  const { id } = await params

  // Get transaction to reverse balance
  const { data: tx } = await supabaseAdmin
    .from("transactions")
    .select("*, category:categories(type)")
    .eq("id", id)
    .single()

  if (!tx) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const { error } = await supabaseAdmin.from("transactions").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Reverse balance effect
  const balanceReverse = tx.category?.type === "income" ? -Number(tx.amount) : Number(tx.amount)
  const { data: account } = await supabaseAdmin
    .from("accounts")
    .select("balance")
    .eq("id", tx.account_id)
    .single()

  if (account) {
    await supabaseAdmin
      .from("accounts")
      .update({ balance: Number(account.balance) + balanceReverse })
      .eq("id", tx.account_id)
  }

  return NextResponse.json({ ok: true })
}
