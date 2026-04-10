"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Pencil, X, Check, Plus, ChevronRight, Building2, Smartphone, ArrowUp, ArrowDown, GripVertical, RefreshCw } from "lucide-react"
import { getIcon } from "@/lib/icons"
import { formatMoney, formatDate } from "@/lib/format"
import { AccountBrandAvatar } from "@/components/accounts/account-brand-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Account, AccountType, Currency, ExchangeRate, Transaction } from "@/types/database"
import {
  ACCOUNT_COLOR_OPTIONS,
  ACCOUNT_ICON_OPTIONS,
  ONBOARDING_NACIONAL_PRESETS,
  INTERNACIONAL_ACCOUNT_PRESETS,
  resolveAccountDisplayLogoUrl,
  type AccountPreset,
} from "@/lib/account-presets"
import { cn } from "@/lib/utils"

const ICON_OPTIONS = ACCOUNT_ICON_OPTIONS.map((icon) => ({ value: icon, label: icon }))

const TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "checking", label: "Corriente" },
  { value: "savings", label: "Ahorro" },
  { value: "cash", label: "Efectivo" },
  { value: "investment", label: "Inversión" },
  { value: "business", label: "Negocio" },
]

const ACCOUNT_ORDER_STORAGE_KEY = "fintrack:accounts-order:v1"

const CURRENCY_OPTIONS: { code: Currency; label: string; flag: string }[] = [
  { code: "UYU", label: "$", flag: "🇺🇾" },
  { code: "USD", label: "US$", flag: "🇺🇸" },
  { code: "BRL", label: "R$", flag: "🇧🇷" },
  { code: "ARS", label: "AR$", flag: "🇦🇷" },
]

/** Fila de UI: cuenta sola o par UYU + hermana `Nombre USD` (onboarding / alta nacional). */
type AccountRow = { kind: "single"; account: Account } | { kind: "paired"; uyu: Account; usd: Account }

function isUsdSiblingName(name: string, currency: Currency): boolean {
  return currency === "USD" && name.trim().toLowerCase().endsWith(" usd")
}

function usdSiblingBaseName(name: string): string {
  return name.trim().slice(0, -4).trim()
}

function buildAccountRows(accountsList: Account[]): AccountRow[] {
  const used = new Set<string>()
  const rows: AccountRow[] = []

  for (const a of accountsList) {
    if (used.has(a.id)) continue

    if (isUsdSiblingName(a.name, a.currency)) {
      const base = usdSiblingBaseName(a.name)
      const uyuMatch = accountsList.find(
        (x) => !used.has(x.id) && x.currency === "UYU" && x.name.trim() === base
      )
      if (uyuMatch) {
        rows.push({ kind: "paired", uyu: uyuMatch, usd: a })
        used.add(uyuMatch.id)
        used.add(a.id)
        continue
      }
    }

    if (a.currency === "UYU") {
      const usdSibling = accountsList.find(
        (x) =>
          !used.has(x.id) &&
          x.currency === "USD" &&
          isUsdSiblingName(x.name, x.currency) &&
          usdSiblingBaseName(x.name) === a.name.trim()
      )
      if (usdSibling) {
        rows.push({ kind: "paired", uyu: a, usd: usdSibling })
        used.add(a.id)
        used.add(usdSibling.id)
        continue
      }
    }

    rows.push({ kind: "single", account: a })
    used.add(a.id)
  }

  return rows
}

function rowsToAccountsOrder(rows: AccountRow[]): Account[] {
  const out: Account[] = []
  for (const row of rows) {
    if (row.kind === "single") out.push(row.account)
    else out.push(row.uyu, row.usd)
  }
  return out
}

function pairRowKey(row: AccountRow & { kind: "paired" }): string {
  return `${row.uyu.id}:${row.usd.id}`
}

