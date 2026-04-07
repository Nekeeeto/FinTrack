import { NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

// GET /api/analysis/anomalies
export async function GET() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const now = new Date()
  const from = format(startOfMonth(now), "yyyy-MM-dd")
  const to = format(endOfMonth(now), "yyyy-MM-dd")

  const histFrom = format(startOfMonth(subMonths(now, 3)), "yyyy-MM-dd")
  const histTo = format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd")

  const [currentRes, histRes, categoriesRes] = await Promise.all([
    auth.supabase
      .from("transactions")
      .select("*, category:categories(id, name, type, parent_id, color)")
      .eq("user_id", auth.userId)
      .gte("date", from)
      .lte("date", to)
      .order("amount", { ascending: false }),
    auth.supabase
      .from("transactions")
      .select("category_id, amount, category:categories(name, type, parent_id)")
      .eq("user_id", auth.userId)
      .gte("date", histFrom)
      .lte("date", histTo),
    auth.supabase.from("categories").select("id, name, parent_id, type").eq("user_id", auth.userId),
  ])

  const currentTx = (currentRes.data || []) as Array<Record<string, unknown>>
  const histTx = (histRes.data || []) as Array<Record<string, unknown>>
  const categories = categoriesRes.data || []

  function getCat(tx: Record<string, unknown>): { name: string; type: string; parent_id: string | null; color?: string; id?: string } | null {
    const cat = tx.category
    if (!cat) return null
    if (Array.isArray(cat)) return cat[0] || null
    return cat as { name: string; type: string; parent_id: string | null; color?: string; id?: string }
  }

  const histByParent: Record<string, number[]> = {}
  for (const tx of histTx) {
    const cat = getCat(tx)
    if (cat?.type !== "expense") continue
    const parentId = cat.parent_id || (tx.category_id as string)
    const parentCat = categories.find((c) => c.id === parentId)
    const key = parentCat?.name || "Otro"
    if (!histByParent[key]) histByParent[key] = []
    histByParent[key].push(Number(tx.amount))
  }

  const avgByCategory: Record<string, { avg: number; total: number }> = {}
  for (const [cat, amounts] of Object.entries(histByParent)) {
    const total = amounts.reduce((s, a) => s + a, 0)
    avgByCategory[cat] = { avg: total / 3, total }
  }

  const currentByParent: Record<string, { total: number; color: string }> = {}
  for (const tx of currentTx) {
    const cat = getCat(tx)
    if (cat?.type !== "expense") continue
    const parentId = cat.parent_id || (tx.category_id as string)
    const parentCat = categories.find((c) => c.id === parentId)
    const key = parentCat?.name || "Otro"
    if (!currentByParent[key]) {
      currentByParent[key] = { total: 0, color: cat.color || "#6b7280" }
    }
    currentByParent[key].total += Number(tx.amount)
  }

  const anomalies = []
  for (const [cat, current] of Object.entries(currentByParent)) {
    const hist = avgByCategory[cat]
    if (!hist || hist.avg === 0) continue

    const ratio = current.total / hist.avg
    if (ratio >= 1.5) {
      anomalies.push({
        category: cat,
        current: Math.round(current.total),
        average: Math.round(hist.avg),
        ratio: Math.round(ratio * 10) / 10,
        color: current.color,
        severity: ratio >= 3 ? "alta" as const : ratio >= 2 ? "media" as const : "baja" as const,
        message: `Gasto en ${cat} es ${ratio.toFixed(1)}x mayor que tu promedio`,
      })
    }
  }

  const largeTransactions = []
  for (const tx of currentTx) {
    const cat = getCat(tx)
    if (cat?.type !== "expense") continue
    const parentId = cat.parent_id || (tx.category_id as string)
    const parentCat = categories.find((c) => c.id === parentId)
    const key = parentCat?.name || "Otro"
    const hist = avgByCategory[key]
    if (!hist) continue

    const histAmounts = histByParent[key] || []
    const avgPerTx = histAmounts.length > 0
      ? histAmounts.reduce((s, a) => s + a, 0) / histAmounts.length
      : 0

    if (avgPerTx > 0 && Number(tx.amount) > avgPerTx * 3) {
      largeTransactions.push({
        id: tx.id as string,
        amount: Number(tx.amount),
        description: tx.description as string,
        category: cat.name,
        date: tx.date as string,
        avgPerTx: Math.round(avgPerTx),
        ratio: Math.round((Number(tx.amount) / avgPerTx) * 10) / 10,
      })
    }
  }

  return NextResponse.json({
    anomalies: anomalies.sort((a, b) => b.ratio - a.ratio),
    largeTransactions: largeTransactions.slice(0, 5),
    meta: {
      currentMonth: format(now, "yyyy-MM"),
      historyMonths: 3,
    },
  })
}
