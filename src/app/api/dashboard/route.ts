import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  eachDayOfInterval,
  parseISO,
  startOfToday,
  endOfToday,
  startOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  min,
} from "date-fns"
import { es } from "date-fns/locale"
import { toUYU } from "@/lib/currency"
import type { ExchangeRate } from "@/types/database"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const searchParams = req.nextUrl.searchParams
  const period = searchParams.get("period") || "this_month"
  const weekOptions = { weekStartsOn: 1 as const }

  let dateFrom: Date
  let dateTo: Date

  if (period === "custom") {
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    if (!fromParam || !toParam) {
      return NextResponse.json({ error: "from and to required for custom period" }, { status: 400 })
    }
    dateFrom = startOfDay(parseISO(fromParam))
    dateTo = startOfDay(parseISO(toParam))
    if (dateFrom.getTime() > dateTo.getTime()) {
      const tmp = dateFrom
      dateFrom = dateTo
      dateTo = tmp
    }
  } else if (period === "today") {
    dateFrom = startOfToday()
    dateTo = endOfToday()
  } else if (period === "last_7_days") {
    dateFrom = startOfDay(subDays(new Date(), 6))
    dateTo = endOfToday()
  } else if (period === "this_week") {
    dateFrom = startOfWeek(new Date(), weekOptions)
    dateTo = endOfWeek(new Date(), weekOptions)
    const now = new Date()
    if (dateTo.getTime() > now.getTime()) dateTo = endOfToday()
  } else if (period === "last_month") {
    const lastMonth = subMonths(new Date(), 1)
    dateFrom = startOfMonth(lastMonth)
    dateTo = endOfMonth(lastMonth)
  } else if (period === "this_year") {
    dateFrom = startOfYear(new Date())
    dateTo = min([endOfYear(new Date()), endOfToday()])
  } else {
    dateFrom = startOfMonth(new Date())
    dateTo = endOfMonth(new Date())
    const now = new Date()
    if (dateTo.getTime() > now.getTime()) dateTo = endOfToday()
  }

  const from = format(dateFrom, "yyyy-MM-dd")
  const to = format(dateTo, "yyyy-MM-dd")

  const monthlyFlowMonths = 6
  const monthlyFlowFrom = format(startOfMonth(subMonths(new Date(), monthlyFlowMonths - 1)), "yyyy-MM-dd")

  // Exchange rates son globales — usar supabaseAdmin
  const [accountsRes, transactionsRes, monthlyFlowRes, budgetsRes, ratesRes] = await Promise.all([
    auth.supabase.from("accounts").select("*").eq("user_id", auth.userId).order("created_at"),
    auth.supabase
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .eq("user_id", auth.userId)
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false }),
    auth.supabase
      .from("transactions")
      .select("amount, currency, date, category:categories(type)")
      .eq("user_id", auth.userId)
      .gte("date", monthlyFlowFrom)
      .order("date"),
    auth.supabase
      .from("budget_limits")
      .select("*, category:categories(id, name, color, parent_id)")
      .eq("user_id", auth.userId)
      .order("created_at"),
    supabaseAdmin
      .from("exchange_rates")
      .select("*")
      .order("fetched_at", { ascending: false })
      .limit(10),
  ])

  const accounts = accountsRes.data || []
  const transactions = transactionsRes.data || []

  const allRates = ratesRes.data || []
  const latestRates: ExchangeRate[] = []
  const seen = new Set<string>()
  for (const r of allRates) {
    const key = `${r.base_currency}-${r.target_currency}`
    if (!seen.has(key)) {
      seen.add(key)
      latestRates.push(r as ExchangeRate)
    }
  }

  let income = 0
  let expenses = 0
  const expenseByCategory: Record<string, { name: string; value: number; color: string }> = {}

  for (const tx of transactions) {
    const amountUYU = toUYU(Number(tx.amount), tx.currency, latestRates)
    if (tx.category?.type === "income") {
      income += amountUYU
    } else {
      expenses += amountUYU
      const catName = tx.category?.name || "Otro"
      if (!expenseByCategory[catName]) {
        expenseByCategory[catName] = { name: catName, value: 0, color: tx.category?.color || "#6b7280" }
      }
      expenseByCategory[catName].value += amountUYU
    }
  }

  const endDate = dateTo > new Date() ? new Date() : dateTo
  const days = eachDayOfInterval({ start: dateFrom, end: endDate })
  const totalBalance = accounts.reduce((sum, a) => sum + toUYU(Number(a.balance), a.currency, latestRates), 0)

  const txByDate: Record<string, number> = {}
  for (const tx of transactions) {
    const d = tx.date
    if (!txByDate[d]) txByDate[d] = 0
    const amtUYU = toUYU(Number(tx.amount), tx.currency, latestRates)
    txByDate[d] += tx.category?.type === "income" ? amtUYU : -amtUYU
  }

  const balanceTrend = days.map((day) => {
    const d = format(day, "yyyy-MM-dd")
    return { date: format(day, "dd/MM"), dayNet: txByDate[d] || 0 }
  })

  let startBalance = totalBalance
  for (const entry of balanceTrend) {
    startBalance -= entry.dayNet
  }
  let cumBalance = startBalance
  const trendData = balanceTrend.map((entry) => {
    cumBalance += entry.dayNet
    return { date: entry.date, balance: cumBalance }
  })

  const monthlyFlowTx = monthlyFlowRes.data || []
  const monthlyFlowMap: Record<string, { income: number; expenses: number }> = {}

  for (let i = monthlyFlowMonths - 1; i >= 0; i--) {
    const m = subMonths(new Date(), i)
    const key = format(m, "yyyy-MM")
    monthlyFlowMap[key] = { income: 0, expenses: 0 }
  }

  for (const tx of monthlyFlowTx) {
    const key = tx.date.substring(0, 7)
    if (monthlyFlowMap[key]) {
      const cat = Array.isArray(tx.category) ? tx.category[0] : tx.category
      const amtUYU = toUYU(Number(tx.amount), tx.currency, latestRates)
      if (cat?.type === "income") {
        monthlyFlowMap[key].income += amtUYU
      } else {
        monthlyFlowMap[key].expenses += amtUYU
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

  const budgets = budgetsRes.data || []
  const allCategories = await auth.supabase.from("categories").select("id, parent_id").eq("user_id", auth.userId)
  const cats = allCategories.data || []

  const budgetProgress = budgets.map((b) => {
    const childIds = cats.filter((c) => c.parent_id === b.category_id).map((c) => c.id)
    const allIds = [b.category_id, ...childIds]
    const spent = transactions
      .filter((tx) => allIds.includes(tx.category_id) && tx.category?.type === "expense")
      .reduce((s, tx) => s + toUYU(Number(tx.amount), tx.currency, latestRates), 0)
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
    range: { from, to },
  })
}