function formatAmountDecimals(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = { UYU: "$", USD: "US$", BRL: "R$", ARS: "AR$" }
  const sym = symbols[currency] ?? "$"
  const n = Math.abs(amount).toLocaleString("es-UY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amount < 0 ? `-${sym}${n}` : `${sym}${n}`
}

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
  const [newAccountPresetName, setNewAccountPresetName] = useState("BROU")
  const [newAccount, setNewAccount] = useState({
    name: "BROU",
    icon: "wallet",
    type: "checking" as AccountType,
    color: ACCOUNT_COLOR_OPTIONS[4],
    logoUrl: "/banks/brou.png" as string | null,
    localBalance: "",
    usdEnabled: false,
    usdBalance: "",
  })
  const [creatingSave, setCreatingSave] = useState(false)
  const [createError, setCreateError] = useState("")
  const [draggingRowIndex, setDraggingRowIndex] = useState<number | null>(null)
  const [cardDisplayCurrency, setCardDisplayCurrency] = useState<Record<string, "UYU" | "USD">>({})
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [ratesRefreshing, setRatesRefreshing] = useState(false)
  const [selectedTotalCurrency, setSelectedTotalCurrency] = useState<Currency>("UYU")

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

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch("/api/exchange-rates")
      const json = await res.json()
      setRates(Array.isArray(json.rates) ? json.rates : [])
    } catch {
      setRates([])
    }
  }, [])

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

  useEffect(() => {
    void fetchRates()
  }, [fetchRates])

  function formatTotalCurrency(amount: number, currency: Currency) {
    const symbols: Record<Currency, string> = {
      UYU: "$",
      USD: "US$",
      BRL: "R$",
      ARS: "AR$",
    }
    return `${symbols[currency]}${amount.toLocaleString("es-UY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  function uyuPerUnit(currency: Currency): number {
    if (currency === "UYU") return 1
    const rate = rates.find((r) => r.base_currency === "UYU" && r.target_currency === currency)
    if (!rate) return 1
    const avg = (Number(rate.buy_rate) + Number(rate.sell_rate)) / 2
    if (!avg || Number.isNaN(avg)) return 1
    return avg < 1 ? 1 / avg : avg
  }

  function convertBetween(amount: number, from: Currency, to: Currency) {
    if (from === to) return amount
    const amountInUyu = from === "UYU" ? amount : amount * uyuPerUnit(from)
    if (to === "UYU") return amountInUyu
    return amountInUyu / uyuPerUnit(to)
  }

  async function handleRefreshRates() {
    if (ratesRefreshing) return
    setRatesRefreshing(true)
    try {
      await fetch("/api/exchange-rates", { method: "POST" })
      await fetchRates()
    } finally {
      setRatesRefreshing(false)
    }
  }

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
    setNewAccountPresetName("BROU")
    setNewAccount({
      name: "BROU",
      icon: "wallet",
      type: "checking",
      color: ACCOUNT_COLOR_OPTIONS[4],
      logoUrl: "/banks/brou.png",
      localBalance: "",
      usdEnabled: false,
      usdBalance: "",
    })
    setCreateError("")
  }

  function selectPreset(option: AccountPreset) {
    setNewAccountPresetName(option.name)
    setNewAccount((prev) => ({
      ...prev,
      name: option.name === "Personalizado" ? "" : option.name,
      icon: option.icon,
      type: option.type,
      logoUrl: option.logoUrl ?? null,
    }))
  }

  async function createAccount() {
    if (!newAccount.name.trim()) {
      setCreateError("Ingresá un nombre para la cuenta.")
      return
    }

    const baseCurrency: Currency = scope === "internacional" ? "USD" : "UYU"
    const localAmount = Number.parseFloat(newAccount.localBalance || "0")
    const usdAmount = Number.parseFloat(newAccount.usdBalance || "0")
    const activePreset = presetOptions.find((option) => option.name === newAccountPresetName)
    const effectiveLogoUrl = activePreset?.name === "Personalizado" ? null : (activePreset?.logoUrl ?? newAccount.logoUrl)

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
        ...(effectiveLogoUrl ? { logo_url: effectiveLogoUrl } : {}),
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
          ...(effectiveLogoUrl ? { logo_url: effectiveLogoUrl } : {}),
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

  function moveRow(rowIndex: number, direction: "up" | "down") {
    setAccounts((prev) => {
      const rows = buildAccountRows(prev)
      const targetIndex = direction === "up" ? rowIndex - 1 : rowIndex + 1
      if (targetIndex < 0 || targetIndex >= rows.length) return prev
      const nextRows = [...rows]
      ;[nextRows[rowIndex], nextRows[targetIndex]] = [nextRows[targetIndex], nextRows[rowIndex]]
      const flat = rowsToAccountsOrder(nextRows)
      persistAccountOrder(flat)
      return flat
    })
  }

  function moveRowByDrop(fromRow: number, toRow: number) {
    if (fromRow === toRow) return
    setAccounts((prev) => {
      const rows = buildAccountRows(prev)
      if (fromRow < 0 || fromRow >= rows.length || toRow < 0 || toRow >= rows.length) return prev
      const nextRows = [...rows]
      const [moved] = nextRows.splice(fromRow, 1)
      nextRows.splice(toRow, 0, moved)
      const flat = rowsToAccountsOrder(nextRows)
      persistAccountOrder(flat)
      return flat
    })
  }

  const portfolioInUyu = accounts.reduce((sum, account) => {
    const accountAmount = Number(account.balance)
    if (Number.isNaN(accountAmount)) return sum
    return sum + convertBetween(accountAmount, account.currency, "UYU")
  }, 0)
  const selectedTotalValue = convertBetween(portfolioInUyu, "UYU", selectedTotalCurrency)
  const lastRateUpdatedAtMs = rates.reduce((latest, rate) => {
    const next = new Date(rate.fetched_at).getTime()
    return Number.isFinite(next) && next > latest ? next : latest
  }, 0)
  const lastRateUpdatedLabel = lastRateUpdatedAtMs
    ? new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(lastRateUpdatedAtMs)
      )
    : "Sin datos de cotización"

  const presetOptions = scope === "nacional" ? ONBOARDING_NACIONAL_PRESETS : INTERNACIONAL_ACCOUNT_PRESETS
  const selectedPreset = presetOptions.find((option) => option.name === newAccountPresetName)
  const accountRows = useMemo(() => buildAccountRows(accounts), [accounts])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-5 text-white">
      <h1 className="text-3xl font-black tracking-tight">Cuentas</h1>

      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/90 to-primary p-5 text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
        <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/12" />
        <div className="absolute -right-4 bottom-6 h-24 w-24 rounded-full bg-white/8" />
        <div className="relative z-10 flex items-start justify-between gap-2">
          <p className="text-sm font-semibold opacity-90">Total en todas las cuentas</p>
          <button
            type="button"
            onClick={() => void handleRefreshRates()}
            disabled={ratesRefreshing}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/30 disabled:opacity-50"
            aria-label="Actualizar cotizaciones"
            title="Actualizar cotizaciones"
          >
            <RefreshCw className={`h-4 w-4 ${ratesRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="relative z-10 mt-1 text-3xl font-bold tracking-tight">
          {formatTotalCurrency(selectedTotalValue, selectedTotalCurrency)}
        </p>
        <div className="relative z-10 mt-4 inline-flex max-w-full flex-wrap items-center gap-1 rounded-full bg-black/18 p-1">
          {CURRENCY_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => setSelectedTotalCurrency(option.code)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                selectedTotalCurrency === option.code
                  ? "bg-card/95 text-foreground"
                  : "text-primary-foreground/85 hover:bg-black/12"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <span>{option.flag}</span>
                <span>{option.label}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="relative z-10 mt-3 text-[11px] leading-relaxed opacity-85 sm:text-xs">
          {CURRENCY_OPTIONS.filter((o) => o.code !== selectedTotalCurrency)
            .map((o) => formatTotalCurrency(convertBetween(portfolioInUyu, "UYU", o.code), o.code))
            .join(" · ")}
        </p>
        <p className="relative z-10 mt-2 text-[11px] opacity-75 sm:text-xs">Cotización: {lastRateUpdatedLabel}</p>
      </div>

      {/* Cards de cuentas (par UYU + Nombre USD en una fila con pill compacta) */}
      <div className="grid grid-cols-1 gap-2">
        {accountRows.map((row, rowIndex) => {
          const rowKey = row.kind === "paired" ? pairRowKey(row) : row.account.id
          const accentColor = row.kind === "paired" ? row.uyu.color : row.account.color
          const isSelected =
            row.kind === "single"
              ? selectedAccount?.id === row.account.id
              : selectedAccount?.id === row.uyu.id || selectedAccount?.id === row.usd.id
          const pill: "UYU" | "USD" =
            row.kind === "paired" ? cardDisplayCurrency[pairRowKey(row)] ?? "UYU" : "UYU"

          const primaryForClick: Account = row.kind === "single" ? row.account : pill === "UYU" ? row.uyu : row.usd
          const avatarAccount = row.kind === "paired" ? row.uyu : row.account

          return (
            <div
              key={rowKey}
              onClick={() => void selectAccount(primaryForClick)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  void selectAccount(primaryForClick)
                }
              }}
              role="button"
              tabIndex={0}
              draggable
              onDragStart={() => setDraggingRowIndex(rowIndex)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggingRowIndex !== null) moveRowByDrop(draggingRowIndex, rowIndex)
                setDraggingRowIndex(null)
              }}
              onDragEnd={() => setDraggingRowIndex(null)}
              className={cn(
                "group relative grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-2 overflow-hidden rounded-2xl border py-2 pl-2 pr-1.5 text-left transition-all",
                isSelected ? "border-primary/70 bg-[#161a22] ring-1 ring-primary/25" : "border-white/10 bg-[#12151c] hover:border-primary/30"
              )}
            >
              <div className="h-11 w-1 shrink-0 self-center rounded-full" style={{ backgroundColor: accentColor }} />

              <div className="flex min-w-0 items-center gap-2.5">
                <AccountBrandAvatar
                  logoUrl={avatarAccount.logo_url}
                  icon={avatarAccount.icon}
                  name={avatarAccount.name}
                  className="size-9 shrink-0 rounded-xl border border-white/10 bg-primary/15"
                  iconClassName="text-primary"
                />
                <div className="min-w-0 flex-1">
                  {row.kind === "single" ? (
                    <>
                      <p className="truncate text-[15px] font-semibold tracking-tight text-white">{row.account.name}</p>
                      <p className="mt-0.5 text-base font-bold tabular-nums text-white">
                        {formatAmountDecimals(Number(row.account.balance), row.account.currency)}
                      </p>
                      <p className="text-[10px] text-zinc-500">{row.account.currency}</p>
                    </>
                  ) : (
                    <>
                      <p className="truncate text-[15px] font-semibold tracking-tight text-white">{row.uyu.name}</p>
                      <p className="mt-0.5 text-base font-bold tabular-nums text-white">
                        {pill === "UYU"
                          ? formatAmountDecimals(Number(row.uyu.balance), "UYU")
                          : formatAmountDecimals(Number(row.usd.balance), "USD")}
                      </p>
                      <p className="text-[11px] leading-snug text-zinc-500">
                        <span className="text-zinc-500">≈ </span>
                        <span className="text-zinc-400">
                          {pill === "UYU"
                            ? formatAmountDecimals(Number(row.usd.balance), "USD")
                            : formatAmountDecimals(Number(row.uyu.balance), "UYU")}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end justify-center gap-1 self-stretch py-0.5">
                <button
                  type="button"
                  onClick={(e) => startEdit(row.kind === "single" ? row.account : row.uyu, e)}
                  className="rounded-md p-1 text-white/50 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
                  aria-label={row.kind === "single" ? `Editar ${row.account.name}` : `Editar ${row.uyu.name}`}
                >
                  <Pencil className="size-3.5" />
                </button>
                {row.kind === "paired" ? (
                  <div
                    className="mt-auto flex rounded-full border border-white/10 bg-zinc-950/90 p-[3px] shadow-inner"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    role="group"
                    aria-label="Moneda principal"
                  >
                    <button
                      type="button"
                      className={cn(
                        "min-w-[30px] rounded-full px-2 py-0.5 text-[10px] font-bold leading-none transition-colors",
                        pill === "UYU" ? "bg-white/18 text-white" : "text-zinc-500 hover:text-zinc-300"
                      )}
                      onClick={() => {
                        const key = pairRowKey(row)
                        setCardDisplayCurrency((prev) => ({ ...prev, [key]: "UYU" }))
                        if (selectedAccount?.id === row.uyu.id || selectedAccount?.id === row.usd.id) {
                          void selectAccount(row.uyu)
                        }
                      }}
                    >
                      $
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "min-w-[34px] rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none transition-colors",
                        pill === "USD" ? "bg-white/18 text-white" : "text-zinc-500 hover:text-zinc-300"
                      )}
                      onClick={() => {
                        const key = pairRowKey(row)
                        setCardDisplayCurrency((prev) => ({ ...prev, [key]: "USD" }))
                        if (selectedAccount?.id === row.uyu.id || selectedAccount?.id === row.usd.id) {
                          void selectAccount(row.usd)
                        }
                      }}
                    >
                      US$
                    </button>
                  </div>
                ) : null}
                <div className="mt-auto inline-flex items-center gap-0.5 rounded-md bg-black/25 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical className="size-3 text-white/50" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveRow(rowIndex, "up")
                    }}
                    disabled={rowIndex === 0}
                    className="inline-flex size-5 items-center justify-center rounded bg-white/10 disabled:opacity-30"
                  >
                    <ArrowUp className="size-3 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveRow(rowIndex, "down")
                    }}
                    disabled={rowIndex === accountRows.length - 1}
                    className="inline-flex size-5 items-center justify-center rounded bg-white/10 disabled:opacity-30"
                  >
                    <ArrowDown className="size-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        <button
          onClick={() => {
            resetCreateForm()
            setCreating(true)
          }}
          className="rounded-3xl border border-dashed border-white/20 bg-[#111318] min-h-[120px] p-4 text-left transition-colors hover:border-primary/50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
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
                {ACCOUNT_COLOR_OPTIONS.map((c) => (
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
                      className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center"
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
            <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0d12] px-4 pb-6 pt-4 md:px-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setCreating(false)
                  setSelectorOpen(false)
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-300 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">Nueva cuenta</h2>
              <button
                onClick={createAccount}
                disabled={creatingSave}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#5DBCD2] text-black disabled:opacity-60"
              >
                {creatingSave ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-6 w-6" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-zinc-900/60 p-1">
              <button
                onClick={() => {
                  const defaultPreset = ONBOARDING_NACIONAL_PRESETS[0]
                  setScope("nacional")
                  setNewAccountPresetName(defaultPreset.name)
                  setNewAccount((prev) => ({
                    ...prev,
                    name: defaultPreset.name,
                    icon: defaultPreset.icon,
                    type: defaultPreset.type,
                    logoUrl: defaultPreset.logoUrl ?? null,
                    usdEnabled: false,
                    usdBalance: "",
                  }))
                }}
                className={`h-10 rounded-xl text-sm font-medium transition-colors ${
                  scope === "nacional" ? "bg-[#5DBCD2] text-black" : "text-zinc-400"
                }`}
              >
                Nacional
              </button>
              <button
                onClick={() => {
                  const defaultPreset = INTERNACIONAL_ACCOUNT_PRESETS[0]
                  setScope("internacional")
                  setNewAccountPresetName(defaultPreset.name)
                  setNewAccount((prev) => ({
                    ...prev,
                    name: defaultPreset.name,
                    icon: defaultPreset.icon,
                    type: defaultPreset.type,
                    logoUrl: defaultPreset.logoUrl ?? null,
                    usdEnabled: false,
                    usdBalance: "",
                  }))
                }}
                className={`h-10 rounded-xl text-sm font-medium transition-colors ${
                  scope === "internacional" ? "bg-[#5DBCD2] text-black" : "text-zinc-400"
                }`}
              >
                Internacional
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <button
                onClick={() => setSelectorOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/50 p-3"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
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

              <div className="flex h-14 items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/50 px-3">
                <Input
                  value={newAccount.name}
                  onChange={(e) => setNewAccount((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre de la cuenta"
                  className="border-0 bg-transparent text-white shadow-none focus-visible:ring-0"
                />
                <button
                  onClick={() => setSelectorOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/50 px-4">
                <span className="font-semibold text-zinc-400">{scope === "internacional" ? "$" : "UYU"}</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAccount.localBalance}
                  onChange={(e) => setNewAccount((prev) => ({ ...prev, localBalance: e.target.value }))}
                  placeholder={scope === "internacional" ? "Saldo inicial en dólares (opcional)" : "Saldo inicial en pesos uruguayos (opcional)"}
                  className="border-0 bg-transparent text-white shadow-none focus-visible:ring-0"
                />
              </div>

              {scope === "nacional" && (
                <>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-4">
                    <div>
                      <p className="font-semibold">Cuenta en dólares</p>
                      <p className="text-zinc-400">Activar saldo en dólares para esta cuenta</p>
                    </div>
                    <button
                      onClick={() => setNewAccount((prev) => ({ ...prev, usdEnabled: !prev.usdEnabled }))}
                      className={`h-7 w-12 rounded-full p-1 transition-colors ${newAccount.usdEnabled ? "bg-[#5DBCD2]" : "bg-zinc-700"}`}
                    >
                      <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${newAccount.usdEnabled ? "translate-x-5" : ""}`} />
                    </button>
                  </div>

                  {newAccount.usdEnabled && (
                    <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/50 px-4">
                      <span className="font-semibold text-zinc-400">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newAccount.usdBalance}
                        onChange={(e) => setNewAccount((prev) => ({ ...prev, usdBalance: e.target.value }))}
                        placeholder="Saldo inicial en dólares (opcional)"
                        className="border-0 bg-transparent text-white shadow-none focus-visible:ring-0"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {ACCOUNT_COLOR_OPTIONS.map((c) => (
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
                className="fixed inset-0 z-55 bg-black/60"
                aria-label="Cerrar selector"
              />
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                <div className="w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0d12] px-4 pb-6 pt-4 md:px-6">
                  <h3 className="text-2xl font-semibold mb-4">
                    {scope === "nacional" ? "Seleccionar banco uruguayo" : "Seleccionar wallet internacional"}
                  </h3>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {presetOptions.map((option) => (
                      <button
                        key={option.name}
                        onClick={() => selectPreset(option)}
                        className={`w-full rounded-2xl px-3 py-3 border flex items-center justify-between transition-colors ${
                          newAccountPresetName === option.name
                            ? "border-[#5DBCD2] bg-[#5DBCD2]/12"
                            : "border-white/10 hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <AccountBrandAvatar
                            logoUrl={option.logoUrl}
                            icon={option.icon}
                            name={option.name}
                            className="h-9 w-9 shrink-0 rounded-lg bg-white/8"
                            iconClassName="text-zinc-300"
                          />
                          <span className="font-medium truncate">{option.name}</span>
                        </span>
                        {newAccountPresetName === option.name && (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#5DBCD2] text-black">
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
