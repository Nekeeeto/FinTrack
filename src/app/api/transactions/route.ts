import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/server"

const createSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(["UYU", "USD"]).default("UYU"),
  description: z.string().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source: z.enum(["manual", "telegram", "import"]).default("manual"),
  receipt_url: z.string().url().nullable().optional(),
  raw_ocr_data: z.record(z.string(), z.unknown()).nullable().optional(),
})

// GET /api/transactions?account_id=&category_id=&from=&to=&limit=&offset=
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams

  let query = supabaseAdmin
    .from("transactions")
    .select("*, account:accounts(*), category:categories(*)", { count: "exact" })
    .order("date", { ascending: false })

  const accountId = params.get("account_id")
  const categoryId = params.get("category_id")
  const from = params.get("from")
  const to = params.get("to")
  const limit = parseInt(params.get("limit") || "50")
  const offset = parseInt(params.get("offset") || "0")

  if (accountId) query = query.eq("account_id", accountId)
  if (categoryId) query = query.eq("category_id", categoryId)
  if (from) query = query.gte("date", from)
  if (to) query = query.lte("date", to)

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count })
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: tx, error } = await supabaseAdmin
    .from("transactions")
    .insert(parsed.data)
    .select("*, account:accounts(*), category:categories(*)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update account balance
  const { data: category } = await supabaseAdmin
    .from("categories")
    .select("type")
    .eq("id", parsed.data.category_id)
    .single()

  const balanceChange = category?.type === "income" ? parsed.data.amount : -parsed.data.amount

  await supabaseAdmin.rpc("update_account_balance", {
    p_account_id: parsed.data.account_id,
    p_amount: balanceChange,
  }).then(async (res) => {
    // Fallback if RPC doesn't exist yet
    if (res.error) {
      const { data: account } = await supabaseAdmin
        .from("accounts")
        .select("balance")
        .eq("id", parsed.data.account_id)
        .single()
      if (account) {
        await supabaseAdmin
          .from("accounts")
          .update({ balance: Number(account.balance) + balanceChange })
          .eq("id", parsed.data.account_id)
      }
    }
  })

  return NextResponse.json(tx, { status: 201 })
}
