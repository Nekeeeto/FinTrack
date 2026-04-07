import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval } from "date-fns"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const period = searchParams.get("period") || "this_month"

  let dateFrom: Date
  let dateTo: Date

  if (period === "last_month") {
    const lastMonth = subMonths(new Date(), 1)
    dateFrom = startOfMonth(lastMonth)
    dateTo = endOfMonth(lastMonth)
  } else {
    dateFrom = startOfMonth(new Date())
    dateTo = endOfMonth(new Date())
  }

  const from = format(dateFrom, "yyyy-MM-dd")
  const to = format(dateTo, "yyyy-MM-dd")

  const [accountsRes, transactionsRes] = await Promise.all([
    supabaseAdmin.from("accounts").select("*").order("created_at"),
    supabaseAdmin
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false }),
  ])

  const accounts = accountsRes.data || []
  const transactions = transactionsRes.data || []

  // Cash flow
  let income = 0
  let expenses = 0
  const expenseByCategory: Record<string, { name: string; value: number; color: string }> = {}

  for (const tx of transactions) {
    if (tx.category?.type === "income") {
      income += Number(tx.amount)
    } else {
      expenses += Number(tx.amount)
      const catName = tx.category?.name || "Otro"
      if (!expenseByCategory[catName]) {
        expenseByCategory[catName] = { name: catName, value: 0, color: tx.category?.color || "#6b7280" }
      }
      expenseByCategory[catName].value += Number(tx.amount)
    }
  }

  // Balance trend (cumulative by day)
  const days = eachDayOfInterval({ start: dateFrom, end: dateTo > new Date() ? new Date() : dateTo })
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)
  let runningBalance = totalBalance
  // Walk backwards from current balance
  const txByDate: Record<string, number> = {}
  for (const tx of transactions) {
    const d = tx.date
    if (!txByDate[d]) txByDate[d] = 0
    txByDate[d] += tx.category?.type === "income" ? Number(tx.amount) : -Number(tx.amount)
  }

  const balanceTrend = days.map((day) => {
    const d = format(day, "yyyy-MM-dd")
    return {
      date: format(day, "dd/MM"),
      dayNet: txByDate[d] || 0,
    }
  })

  // Calculate running balance forward from start
  let startBalance = totalBalance
  for (const entry of balanceTrend) {
    startBalance -= entry.dayNet
  }
  let cumBalance = startBalance
  const trendData = balanceTrend.map((entry) => {
    cumBalance += entry.dayNet
    return { date: entry.date, balance: cumBalance }
  })

  return NextResponse.json({
    accounts,
    transactions: transactions.slice(0, 10),
    cashFlow: { income, expenses },
    expensesByCategory: Object.values(expenseByCategory).sort((a, b) => b.value - a.value),
    balanceTrend: trendData,
  })
}
