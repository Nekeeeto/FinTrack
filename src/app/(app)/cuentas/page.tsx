"use client"

import { useEffect, useState } from "react"
import { Loader2, Pencil, X, Check } from "lucide-react"
import { getIcon } from "@/lib/icons"
import { formatMoney, formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Account, AccountType, Transaction } from "@/types/database"

const ICON_OPTIONS = [
  { value: "wallet", label: "Billetera" },
  { value: "briefcase", label: "Maletín" },
  { value: "home", label: "Casa" },
  { value: "banknote", label: "Billete" },
  { value: "trending-up", label: "Inversión" },
]

const TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "checking", label: "Corriente" },
  { value: "savings", label: "Ahorro" },
  { value: "cash", label: "Efectivo" },
  { value: "investment", label: "Inversión" },
  { value: "business", label: "Negocio" },
]

const PRESET_COLORS = [
  "#16a34a", "#1e3a8a", "#dc2626", "#1a1a1a",
  "#7c3aed", "#0891b2", "#d97706", "#be185d",
]

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTx, setLoadingTx] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [editForm, setEditForm] = useState({ name: "", color: "", icon: "", type: "" as AccountType })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data ?? [])
        setLoading(false)
      })
  }, [])

  async function selectAccount(account: Account) {
    if (editingAccount) return
    setSelectedAccount(account)
    setLoadingTx(true)
    const res = await fetch(`/api/transactions?account_id=${account.id}&limit=50`)
    const data = await res.json()
    setTransactions(data.data ?? [])
    setLoadingTx(false)
  }

  function startEdit(account: Account, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingAccount(account)
    setEditForm({
      name: account.name,
      color: account.color,
      icon: account.icon,
      type: account.type,
    })
  }

  function cancelEdit() {
    setEditingAccount(null)
  }

  async function saveEdit() {
    if (!editingAccount) return
    setSaving(true)

    const updates: Record<string, string> = {}
    if (editForm.name !== editingAccount.name) updates.name = editForm.name
    if (editForm.color !== editingAccount.color) updates.color = editForm.color
    if (editForm.icon !== editingAccount.icon) updates.icon = editForm.icon
    if (editForm.type !== editingAccount.type) updates.type = editForm.type

    if (Object.keys(updates).length === 0) {
      setEditingAccount(null)
      setSaving(false)
      return
    }

    const res = await fetch("/api/accounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingAccount.id, ...updates }),
    })

    if (res.ok) {
      const updated = await res.json()
      setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      if (selectedAccount?.id === updated.id) setSelectedAccount(updated)
      setEditingAccount(null)
    }
    setSaving(false)
  }

  // Agrupar cuentas por moneda
  const currencies = ["UYU", "USD", "BRL", "ARS"] as const
  const totalsByCurrency = currencies.reduce((acc, cur) => {
    const filtered = accounts.filter((a) => a.currency === cur)
    acc[cur] = filtered.reduce((sum, a) => sum + Number(a.balance), 0)
    return acc
  }, {} as Record<string, number>)
  const activeCurrencies = currencies.filter((cur) =>
    accounts.some((a) => a.currency === cur) || totalsByCurrency[cur] !== 0
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Cuentas</h1>

      {/* Totales por moneda */}
      <div className={`grid gap-3 ${activeCurrencies.length <= 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
        {activeCurrencies.map((cur) => (
          <div key={cur} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total {cur}</p>
            <p className="text-2xl font-bold mt-1">{formatMoney(totalsByCurrency[cur], cur)}</p>
          </div>
        ))}
      </div>

      {/* Cards de cuentas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {accounts.map((account) => {
          const Icon = getIcon(account.icon)
          const isSelected = selectedAccount?.id === account.id
          return (
            <button
              key={account.id}
              onClick={() => selectAccount(account)}
              className={`relative overflow-hidden p-4 rounded-xl text-left transition-all group ${
                isSelected ? "ring-2 ring-white/50 scale-[1.02]" : "hover:scale-[1.01]"
              }`}
              style={{ backgroundColor: account.color }}
            >
              {/* Botón de editar */}
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => startEdit(account, e)}
                onKeyDown={(e) => { if (e.key === "Enter") startEdit(account, e as unknown as React.MouseEvent) }}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/25 transition-all"
              >
                <Pencil className="h-3.5 w-3.5 text-white/80" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-white/70" />
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  {account.name}
                </span>
              </div>
              <p className="text-xl font-bold text-white">
                {formatMoney(account.balance, account.currency)}
              </p>
              <p className="text-xs text-white/50 mt-1">{account.currency}</p>
            </button>
          )
        })}
      </div>

      {/* Panel de edición */}
      {editingAccount && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Editar cuenta — {editingAccount.name}</h2>
            <button onClick={cancelEdit} className="p-1 rounded-md hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select value={editForm.type} onValueChange={(v) => setEditForm((f) => ({ ...f, type: v as AccountType }))}>
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-icon">Ícono</Label>
              <Select value={editForm.icon} onValueChange={(v) => { if (v) setEditForm((f) => ({ ...f, icon: v })) }}>
                <SelectTrigger id="edit-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => {
                    const OptIcon = getIcon(opt.value)
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <OptIcon className="h-4 w-4" />
                          {opt.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setEditForm((f) => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      editForm.color === c ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <Input
                  type="color"
                  value={editForm.color}
                  onChange={(e) => setEditForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-8 h-8 p-0 border-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: editForm.color }}>
            {(() => { const PreviewIcon = getIcon(editForm.icon); return <PreviewIcon className="h-5 w-5 text-white/70" /> })()}
            <span className="text-sm font-medium text-white">{editForm.name}</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={cancelEdit}>
              Cancelar
            </Button>
            <Button size="sm" onClick={saveEdit} disabled={saving || !editForm.name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Guardar
            </Button>
          </div>
        </div>
      )}

      {/* Historial de la cuenta seleccionada */}
      {selectedAccount && !editingAccount && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold">
              Movimientos — {selectedAccount.name}
            </h2>
          </div>

          {loadingTx ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Sin movimientos en esta cuenta.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => {
                const Icon = getIcon(tx.category?.icon || "tag")
                const isIncome = tx.category?.type === "income"
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (tx.category?.color || "#6b7280") + "20" }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: tx.category?.color || "#6b7280" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description || tx.category?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.date)} · {tx.category?.name}</p>
                    </div>
                    <span className={`text-sm font-semibold ${isIncome ? "text-emerald-500" : "text-foreground"}`}>
                      {isIncome ? "+" : "-"}{formatMoney(Math.abs(tx.amount), tx.currency)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
