import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"
import { format } from "date-fns"

// GET /api/export?from=&to=&account_id=&category_id=&format=csv
export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const params = req.nextUrl.searchParams

  let query = auth.supabase
    .from("transactions")
    .select("*, account:accounts(name, currency), category:categories(name, type)")
    .eq("user_id", auth.userId)
    .order("date", { ascending: false })

  const accountId = params.get("account_id")
  const categoryId = params.get("category_id")
  const from = params.get("from")
  const to = params.get("to")

  if (accountId) query = query.eq("account_id", accountId)
  if (categoryId) query = query.eq("category_id", categoryId)
  if (from) query = query.gte("date", from)
  if (to) query = query.lte("date", to)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const transactions = data || []

  const headers = ["Fecha", "Cuenta", "Categoría", "Tipo", "Monto", "Moneda", "Descripción", "Fuente"]
  const rows = transactions.map((tx) => [
    tx.date,
    tx.account?.name || "",
    tx.category?.name || "",
    tx.category?.type === "income" ? "Ingreso" : "Gasto",
    tx.amount,
    tx.currency,
    `"${(tx.description || "").replace(/"/g, '""')}"`,
    tx.source,
  ])

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  const filename = `biyuya-${format(new Date(), "yyyy-MM-dd")}.csv`

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
