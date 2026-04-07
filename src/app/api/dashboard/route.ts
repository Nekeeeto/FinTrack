import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const period = searchParams.get("period") || "this_month"

  let dateFrom: Date
  let dateTo: Date

  if (period === "custom") {
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    if (!fromParam || !toParam) {
      return NextResponse.json({ error: "from and to required for custom period" }, { status: 400 })
    }
    dateFrom = parseISO(fromParam)
    dateTo = parseISO(toParam)
  } else if (period === "last_month") {
    const lastMonth = subMonths(new Date(), 1)
    dateFrom = startOfMonth(lastMonth)
    dateTo = endOfMonth(lastMonth)
  } else {
    dateFrom = startOfMonth(new Date())
    dateTo = endOfMonth(new Date())
  }

  const from = format(dateFrom, "yyyy-MM-dd")
  const to = format(dateTo, "yyyy-MM-dd")

  // Flujo mensual: últimos 6 meses
  const monthlyFlowMonths = 6
  const monthlyFlowFrom = format(startOfMonth(subMonths(new Date(), monthlyFlowMonths - 1)), "yyyy-MM-dd")

  const [accountsRes, transactionsRes, monthlyFlowRes, budgetsRes] = await Promise.all([
    supabaseAdmin.from("accounts").select("*").order("created_at"),
    supabaseAdmin
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false }),
    supabaseAdmin
      .from("transactions")
      .select("amount, date, category:categories(type)")
      .gte("date", monthlyFlowFrom)
      .order("date"),
    supabaseAdmin
      .from("budget_limits")
      .select("*, category:categories(id, name, color, parent_id)")
      .order("created_at"),
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
  const endDate = dateTo > new Date() ? new Date() : dateTo
  const days = eachDayOfInterval({ start: dateFrom, end: endDate })
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)

  const txByDate: Record<string, number> = {}
  for (const tx of transactions) {
    const d = tx.date
    if (!txByDate[d]) txByDate[d] = 0
    txByDate[d] += tx.category?.type === "income" ? Number(tx.amount) : -Number(tx.amount)
  }

  const balanceTrend = days.map((day) => {
    const d = format(day, "yyyy-MM-dd")
    return { date: format(day, "dd/MM"), dayNet: txByDate[d] || 0 }
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

  // Flujo mensual agrupado por mes
  const monthlyFlowTx = monthlyFlowRes.data || []
  const monthlyFlowMap: Record<string, { income: number; expenses: number }> = {}

  for (let i = monthlyFlowMonths - 1; i >= 0; i--) {
    const m = subMonths(new Date(), i)
    const key = format(m, "yyyy-MM")
    monthlyFlowMap[key] = { income: 0, expenses: 0 }
  }

  for (const tx of monthlyFlowTx) {
    const key = tx.date.substring(0, 7) // yyyy-MM
    if (monthlyFlowMap[key]) {
      const cat = Array.isArray(tx.category) ? tx.category[0] : tx.category
      if (cat?.type === "income") {
        monthlyFlowMap[key].income += Number(tx.amount)
      } else {
        monthlyFlowMap[key].expenses += Number(tx.amount)
      }
    }
  }

  const monthlyFlow = Object.entries(monthlyFlowMap).map(([month, data]) => {
    const d = new Date(month + "-01")
    return {
      month,
      label: format(d, "MMM yy", { locale: es }),
      income: Math.round(data.income),
      expenses: Math.round(data.expenses),
      net: Math.round(data.income - data.expenses),
    }
  })

  // Presupuestos con gasto del período actual
  const budgets = budgetsRes.data || []
  const allCategories = await supabaseAdmin.from("categories").select("id, parent_id")
  const cats = allCategories.data || []

  const budgetProgress = budgets.map((b) => {
    const childIds = cats.filter((c) => c.parent_id === b.category_id).map((c) => c.id)
    const allIds = [b.category_id, ...childIds]
    const spent = transactions
      .filter((tx) => allIds.includes(tx.category_id) && tx.category?.type === "expense")
      .reduce((s, tx) => s + Number(tx.amount), 0)
    return {
      id: b.id,
      category_id: b.category_id,
      category_name: b.category?.name || "?",
      category_color: b.category?.color || "#6b7280",
      limit: b.amount,
      spent: Math.round(spent),
      percentage: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
    }
  })

  return NextResponse.json({
    accounts,
    transactions: transactions.slice(0, 10),
    cashFlow: { income, expenses },
    expensesByCategory: Object.values(expenseByCategory).sort((a, b) => b.value - a.value),
    balanceTrend: trendData,
    monthlyFlow,
    budgetProgress,
  })
}
