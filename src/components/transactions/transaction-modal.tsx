"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Transaction, Account, Category, Currency } from "@/types/database"

interface Props {
  transaction: Transaction | null // null = crear, obj = editar
  accounts: Account[]
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export function TransactionModal({ transaction, accounts, categories, onClose, onSaved }: Props) {
  const isEdit = !!transaction

  const [type, setType] = useState<"expense" | "income">(
    transaction?.category?.type === "income" ? "income" : "expense"
  )
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? "")
  const [currency, setCurrency] = useState(transaction?.currency ?? "UYU")
  const [accountId, setAccountId] = useState(transaction?.account_id ?? accounts[0]?.id ?? "")
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "")
  const [description, setDescription] = useState(transaction?.description ?? "")
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().split("T")[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const filteredCategories = categories.filter((c) => c.type === type)
  const parentCategories = filteredCategories.filter((c) => !c.parent_id)

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
      date,
      source: "manual",
    }

    try {
      const url = isEdit ? `/api/transactions/${transaction.id}` : "/api/transactions"
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
            {isEdit ? "Editar transacción" : "Nueva transacción"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
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
            <label className="text-xs text-muted-foreground mb-1 block">Cuenta</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
            </select>
          </div>

          {/* Categoría con subcategorías */}
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
              placeholder="Opcional..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Guardar" : "Agregar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
