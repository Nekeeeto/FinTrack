"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Trash2, Pencil, Loader2, RefreshCw, CalendarClock, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getIcon } from "@/lib/icons"
import { formatMoney } from "@/lib/format"
import type { RecurringPayment, Account, Category, Currency, RecurringFrequency } from "@/types/database"

const FREQ_LABELS: Record<RecurringFrequency, string> = {
  daily: "Diario",
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  yearly: "Anual",
}

const FREQ_OPTIONS: { value: RecurringFrequency; label: string }[] = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
]

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export default function RecurrentesPage() {
  const [payments, setPayments] = useState<RecurringPayment[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState<string | null>(null)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<RecurringPayment | null>(null)
  const [deleteItem, setDeleteItem] = useState<RecurringPayment | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [rpRes, accRes, catRes] = await Promise.all([
      fetch("/api/recurring-payments"),
      fetch("/api/accounts"),
      fetch("/api/categories?flat=true"),
    ])
    const [rpData, accData, catData] = await Promise.all([
      rpRes.json(),
      accRes.json(),
      catRes.json(),
    ])
    setPayments(Array.isArray(rpData) ? rpData : [])
    setAccounts(Array.isArray(accData) ? accData : [])
    setCategories(Array.isArray(catData) ? catData : catData.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleGenerate() {
    setGenerating(true)
    setGenResult(null)
    try {
      const res = await fetch("/api/recurring-payments/generate", { method: "POST" })
      const data = await res.json()
      if (data.generated > 0) {
        setGenResult(`Se generaron ${data.generated} transaccion(es)`)
        fetchData()
      } else {
        setGenResult("No hay pagos pendientes por generar")
      }
    } catch {
      setGenResult("Error al generar")
    }
    setGenerating(false)
  }

  async function handleToggleActive(rp: RecurringPayment) {
    await fetch(`/api/recurring-payments/${rp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !rp.active }),
    })
    fetchData()
  }

  async function handleDelete() {
    if (!deleteItem) return
    await fetch(`/api/recurring-payments/${deleteItem.id}`, { method: "DELETE" })
    setDeleteItem(null)
    fetchData()
  }

  function handleSaved() {
    setModalOpen(false)
    setEditItem(null)
    fetchData()
  }

  const activePayments = payments.filter((p) => p.active)
  const inactivePayments = payments.filter((p) => !p.active)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pagos recurrentes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurá pagos automáticos que se repiten periódicamente
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Generar pendientes
          </Button>
          <Button size="sm" onClick={() => { setEditItem(null); setModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-1" /> Nuevo
          </Button>
        </div>
      </div>

      {genResult && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-2.5">
          {genResult}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16">
          <CalendarClock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No tenés pagos recurrentes configurados</p>
          <Button size="sm" className="mt-4" onClick={() => { setEditItem(null); setModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-1" /> Crear el primero
          </Button>
        </div>
      ) : (
        <>
          {/* Activos */}
          {activePayments.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Activos</h2>
              <div className="space-y-2">
                {activePayments.map((rp) => (
                  <PaymentCard
                    key={rp.id}
                    payment={rp}
                    onEdit={() => { setEditItem(rp); setModalOpen(true) }}
                    onDelete={() => setDeleteItem(rp)}
                    onToggle={() => handleToggleActive(rp)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactivos */}
          {inactivePayments.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pausados</h2>
              <div className="space-y-2 opacity-60">
                {inactivePayments.map((rp) => (
                  <PaymentCard
                    key={rp.id}
                    payment={rp}
                    onEdit={() => { setEditItem(rp); setModalOpen(true) }}
                    onDelete={() => setDeleteItem(rp)}
                    onToggle={() => handleToggleActive(rp)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal crear/editar */}
      {modalOpen && (
        <RecurringModal
          payment={editItem}
          accounts={accounts}
          categories={categories}
          onClose={() => { setModalOpen(false); setEditItem(null) }}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm delete */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteItem(null)} />
          <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-sm mx-4 p-6 text-center">
            <Trash2 className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">¿Eliminar pago recurrente?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              &quot;{deleteItem.description || "Sin descripción"}&quot; — {formatMoney(deleteItem.amount, deleteItem.currency)} {FREQ_LABELS[deleteItem.frequency].toLowerCase()}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteItem(null)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Card de pago recurrente ---
function PaymentCard({
  payment,
  onEdit,
  onDelete,
  onToggle,
}: {
  payment: RecurringPayment
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const CatIcon = getIcon(payment.category?.icon || "tag")
  const catColor = payment.category?.color || "#666"
  const isExpense = payment.category?.type === "expense"

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors group">
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: catColor + "20" }}
      >
        <CatIcon className="h-5 w-5" style={{ color: catColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {payment.description || payment.category?.name || "Pago recurrente"}
        </p>
        <p className="text-xs text-muted-foreground">
          {FREQ_LABELS[payment.frequency]} · {payment.account?.name || ""} · Próximo: {payment.next_due_date}
        </p>
      </div>

      <p className={`text-sm font-bold flex-shrink-0 ${isExpense ? "text-red-500" : "text-emerald-500"}`}>
        {isExpense ? "-" : "+"}{formatMoney(payment.amount, payment.currency)}
      </p>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-accent" title={payment.active ? "Pausar" : "Reactivar"}>
          {payment.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-accent">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// --- Modal crear/editar ---
function RecurringModal({
  payment,
  accounts,
  categories,
  onClose,
  onSaved,
}: {
  payment: RecurringPayment | null
  accounts: Account[]
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!payment

  const [type, setType] = useState<"expense" | "income">(
    payment?.category?.type === "income" ? "income" : "expense"
  )
  const [amount, setAmount] = useState(payment?.amount?.toString() ?? "")
  const [currency, setCurrency] = useState<Currency>(payment?.currency ?? "UYU")
  const [accountId, setAccountId] = useState(payment?.account_id ?? accounts[0]?.id ?? "")
  const [categoryId, setCategoryId] = useState(payment?.category_id ?? "")
  const [description, setDescription] = useState(payment?.description ?? "")
  const [frequency, setFrequency] = useState<RecurringFrequency>(payment?.frequency ?? "monthly")
  const [dayOfMonth, setDayOfMonth] = useState(payment?.day_of_month?.toString() ?? "1")
  const [dayOfWeek, setDayOfWeek] = useState(payment?.day_of_week?.toString() ?? "1")
  const [startDate, setStartDate] = useState(payment?.start_date ?? new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(payment?.end_date ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const filteredCategories = categories.filter((c) => c.type === type)
  const parentCategories = filteredCategories.filter((c) => !c.parent_id)

  function calcNextDue(): string {
    // Si hay start_date en el futuro, usar esa
    const today = new Date().toISOString().split("T")[0]
    if (startDate >= today) return startDate

    // Si no, calcular la próxima fecha desde hoy según la frecuencia
    const now = new Date()
    if (frequency === "monthly") {
      const dom = parseInt(dayOfMonth) || 1
      const next = new Date(now.getFullYear(), now.getMonth(), dom)
      if (next <= now) next.setMonth(next.getMonth() + 1)
      return next.toISOString().split("T")[0]
    }
    return today
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !categoryId || !accountId) {
      setError("Completá los campos requeridos.")
      return
    }

    setSaving(true)
    setError("")

    const body = {
      account_id: accountId,
      category_id: categoryId,
      amount: parseFloat(amount),
      currency,
      description,
      frequency,
      day_of_month: (frequency === "monthly" || frequency === "yearly") ? parseInt(dayOfMonth) || 1 : null,
      day_of_week: (frequency === "weekly" || frequency === "biweekly") ? parseInt(dayOfWeek) || 1 : null,
      start_date: startDate,
      end_date: endDate || null,
      next_due_date: isEdit ? (payment.next_due_date) : calcNextDue(),
      active: true,
    }

    try {
      const url = isEdit ? `/api/recurring-payments/${payment.id}` : "/api/recurring-payments"
      const method = isEdit ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.toString() ?? "Error al guardar")
        return
      }

      onSaved()
    } catch {
      setError("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg">
            {isEdit ? "Editar pago recurrente" : "Nuevo pago recurrente"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-accent">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Tipo */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => { setType("expense"); setCategoryId("") }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${type === "expense" ? "bg-red-500 text-white" : "hover:bg-accent"}`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => { setType("income"); setCategoryId("") }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${type === "income" ? "bg-emerald-500 text-white" : "hover:bg-accent"}`}
            >
              Ingreso
            </button>
          </div>

          {/* Monto + moneda */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Monto *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-muted-foreground mb-1 block">Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
                <option value="UYU">🇺🇾 UYU</option>
                <option value="USD">🇺🇸 USD</option>
                <option value="BRL">🇧🇷 BRL</option>
                <option value="ARS">🇦🇷 ARS</option>
              </select>
            </div>
          </div>

          {/* Cuenta */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Cuenta *</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Categoría *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background" required>
              <option value="">Elegir...</option>
              {parentCategories.map((parent) => {
                const subs = filteredCategories.filter((c) => c.parent_id === parent.id)
                if (subs.length === 0) {
                  return <option key={parent.id} value={parent.id}>{parent.name}</option>
                }
                return (
                  <optgroup key={parent.id} label={parent.name}>
                    {subs.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Netflix, alquiler, sueldo..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Frecuencia */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Frecuencia *</label>
            <div className="flex flex-wrap gap-1.5">
              {FREQ_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    frequency === opt.value
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-border text-muted-foreground hover:border-emerald-500/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Día del mes (solo para monthly/yearly) */}
          {(frequency === "monthly" || frequency === "yearly") && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Día del mes</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                className="w-24 px-3 py-2 text-sm rounded-lg border border-border bg-background"
              />
            </div>
          )}

          {/* Día de la semana (solo para weekly/biweekly) */}
          {(frequency === "weekly" || frequency === "biweekly") && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Día de la semana</label>
              <div className="flex gap-1.5">
                {DAY_NAMES.map((name, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDayOfWeek(i.toString())}
                    className={`w-10 h-10 rounded-lg text-xs font-medium border transition-all ${
                      parseInt(dayOfWeek) === i
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border text-muted-foreground hover:border-emerald-500/50"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fecha inicio *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fecha fin (opcional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
