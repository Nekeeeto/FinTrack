import { NextRequest, NextResponse } from "next/server"
import { sendPushNotification } from "@/lib/push"
import { supabaseAdmin } from "@/lib/supabase/server"

// POST /api/push/send — enviar notificación (test o resumen semanal)
export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json()

    if (type === "test") {
      const result = await sendPushNotification(
        "Biyuya - Test",
        "Las notificaciones push están funcionando correctamente.",
        "/"
      )
      return NextResponse.json({ ok: true, ...result })
    }

    if (type === "weekly_summary") {
      // Calcular resumen de la última semana
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const { data: transactions } = await supabaseAdmin
        .from("transactions")
        .select("amount, category:categories(type)")
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
        "/analisis"
      )
      return NextResponse.json({ ok: true, ...result })
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Error enviando notificación" }, { status: 500 })
  }
}
