import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"

const confirmSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(["UYU", "USD", "BRL", "ARS"]).default("UYU"),
  description: z.string().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  raw_ocr_data: z.record(z.string(), z.unknown()).nullable().optional(),
})

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const body = await req.json()
    const parsed = confirmSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Insertar transaccion con source='webapp'
    const { data: tx, error } = await auth.supabase
      .from("transactions")
      .insert({
        ...parsed.data,
        user_id: auth.userId,
        source: "webapp" as const,
      })
      .select("*, account:accounts(*), category:categories(*)")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Actualizar balance de la cuenta
    const { data: category } = await auth.supabase
      .from("categories")
      .select("type")
      .eq("id", parsed.data.category_id)
      .single()

    const balanceChange =
      category?.type === "income" ? parsed.data.amount : -parsed.data.amount

    const { data: account } = await auth.supabase
      .from("accounts")
      .select("balance")
      .eq("id", parsed.data.account_id)
      .single()

    if (account) {
      await auth.supabase
        .from("accounts")
        .update({ balance: Number(account.balance) + balanceChange })
        .eq("id", parsed.data.account_id)
    }

    return NextResponse.json(tx, { status: 201 })
  } catch (err) {
    console.error("Error al confirmar transaccion:", err)
    return NextResponse.json(
      { error: "Error al guardar la transaccion" },
      { status: 500 }
    )
  }
}
