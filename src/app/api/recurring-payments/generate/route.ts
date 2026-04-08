import { NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"
import { addDays, addWeeks, addMonths, addYears, format, isBefore, isEqual, parseISO } from "date-fns"

function calcNextDue(current: string, frequency: string): string {
  const d = parseISO(current)
  switch (frequency) {
    case "daily": return format(addDays(d, 1), "yyyy-MM-dd")
    case "weekly": return format(addWeeks(d, 1), "yyyy-MM-dd")
    case "biweekly": return format(addWeeks(d, 2), "yyyy-MM-dd")
    case "monthly": return format(addMonths(d, 1), "yyyy-MM-dd")
    case "yearly": return format(addYears(d, 1), "yyyy-MM-dd")
    default: return format(addMonths(d, 1), "yyyy-MM-dd")
  }
}

// POST /api/recurring-payments/generate
// Genera transacciones para todos los pagos recurrentes vencidos del usuario
export async function POST() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const today = format(new Date(), "yyyy-MM-dd")

  // Buscar pagos recurrentes activos con next_due_date <= hoy
  const { data: pending, error: fetchError } = await auth.supabase
    .from("recurring_payments")
    .select("*")
    .eq("user_id", auth.userId)
    .eq("active", true)
    .lte("next_due_date", today)

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!pending || pending.length === 0) {
    return NextResponse.json({ generated: 0 })
  }

  let generated = 0

  for (const rp of pending) {
    let dueDate = rp.next_due_date

    // Generar transacciones para cada fecha vencida (puede haber más de una si se saltaron días)
    while (isBefore(parseISO(dueDate), parseISO(today)) || isEqual(parseISO(dueDate), parseISO(today))) {
      // Si tiene end_date y ya lo pasó, desactivar
      if (rp.end_date && isBefore(parseISO(rp.end_date), parseISO(dueDate))) {
        await auth.supabase
          .from("recurring_payments")
          .update({ active: false, updated_at: new Date().toISOString() })
          .eq("id", rp.id)
        break
      }

      // Crear transacción
      const { error: txError } = await auth.supabase
        .from("transactions")
        .insert({
          user_id: auth.userId,
          account_id: rp.account_id,
          category_id: rp.category_id,
          amount: rp.amount,
          currency: rp.currency,
          description: rp.description ? `${rp.description} (recurrente)` : "Pago recurrente",
          date: dueDate,
          source: "webapp",
        })

      if (txError) {
        return NextResponse.json({ error: txError.message, generated }, { status: 500 })
      }

      // Actualizar saldo de la cuenta
      const { data: account } = await auth.supabase
        .from("accounts")
        .select("balance")
        .eq("id", rp.account_id)
        .single()

      if (account) {
        // Si la categoría es gasto, resta; si es ingreso, suma
        const { data: category } = await auth.supabase
          .from("categories")
          .select("type")
          .eq("id", rp.category_id)
          .single()

        const delta = category?.type === "income" ? rp.amount : -rp.amount
        await auth.supabase
          .from("accounts")
          .update({ balance: account.balance + delta })
          .eq("id", rp.account_id)
      }

      generated++
      dueDate = calcNextDue(dueDate, rp.frequency)
    }

    // Actualizar next_due_date y last_generated_date
    await auth.supabase
      .from("recurring_payments")
      .update({
        next_due_date: dueDate,
        last_generated_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rp.id)
  }

  return NextResponse.json({ generated })
}
