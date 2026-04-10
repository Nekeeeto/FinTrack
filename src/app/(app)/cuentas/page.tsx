"use client"

import { useEffect, useState } from "react"
import { Loader2, Pencil, X, Check, Plus, ChevronRight, Building2, Smartphone, ArrowUp, ArrowDown, GripVertical } from "lucide-react"
import { getIcon } from "@/lib/icons"
import { formatMoney, formatDate } from "@/lib/format"
import { AccountBrandAvatar } from "@/components/accounts/account-brand-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Account, AccountType, Currency, Transaction } from "@/types/database"
import {
  NACIONAL_ACCOUNT_PRESETS,
  INTERNACIONAL_ACCOUNT_PRESETS,
  resolveAccountDisplayLogoUrl,
  type AccountPreset,
} from "@/lib/account-presets"

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
  "#b2bcc9", "#ef4444", "#f97316", "#fb923c", "#facc15", "#a3e635", "#4ade80",
]

const ACCOUNT_ORDER_STORAGE_KEY = "fintrack:accounts-order:v1"

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTx, setLoadingTx] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [editForm, setEditForm] = useState<{
    name: string
    color: string
    icon: string
    type: AccountType
    logo_url: string | null
  }>({ name: "", color: "", icon: "", type: "cash", logo_url: null })
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [scope, setScope] = useState<"nacional" | "internacional">("nacional")
  const [newAccount, setNewAccount] = useState({
    name: "",
    icon: "banknote",
    type: "cash" as AccountType,
    color: PRESET_COLORS[4],
    logoUrl: null as string | null,
    localBalance: "",
    usdEnabled: false,
    usdBalance: "",
  })
  const [creatingSave, setCreatingSave] = useState(false)
  const [createError, setCreateError] = useState("")
  const [draggingId, setDraggingId] = useState<string | null>(null)

  function sortAccountsByStoredOrder(list: Account[]): Account[] {
    if (typeof window === "undefined") return list
    const raw = window.localStorage.getItem(ACCOUNT_ORDER_STORAGE_KEY)
    if (!raw) return list
    try {
      const orderedIds = JSON.parse(raw) as string[]
      if (!Array.isArray(orderedIds)) return list
      const rank = new Map(orderedIds.map((id, index) => [id, index]))
      return [...list].sort((a, b) => {
        const aRank = rank.has(a.id) ? (rank.get(a.id) as number) : Number.MAX_SAFE_INTEGER
        const bRank = rank.has(b.id) ? (rank.get(b.id) as number) : Number.MAX_SAFE_INTEGER
        if (aRank !== bRank) return aRank - bRank
        return a.created_at.localeCompare(b.created_at)
      })
    } catch {
      return list
    }
  }

  function persistAccountOrder(nextAccounts: Account[]) {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
      ACCOUNT_ORDER_STORAGE_KEY,
      JSON.stringify(nextAccounts.map((account) => account.id))
    )
  }

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        const next = sortAccountsByStoredOrder(data ?? [])
        setAccounts(next)
        persistAccountOrder(next)
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
      logo_url: account.logo_url ?? null,
    })
  }

  function cancelEdit() {
    setEditingAccount(null)
  }

  async function saveEdit() {
    if (!editingAccount) return
    setSaving(true)

    const updates: Record<string, string | AccountType | null> = {}
    if (editForm.name !== editingAccount.name) updates.name = editForm.name
    if (editForm.color !== editingAccount.color) updates.color = editForm.color
    if (editForm.icon !== editingAccount.icon) updates.icon = editForm.icon
    if (editForm.type !== editingAccount.type) updates.type = editForm.type
    if (editingAccount.logo_url !== editForm.logo_url) {
      updates.logo_url = editForm.logo_url === undefined ? null : editForm.logo_url
    }

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

  function resetCreateForm() {
    setScope("nacional")
    setNewAccount({
      name: "",
      icon: "banknote",
      type: "cash",
      color: PRESET_COLORS[4],
      logoUrl: null,
      localBalance: "",
      usdEnabled: false,
      usdBalance: "",
    })
    setCreateError("")
  }

  function selectPreset(option: AccountPreset) {
    setNewAccount((prev) => ({
      ...prev,
      name: option.name,
      icon: option.icon,
      type: option.type,
      logoUrl: option.logoUrl ?? null,
    }))
    setSelectorOpen(false)
  }

  async function createAccount() {
    if (!newAccount.name.trim()) {
      setCreateError("Ingresá un nombre para la cuenta.")
      return
    }

    const baseCurrency: Currency = scope === "internacional" ? "USD" : "UYU"
    const localAmount = Number.parseFloat(newAccount.localBalance || "0")
    const usdAmount = Number.parseFloat(newAccount.usdBalance || "0")

    if (Number.isNaN(localAmount) || localAmount < 0 || Number.isNaN(usdAmount) || usdAmount < 0) {
      setCreateError("Los saldos iniciales deben ser números positivos.")
      return
    }

    setCreatingSave(true)
    setCreateError("")

    try {
      const firstPayload = {
        name: newAccount.name.trim(),
        type: newAccount.type,
        currency: baseCurrency,
        balance: localAmount,
        color: newAccount.color,
        icon: newAccount.icon,
        ...(newAccount.logoUrl ? { logo_url: newAccount.logoUrl } : {}),
      }

      const firstRes = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firstPayload),
      })

      if (!firstRes.ok) {
        const errorData = await firstRes.json()
        setCreateError(errorData.error?.toString() || "No pudimos crear la cuenta.")
        setCreatingSave(false)
        return
      }

      const createdMain = await firstRes.json()
      const created: Account[] = [createdMain]

      if (scope === "nacional" && newAccount.usdEnabled) {
        const usdPayload = {
          name: `${newAccount.name.trim()} USD`,
          type: newAccount.type,
          currency: "USD" as Currency,
          balance: usdAmount,
          color: newAccount.color,
          icon: newAccount.icon,
          ...(newAccount.logoUrl ? { logo_url: newAccount.logoUrl } : {}),
        }
        const usdRes = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usdPayload),
        })
        if (usdRes.ok) {
          created.push(await usdRes.json())
        }
      }

      setAccounts((prev) => {
        const next = [...prev, ...created]
        persistAccountOrder(next)
        return next
      })
      setCreating(false)
      setSelectorOpen(false)
      resetCreateForm()
    } catch {
      setCreateError("Error de conexión. Intentá de nuevo.")
    } finally {
      setCreatingSave(false)
    }
  }

  function moveAccount(accountId: string, direction: "up" | "down") {
    setAccounts((prev) => {
      const index = prev.findIndex((account) => account.id === accountId)
      if (index === -1) return prev

      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev

      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(targetIndex, 0, moved)
      persistAccountOrder(next)
      return next
    })
  }

  function moveAccountByDrop(fromId: string, toId: string) {
    if (fromId === toId) return
    setAccounts((prev) => {
      const from = prev.findIndex((account) => account.id === fromId)
      const to = prev.findIndex((account) => account.id === toId)
      if (from === -1 || to === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      persistAccountOrder(next)
      return next
    })
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
  const presetOptions = scope === "nacional" ? NACIONAL_ACCOUNT_PRESETS : INTERNACIONAL_ACCOUNT_PRESETS
  const selectedPreset = presetOptions.find((option) => option.name === newAccount.name)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-end md:justify-between">
        <h1 className="hidden md:block text-2xl font-bold">Cuentas</h1>
        <Button
          onClick={() => {
            resetCreateForm()
            setCreating(true)
          }}
          className="rounded-full h-10 px-4 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Nueva cuenta
        </Button>
      </div>

      <div className={`grid gap-3 ${activeCurrencies.length <= 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
        {activeCurrencies.map((cur) => (
          <div key={cur} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total {cur}</p>
            <p className="text-2xl font-bold mt-1">{formatMoney(totalsByCurrency[cur], cur as Currency)}</p>
          </div>
        ))}
      </div>

      {/* Cards de cuentas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {accounts.map((account) => {
          const isSelected = selectedAccount?.id === account.id
          const accountIndex = accounts.findIndex((a) => a.id === account.id)
          return (
            <div
              key={account.id}
              onClick={() => selectAccount(account)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  selectAccount(account)
                }
              }}
              role="button"
              tabIndex={0}
              draggable
              onDragStart={() => setDraggingId(account.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggingId) moveAccountByDrop(draggingId, account.id)
                setDraggingId(null)
              }}
              onDragEnd={() => setDraggingId(null)}
              className={`relative overflow-hidden p-4 rounded-xl text-left transition-all group ${
                isSelected ? "ring-2 ring-white/50 scale-[1.02]" : "hover:scale-[1.01]"
              }`}
              style={{ backgroundColor: account.color }}
            >
              <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/20 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-3.5 w-3.5 text-white/80" />
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    moveAccount(account.id, "up")
                  }}
                  disabled={accountIndex === 0}
                  className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/15 disabled:opacity-40"
                >
                  <ArrowUp className="h-3 w-3 text-white" />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    moveAccount(account.id, "down")
                  }}
                  disabled={accountIndex === accounts.length - 1}
                  className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/15 disabled:opacity-40"
                >
                  <ArrowDown className="h-3 w-3 text-white" />
                </button>
              </div>

              {/* Botón de editar */}
              <button
                onClick={(e) => startEdit(account, e)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/25 transition-all"
                aria-label={`Editar ${account.name}`}
              >
                <Pencil className="h-3.5 w-3.5 text-white/80" />
              </button>
              <div className="flex items-center gap-2 mb-3 min-w-0">
                <AccountBrandAvatar
                  logoUrl={account.logo_url}
                  icon={account.icon}
                  name={account.name}
                  className="h-8 w-8 shrink-0 rounded-lg bg-white/15"
                  iconClassName="text-white/80"
                />
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider truncate min-w-0">
                  {account.name}
                </span>
              </div>
              <p className="text-xl font-bold text-white">
                {formatMoney(account.balance, account.currency)}
              </p>
              <p className="text-xs text-white/50 mt-1">{account.currency}</p>
            </div>
          )
        })}
        <button
          onClick={() => {
            resetCreateForm()
            setCreating(true)
          }}
          className="rounded-xl border-2 border-dashed border-border bg-card/40 min-h-[132px] p-4 text-left hover:border-emerald-500/60 hover:bg-card transition-colors"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Plus className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold">Añadir cuenta</p>
          <p className="mt-1 text-xs text-muted-foreground">Creá una nueva cuenta acá</p>
        </button>
      </div>

      {/* Modal de edición */}
      {editingAccount && (
        <>
          <button
            onClick={cancelEdit}
            className="fixed inset-0 z-40 bg-black/70"
            aria-label="Cerrar edición"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-border/60 bg-card p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-xl">Editar cuenta — {editingAccount.name}</h2>
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

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Logo / ícono</Label>
                {resolveAccountDisplayLogoUrl({ name: editForm.name, logo_url: editForm.logo_url }) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground"
                    onClick={() => setEditForm((f) => ({ ...f, logo_url: "" }))}
                  >
                    Quitar logo
                  </Button>
                ) : null}
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {ICON_OPTIONS.map((opt) => {
                  const OptIcon = getIcon(opt.value)
                  const active = editForm.icon === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, icon: opt.value }))}
                      className={`h-10 rounded-xl border inline-flex items-center justify-center transition-colors ${
                        active ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                      title={opt.label}
                      aria-label={opt.label}
                    >
                      <OptIcon className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
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
                <AccountBrandAvatar
                  logoUrl={editForm.logo_url}
                  icon={editForm.icon}
                  name={editForm.name}
                  className="h-10 w-10 shrink-0 rounded-lg bg-white/15"
                  iconClassName="text-white/80"
                />
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
          </div>
        </>
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

      {creating && (
        <>
          <button
            onClick={() => {
              setCreating(false)
              setSelectorOpen(false)
            }}
            className="fixed inset-0 z-40 bg-black/70"
            aria-label="Cerrar nueva cuenta"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-border/60 bg-card px-4 pb-6 pt-4 md:px-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setCreating(false)
                  setSelectorOpen(false)
                }}
                className="h-10 w-10 rounded-full bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">Nueva cuenta</h2>
              <button
                onClick={createAccount}
                disabled={creatingSave}
                className="h-12 w-12 rounded-full bg-emerald-500 inline-flex items-center justify-center text-black disabled:opacity-60"
              >
                {creatingSave ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-6 w-6" />}
              </button>
            </div>

            <div className="rounded-2xl bg-muted p-1 grid grid-cols-2 gap-1">
              <button
                onClick={() => {
                  setScope("nacional")
                  setNewAccount((prev) => ({ ...prev, usdEnabled: false, usdBalance: "" }))
                }}
                className={`h-10 rounded-xl text-sm font-medium transition-colors ${
                  scope === "nacional" ? "bg-background text-foreground" : "text-muted-foreground"
                }`}
              >
                Nacional
              </button>
              <button
                onClick={() => setScope("internacional")}
                className={`h-10 rounded-xl text-sm font-medium transition-colors ${
                  scope === "internacional" ? "bg-background text-foreground" : "text-muted-foreground"
                }`}
              >
                Internacional
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <button
                onClick={() => setSelectorOpen(true)}
                className="w-full rounded-2xl border border-border bg-muted/30 p-3 flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden">
                    {selectedPreset ? (
                      <AccountBrandAvatar
                        logoUrl={selectedPreset.logoUrl}
                        icon={selectedPreset.icon}
                        name={selectedPreset.name}
                        className="h-full w-full rounded-lg bg-muted/40"
                        iconClassName="text-muted-foreground"
                      />
                    ) : scope === "nacional" ? (
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="font-medium">{newAccount.name || (scope === "nacional" ? "Seleccionar banco uruguayo" : "Seleccionar wallet internacional")}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="rounded-2xl border border-border bg-muted/30 px-3 h-14 flex items-center gap-2">
                <Input
                  value={newAccount.name}
                  onChange={(e) => setNewAccount((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre de la cuenta"
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
                <button
                  onClick={() => setSelectorOpen(true)}
                  className="h-9 w-9 rounded-full bg-background border border-border inline-flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 px-4 h-14 flex items-center gap-3">
                <span className="font-semibold text-muted-foreground">{scope === "internacional" ? "$" : "UYU"}</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAccount.localBalance}
                  onChange={(e) => setNewAccount((prev) => ({ ...prev, localBalance: e.target.value }))}
                  placeholder={scope === "internacional" ? "Saldo inicial en dólares (opcional)" : "Saldo inicial en pesos uruguayos (opcional)"}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>

              {scope === "nacional" && (
                <>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">Cuenta en dólares</p>
                      <p className="text-muted-foreground">Activar saldo en dólares para esta cuenta</p>
                    </div>
                    <button
                      onClick={() => setNewAccount((prev) => ({ ...prev, usdEnabled: !prev.usdEnabled }))}
                      className={`h-7 w-12 rounded-full p-1 transition-colors ${newAccount.usdEnabled ? "bg-emerald-500" : "bg-muted"}`}
                    >
                      <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${newAccount.usdEnabled ? "translate-x-5" : ""}`} />
                    </button>
                  </div>

                  {newAccount.usdEnabled && (
                    <div className="rounded-2xl border border-border bg-muted/30 px-4 h-14 flex items-center gap-3">
                      <span className="font-semibold text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newAccount.usdBalance}
                        onChange={(e) => setNewAccount((prev) => ({ ...prev, usdBalance: e.target.value }))}
                        placeholder="Saldo inicial en dólares (opcional)"
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewAccount((prev) => ({ ...prev, color: c }))}
                    className={`h-10 w-10 rounded-xl border-2 transition-all ${
                      newAccount.color === c ? "border-amber-400 scale-105" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {createError && (
                <p className="text-sm text-red-500">{createError}</p>
              )}
            </div>
            </div>
          </div>

          {selectorOpen && (
            <>
              <button
                onClick={() => setSelectorOpen(false)}
                className="fixed inset-0 z-[55] bg-black/60"
                aria-label="Cerrar selector"
              />
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-3xl border border-border/60 bg-card px-4 pb-6 pt-4 md:px-6">
                  <h3 className="text-2xl font-semibold mb-4">
                    {scope === "nacional" ? "Seleccionar banco uruguayo" : "Seleccionar wallet internacional"}
                  </h3>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {presetOptions.map((option) => (
                      <button
                        key={option.name}
                        onClick={() => selectPreset(option)}
                        className={`w-full rounded-2xl px-3 py-3 border flex items-center justify-between transition-colors ${
                          newAccount.name === option.name ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <AccountBrandAvatar
                            logoUrl={option.logoUrl}
                            icon={option.icon}
                            name={option.name}
                            className="h-9 w-9 shrink-0 rounded-lg bg-muted/50"
                            iconClassName="text-muted-foreground"
                          />
                          <span className="font-medium truncate">{option.name}</span>
                        </span>
                        {newAccount.name === option.name && (
                          <span className="h-7 w-7 rounded-full bg-emerald-500 text-black inline-flex items-center justify-center">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
