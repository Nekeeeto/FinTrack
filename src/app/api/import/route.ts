import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"

const rowSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]).default("UYU"),
  description: z.string().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const importSchema = z.object({
  rows: z.array(rowSchema).min(1).max(500),
})

// POST /api/import
export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const body = await req.json()
    const parsed = importSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const transactions = parsed.data.rows.map((row) => ({
      ...row,
      user_id: auth.userId,
      source: "import" as const,
    }))

    const { data, error } = await auth.supabase
      .from("transactions")
      .insert(transactions)
      .select("id")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Actualizar balances de cuentas afectadas
    const accountIds = [...new Set(transactions.map((t) => t.account_id))]
    for (const accountId of accountIds) {
      const accountTxs = transactions.filter((t) => t.account_id === accountId)

      const categoryIds = [...new Set(accountTxs.map((t) => t.category_id))]
      const { data: categories } = await auth.supabase
        .from("categories")
        .select("id, type")
        .in("id", categoryIds)

      const categoryTypeMap = new Map(categories?.map((c) => [c.id, c.type]) ?? [])

      let balanceChange = 0
      for (const tx of accountTxs) {
        const type = categoryTypeMap.get(tx.category_id)
        balanceChange += type === "income" ? tx.amount : -tx.amount
      }

      const { data: account } = await auth.supabase
        .from("accounts")
        .select("balance")
        .eq("id", accountId)
        .single()

      if (account) {
        await auth.supabase
          .from("accounts")
          .update({ balance: Number(account.balance) + balanceChange })
          .eq("id", accountId)
      }
    }

    return NextResponse.json({
      imported: data?.length ?? 0,
      message: `Se importaron ${data?.length ?? 0} transacciones`,
    })
  } catch {
    return NextResponse.json({ error: "Error procesando la importación" }, { status: 500 })
  }
}
