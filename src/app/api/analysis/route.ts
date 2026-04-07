import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"
import { getSetting } from "@/lib/settings"
import Anthropic from "@anthropic-ai/sdk"
import {
  startOfMonth, endOfMonth, subMonths, format,
} from "date-fns"

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4-20250514": { input: 15, output: 75 },
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 0.80, output: 4 },
}

const DEFAULT_MODEL = "claude-sonnet-4-20250514"

// GET /api/analysis?month=2026-04
export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const params = req.nextUrl.searchParams
  const monthParam = params.get("month")

  const now = monthParam ? new Date(monthParam + "-01") : new Date()
  const from = format(startOfMonth(now), "yyyy-MM-dd")
  const to = format(endOfMonth(now), "yyyy-MM-dd")

  const prevMonth = subMonths(now, 1)
  const prevFrom = format(startOfMonth(prevMonth), "yyyy-MM-dd")
  const prevTo = format(endOfMonth(prevMonth), "yyyy-MM-dd")

  const [currentRes, prevRes, categoriesRes, budgetsRes] = await Promise.all([
    auth.supabase
      .from("transactions")
      .select("*, category:categories(name, type, parent_id, color)")
      .eq("user_id", auth.userId)
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false }),
    auth.supabase
      .from("transactions")
      .select("*, category:categories(name, type)")
      .eq("user_id", auth.userId)
      .gte("date", prevFrom)
      .lte("date", prevTo),
    auth.supabase.from("categories").select("id, name, type, parent_id").eq("user_id", auth.userId),
    auth.supabase.from("budget_limits").select("*, category:categories(name)").eq("user_id", auth.userId),
  ])

  const currentTx = currentRes.data || []
  const prevTx = prevRes.data || []
  const categories = categoriesRes.data || []
  const budgets = budgetsRes.data || []

  const currentIncome = currentTx
    .filter((tx) => tx.category?.type === "income")
    .reduce((s, tx) => s + Number(tx.amount), 0)
  const currentExpenses = currentTx
    .filter((tx) => tx.category?.type === "expense")
    .reduce((s, tx) => s + Number(tx.amount), 0)
  const prevIncome = prevTx
    .filter((tx) => tx.category?.type === "income")
    .reduce((s, tx) => s + Number(tx.amount), 0)
  const prevExpenses = prevTx
    .filter((tx) => tx.category?.type === "expense")
    .reduce((s, tx) => s + Number(tx.amount), 0)

  const expByCategory: Record<string, number> = {}
  for (const tx of currentTx) {
    if (tx.category?.type === "expense") {
      const name = tx.category.name
      expByCategory[name] = (expByCategory[name] || 0) + Number(tx.amount)
    }
  }

  const prevExpByCategory: Record<string, number> = {}
  for (const tx of prevTx) {
    if (tx.category?.type === "expense") {
      const name = tx.category.name
      prevExpByCategory[name] = (prevExpByCategory[name] || 0) + Number(tx.amount)
    }
  }

  const budgetSummary = budgets.map((b) => {
    const childIds = categories
      .filter((c) => c.parent_id === b.category_id)
      .map((c) => c.id)
    const allIds = [b.category_id, ...childIds]
    const spent = currentTx
      .filter((tx) => allIds.includes(tx.category_id) && tx.category?.type === "expense")
      .reduce((s, tx) => s + Number(tx.amount), 0)
    return {
      category: b.category?.name || "?",
      limit: b.amount,
      spent,
      percentage: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
    }
  })

  const context = `
DATOS FINANCIEROS — ${format(now, "MMMM yyyy")}

INGRESOS: $${currentIncome.toLocaleString()} (mes anterior: $${prevIncome.toLocaleString()})
GASTOS: $${currentExpenses.toLocaleString()} (mes anterior: $${prevExpenses.toLocaleString()})
FLUJO NETO: $${(currentIncome - currentExpenses).toLocaleString()}

GASTOS POR CATEGORÍA (este mes):
${Object.entries(expByCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([name, val]) => {
    const prev = prevExpByCategory[name] || 0
    const change = prev > 0 ? Math.round(((val - prev) / prev) * 100) : 0
    return `- ${name}: $${val.toLocaleString()} ${prev > 0 ? `(${change > 0 ? "+" : ""}${change}% vs mes anterior)` : "(nuevo)"}`
  })
  .join("\n")}

${budgetSummary.length > 0 ? `PRESUPUESTOS:
${budgetSummary.map((b) => `- ${b.category}: $${b.spent.toLocaleString()} / $${b.limit.toLocaleString()} (${b.percentage}%)`).join("\n")}` : ""}

TOP 5 GASTOS MÁS GRANDES:
${currentTx
  .filter((tx) => tx.category?.type === "expense")
  .sort((a, b) => Number(b.amount) - Number(a.amount))
  .slice(0, 5)
  .map((tx) => `- $${Number(tx.amount).toLocaleString()} — ${tx.description || tx.category?.name} (${tx.date})`)
  .join("\n")}

TOTAL TRANSACCIONES: ${currentTx.length}
`

  const apiKey = await getSetting("ANTHROPIC_API_KEY")
  const model = (await getSetting("ANTHROPIC_MODEL")) || DEFAULT_MODEL
  const anthropic = new Anthropic({ apiKey })

  const response = await anthropic.messages.create({
    model,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Sos un asesor financiero personal. Analizá los datos del mes y generá un resumen inteligente en español rioplatense. Sé directo y conciso.

${context}

Respondé ÚNICAMENTE con un JSON válido (sin markdown, sin backticks):
{
  "resumen": "<2-3 oraciones con lo más destacado del mes>",
  "tendencias": ["<tendencia 1>", "<tendencia 2>", ...],
  "alertas": ["<alerta si algo preocupa>", ...],
  "consejos": ["<consejo práctico 1>", "<consejo práctico 2>"],
  "score": <número del 1-10 indicando salud financiera del mes>,
  "comparacion": "<breve comparación con el mes anterior>"
}`,
      },
    ],
  })

  const inputTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING[DEFAULT_MODEL]
  const costUsd =
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output

  try {
    await supabaseAdmin
      .from("model_usage")
      .insert({
        model,
        action: "analysis",
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: costUsd,
        user_id: auth.userId,
      })
  } catch (err) {
    console.error("Error tracking model usage:", err)
  }

  const text = response.content[0].type === "text" ? response.content[0].text : ""

  try {
    const analysis = JSON.parse(text)
    return NextResponse.json({
      analysis,
      meta: {
        month: format(now, "yyyy-MM"),
        income: currentIncome,
        expenses: currentExpenses,
        net: currentIncome - currentExpenses,
        transactionCount: currentTx.length,
        model,
        cost_usd: costUsd,
      },
    })
  } catch {
    return NextResponse.json({
      analysis: {
        resumen: text.slice(0, 500),
        tendencias: [],
        alertas: [],
        consejos: [],
        score: 0,
        comparacion: "",
      },
      meta: {
        month: format(now, "yyyy-MM"),
        income: currentIncome,
        expenses: currentExpenses,
        net: currentIncome - currentExpenses,
        transactionCount: currentTx.length,
        model,
        cost_usd: costUsd,
      },
    })
  }
}
