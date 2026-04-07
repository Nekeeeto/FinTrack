import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"
import { sendPushNotification } from "@/lib/push"

// POST /api/push/send
export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const { type } = await req.json()

    if (type === "test") {
      const result = await sendPushNotification(
        "Biyuya - Test",
        "Las notificaciones push están funcionando correctamente.",
        "/inicio",
        auth.userId
      )
      return NextResponse.json({ ok: true, ...result })
    }

    if (type === "weekly_summary") {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const { data: transactions } = await auth.supabase
        .from("transactions")
        .select("amount, category:categories(type)")
        .eq("user_id", auth.userId)
        .gte("date", weekAgo.toISOString().slice(0, 10))
        .lte("date", now.toISOString().slice(0, 10))

      if (!transactions || transactions.length === 0) {
        return NextResponse.json({ ok: true, sent: 0, message: "Sin transacciones esta semana" })
      }

      let income = 0
      let expenses = 0
      for (const tx of transactions) {
        const cat = tx.category as unknown as { type: string } | null
        if (cat?.type === "income") {
          income += tx.amount
        } else {
          expenses += tx.amount
        }
      }

      const body = [
        `${transactions.length} transacciones`,
        `Ingresos: $${income.toLocaleString()}`,
        `Gastos: $${expenses.toLocaleString()}`,
        `Balance: $${(income - expenses).toLocaleString()}`,
      ].join("\n")

      const result = await sendPushNotification(
        "Biyuya - Resumen semanal",
        body,
        "/analisis",
        auth.userId
      )
      return NextResponse.json({ ok: true, ...result })
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Error enviando notificación" }, { status: 500 })
  }
}
