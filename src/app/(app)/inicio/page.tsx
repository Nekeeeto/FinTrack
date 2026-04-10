"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { AccountCards } from "@/components/dashboard/account-cards"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { BalanceTrend } from "@/components/dashboard/balance-trend"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { MonthlyFlow } from "@/components/dashboard/monthly-flow"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { ExchangeRatesWidget } from "@/components/dashboard/exchange-rates-widget"
import {
  DashboardPeriodFilter,
  buildDashboardQuery,
  type DashboardPeriodState,
} from "@/components/dashboard/dashboard-period-filter"
import { cn } from "@/lib/utils"
import { Loader2, ArrowRight, Rocket, CircleCheck, Circle, Sparkles, HelpCircle, MessageCircle, Eye, EyeOff, ArrowUp, ArrowDown, ChevronRight, Calculator, Settings2, Share2, ArrowLeftRight, RefreshCw } from "lucide-react"
import type { Account, Transaction, Currency, ExchangeRate } from "@/types/database"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface DashboardData {
  accounts: Account[]
  transactions: Transaction[]
  cashFlow: { income: number; expenses: number }
  expensesByCategory: { name: string; value: number; color: string }[]
  balanceTrend: { date: string; balance: number }[]
  monthlyFlow: { month: string; label: string; income: number; expenses: number; net: number }[]
  budgetProgress: { id: string; category_id: string; category_name: string; category_color: string; limit: number; spent: number; percentage: number }[]
  range?: { from: string; to: string }
}

type FirstStepsBaseline = {
  accounts: number
  categories: number
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState({ categories: 0, transactions: 0 })
  const [stepsOpen, setStepsOpen] = useState(false)
  const [hideAmounts, setHideAmounts] = useState(false)
  const [selectedBalanceCurrency, setSelectedBalanceCurrency] = useState<Currency>("UYU")
  const [widgetOpen, setWidgetOpen] = useState<"converter" | null>(null)
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [ratesRefreshing, setRatesRefreshing] = useState(false)
  const [convertAmount, setConvertAmount] = useState("1000")
  const [convertFrom, setConvertFrom] = useState<Currency>("UYU")
  const [convertTo, setConvertTo] = useState<Currency>("USD")
  const [firstStepsBaseline, setFirstStepsBaseline] = useState<FirstStepsBaseline | null>(null)
  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriodState>({
    kind: "preset",
    id: "this_month",
  })
  const [dashboardRefreshing, setDashboardRefreshing] = useState(false)
  const dashboardBootDone = useRef(false)

  const currencyOptions: { code: Currency; label: string; flag: string }[] = [
    { code: "UYU", label: "$", flag: "🇺🇾" },
    { code: "USD", label: "US$", flag: "🇺🇸" },
    { code: "BRL", label: "R$", flag: "🇧🇷" },
    { code: "ARS", label: "AR$", flag: "🇦🇷" },
  ]

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!dashboardBootDone.current) {
        setLoading(true)
      } else {
        setDashboardRefreshing(true)
      }

      try {
        const qs = buildDashboardQuery(dashboardPeriod)
        const [dashboardRes, categoriesRes, txRes] = await Promise.all([
          fetch(`/api/dashboard?${qs}`),
          fetch("/api/categories?flat=true"),
          fetch("/api/transactions?limit=1"),
        ])

        if (cancelled) return

        const dashboardJson = (await dashboardRes.json()) as DashboardData
        setData(dashboardJson)

        if (!dashboardBootDone.current) {
          const categoriesJson = await categoriesRes.json()
          const txJson = await txRes.json()
          setSetup({
            categories: Array.isArray(categoriesJson) ? categoriesJson.length : 0,
            transactions: typeof txJson?.total === "number" ? txJson.total : 0,
          })
          dashboardBootDone.current = true
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setDashboardRefreshing(false)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [dashboardPeriod])

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
    void fetchRates()
  }, [fetchRates])

  useEffect(() => {
    if (!profile?.user_id || !data) return

    const storageKey = `fintrack:first-steps-baseline:${profile.user_id}`
    const fallback: FirstStepsBaseline = profile.onboarding_completed
      ? { accounts: data.accounts.length, categories: setup.categories }
      : { accounts: 0, categories: 0 }

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        window.localStorage.setItem(storageKey, JSON.stringify(fallback))
        setFirstStepsBaseline(fallback)
        return
      }

      const parsed = JSON.parse(raw) as Partial<FirstStepsBaseline>
      const baseline: FirstStepsBaseline = {
        accounts: Number.isFinite(parsed.accounts) ? Number(parsed.accounts) : fallback.accounts,
        categories: Number.isFinite(parsed.categories) ? Number(parsed.categories) : fallback.categories,
      }
      setFirstStepsBaseline(baseline)
    } catch {
      setFirstStepsBaseline(fallback)
    }
  }, [profile?.user_id, profile?.onboarding_completed, data, setup.categories])

  const displayName = profile?.name?.split(" ")[0] || "Hola"

  const accountDone = firstStepsBaseline
    ? (data?.accounts.length ?? 0) > firstStepsBaseline.accounts
    : !profile?.onboarding_completed && (data?.accounts.length ?? 0) > 0

  const categoryDone = firstStepsBaseline
    ? setup.categories > firstStepsBaseline.categories
    : !profile?.onboarding_completed && setup.categories > 0

  const firstSteps = [
    { id: "account", label: "Crear una cuenta", subtitle: "Agregá tu banco o billetera", done: accountDone, href: "/cuentas" },
    { id: "category", label: "Crear una categoría", subtitle: "Organizá tus gastos e ingresos", done: categoryDone, href: "/categorias" },
    { id: "tx", label: "Crear un movimiento", subtitle: "Registrá tu primer gasto o ingreso", done: setup.transactions > 0, href: "/transacciones?new=1" },
  ] as const
  const doneCount = firstSteps.filter((step) => step.done).length
  const progressPercentage = (doneCount / firstSteps.length) * 100

  function formatCurrency(amount: number, currency: Currency) {
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

  function formatCardAmount(amount: number) {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
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

  const portfolioInUyu = (data?.accounts ?? []).reduce((sum, account) => {
    const accountAmount = Number(account.balance)
    if (Number.isNaN(accountAmount)) return sum
    return sum + convertBetween(accountAmount, account.currency, "UYU")
  }, 0)
  const selectedBalanceValue = convertBetween(portfolioInUyu, "UYU", selectedBalanceCurrency)

  const parsedAmount = Number.parseFloat(convertAmount || "0")
  const convertedAmount = Number.isNaN(parsedAmount) ? 0 : convertBetween(parsedAmount, convertFrom, convertTo)
  const lastRateUpdatedAtMs = rates.reduce((latest, rate) => {
    const next = new Date(rate.fetched_at).getTime()
    return Number.isFinite(next) && next > latest ? next : latest
  }, 0)
  const lastRateUpdatedLabel = lastRateUpdatedAtMs
    ? new Intl.DateTimeFormat("es-UY", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(lastRateUpdatedAtMs))
    : "Sin datos de cotización"

  async function handleShareConversion() {
    const message = `${formatCurrency(parsedAmount, convertFrom)} = ${formatCurrency(convertedAmount, convertTo)}`
    if (navigator.share) {
      await navigator.share({ text: message })
      return
    }
    await navigator.clipboard.writeText(message)
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

  return (
    <>
      <div className="space-y-5 max-w-6xl">
        <div className="hidden md:flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hola,</p>
            <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 min-w-0 flex-1">
            <span className="h-9 w-9 rounded-full bg-primary/20 text-primary inline-flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-lg font-medium truncate min-w-0">NACIONAL NACIONAL</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <button className="h-8 w-8 rounded-full hover:bg-accent inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-full hover:bg-accent inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="h-4 w-4" />
            </button>
          </span>
        </div>

        {doneCount < firstSteps.length && (
          <button
            onClick={() => setStepsOpen(true)}
            className="relative w-full overflow-hidden rounded-2xl border border-emerald-500/25 bg-card hover:border-emerald-500/40 transition-colors"
          >
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 opacity-40 transition-all duration-700"
              style={{
                width: `${progressPercentage}%`,
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
              }}
            />
            <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3 px-4 py-3">
              <span className="flex min-w-0 flex-1 items-center gap-2 text-left text-white">
                <Rocket className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug sm:text-base">
                    Completá los primeros pasos
                  </span>
                  <span className="block text-[11px] text-white/80 sm:text-xs">
                    {doneCount} de {firstSteps.length} completados
                  </span>
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-sm font-bold text-white">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                {doneCount}/{firstSteps.length}
              </span>
            </div>
          </button>
        )}

        <div className="rounded-3xl bg-linear-to-br from-emerald-400 to-emerald-500 p-5 md:p-6 text-black relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
          <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/12" />
          <div className="absolute -right-4 bottom-8 h-24 w-24 rounded-full bg-white/8" />
          <p className="text-2xl font-semibold mb-2 relative z-10">Tu Balance</p>
          <p className="text-4xl md:text-5xl font-bold tracking-tight relative z-10">
            {hideAmounts ? `${currencyOptions.find((option) => option.code === selectedBalanceCurrency)?.label ?? "$"} •••••` : formatCurrency(selectedBalanceValue, selectedBalanceCurrency)}
          </p>
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 sm:right-4 sm:top-4">
            <DashboardPeriodFilter
              period={dashboardPeriod}
              onPeriodChange={setDashboardPeriod}
              disabled={loading && !data}
            />
            <button
              type="button"
              onClick={() => setHideAmounts((prev) => !prev)}
              className="h-9 w-9 rounded-full bg-black/20 hover:bg-black/30 inline-flex items-center justify-center transition-colors"
              aria-label={hideAmounts ? "Mostrar montos" : "Ocultar montos"}
            >
              {hideAmounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative z-10 mt-4 inline-flex items-center rounded-full bg-black/18 p-1 gap-1 max-w-full overflow-x-auto">
            {currencyOptions.map((option) => (
              <button
                key={option.code}
                onClick={() => setSelectedBalanceCurrency(option.code)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  selectedBalanceCurrency === option.code
                    ? "bg-card/95 text-foreground"
                    : "text-black/80 hover:bg-black/12"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{option.flag}</span>
                  <span>{option.label}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="relative z-10 mt-2 text-sm opacity-80">
            {selectedBalanceCurrency === "UYU"
              ? "Patrimonio total en cuentas · convertido a pesos uruguayos"
              : `Patrimonio total en cuentas · conversión a ${selectedBalanceCurrency}`}
          </p>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            <div className={cn("relative grid grid-cols-2 gap-3", dashboardRefreshing && "opacity-55")}>
              {dashboardRefreshing && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/30">
                  <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                </div>
              )}
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="border-l-4 border-emerald-500 h-full p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-500 inline-flex items-center justify-center">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-base font-semibold">Ingresos</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-2xl md:text-3xl font-bold text-foreground truncate">
                    {hideAmounts
                      ? "$ •••••"
                      : `$${formatCardAmount(data.cashFlow.income)}`}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="border-l-4 border-red-500 h-full p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-red-500/15 text-red-500 inline-flex items-center justify-center">
                        <ArrowDown className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-base font-semibold">Gastos</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-2xl md:text-3xl font-bold text-foreground truncate">
                    {hideAmounts
                      ? "$ •••••"
                      : `$${formatCardAmount(data.cashFlow.expenses)}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold">Accesos rápidos</h3>
              <div className="relative flex items-start gap-4">
                {widgetOpen === "converter" && (
                  <button
                    onClick={() => setWidgetOpen(null)}
                    className="fixed inset-0 z-[45] bg-transparent"
                    aria-label="Cerrar widgets"
                  />
                )}
                <div className="relative">
                  {widgetOpen === "converter" && (
                    <div className="fixed inset-x-3 bottom-24 z-50 rounded-2xl border border-border bg-card/95 backdrop-blur p-4 space-y-4 shadow-[0_16px_38px_rgba(0,0,0,0.5)] md:absolute md:inset-x-auto md:left-0 md:bottom-full md:mb-3 md:w-[min(420px,calc(100vw-2rem))] md:z-40">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">Calculadora</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRefreshRates}
                            className="h-9 w-9 rounded-full border border-border inline-flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50"
                            title="Actualizar cotización"
                            disabled={ratesRefreshing}
                          >
                            <RefreshCw className={`h-4 w-4 ${ratesRefreshing ? "animate-spin" : ""}`} />
                          </button>
                          <button
                            onClick={handleShareConversion}
                            className="h-9 w-9 rounded-full border border-border inline-flex items-center justify-center hover:bg-accent transition-colors"
                            title="Compartir conversión"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Desde</p>
                          <select
                            value={convertFrom}
                            onChange={(e) => setConvertFrom(e.target.value as Currency)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-base font-semibold"
                          >
                            {currencyOptions.map((option) => (
                              <option key={option.code} value={option.code}>
                                {option.flag} {option.code}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => {
                            const from = convertFrom
                            const to = convertTo
                            setConvertFrom(to)
                            setConvertTo(from)
                          }}
                          className="mb-1 h-10 w-10 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center hover:opacity-90 transition-opacity"
                          title="Invertir monedas"
                        >
                          <ArrowLeftRight className="h-4 w-4" />
                        </button>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">A</p>
                          <select
                            value={convertTo}
                            onChange={(e) => setConvertTo(e.target.value as Currency)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-base font-semibold"
                          >
                            {currencyOptions.map((option) => (
                              <option key={option.code} value={option.code}>
                                {option.flag} {option.code}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-background/70 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground mb-1">Monto</p>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={convertAmount}
                          onChange={(e) => setConvertAmount(e.target.value)}
                          className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none"
                        />
                      </div>

                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3">
                        <p className="text-xs text-muted-foreground">Resultado</p>
                        <p className="text-2xl font-bold">{formatCurrency(convertedAmount, convertTo)}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Cotización actualizada: {lastRateUpdatedLabel}</span>
                        <span className="text-emerald-500 font-medium">Tiempo real</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setWidgetOpen((prev) => (prev === "converter" ? null : "converter"))}
                    className="w-24 shrink-0 flex flex-col items-center gap-2 transition-transform active:scale-95"
                  >
                    <span
                      className={`h-20 w-20 rounded-full inline-flex items-center justify-center transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_24px_rgba(0,0,0,0.45)] ${
                        widgetOpen === "converter"
                          ? "bg-primary/18 border border-primary/35 text-primary"
                          : "bg-card/90 border border-white/10 text-foreground"
                      }`}
                    >
                      <Calculator className="h-5 w-5" />
                    </span>
                    <span className="text-xs text-center">Calculadora</span>
                  </button>
                </div>
                <button className="w-24 shrink-0 flex flex-col items-center gap-2 text-muted-foreground/85 opacity-80">
                  <span className="h-20 w-20 rounded-full inline-flex items-center justify-center bg-card/50 border border-dashed border-border/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <Settings2 className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] text-center leading-tight">Más Widgets</span>
                </button>
                <div className="flex-1" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Mis cuentas</h2>
                <Link href="/cuentas" className="text-xs text-emerald-500 font-medium flex items-center gap-0.5 hover:underline">
                  Ver todas <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <AccountCards
                accounts={data.accounts}
                onAccountsChange={(next) =>
                  setData((d) => (d ? { ...d, accounts: next } : d))
                }
              />
            </div>

            {data.budgetProgress && data.budgetProgress.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Presupuestos</h2>
                  <Link href="/presupuestos" className="text-xs text-emerald-500 font-medium flex items-center gap-0.5 hover:underline">
                    Ver todos <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <BudgetProgress data={data.budgetProgress} />
              </div>
            )}

            <ExchangeRatesWidget />

            <div className="grid md:grid-cols-2 gap-4">
              <BalanceTrend data={data.balanceTrend} />
              <ExpenseChart data={data.expensesByCategory} />
            </div>

            {data.monthlyFlow && (
              <MonthlyFlow data={data.monthlyFlow} />
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Últimos movimientos</h2>
                <Link href="/transacciones" className="text-xs text-emerald-500 font-medium flex items-center gap-0.5 hover:underline">
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <RecentTransactions transactions={data.transactions} />
            </div>
          </>
        ) : null}
      </div>

      {stepsOpen && doneCount < firstSteps.length && (
        <>
          <button
            onClick={() => setStepsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60"
            aria-label="Cerrar primeros pasos"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-border/60 bg-card px-5 pb-6 pt-3 md:left-1/2 md:max-w-xl md:-translate-x-1/2">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-muted-foreground/30" />
            <h3 className="text-2xl font-semibold">Primeros pasos</h3>
            <p className="mt-1 text-muted-foreground">
              Completá estos pasos y dejá de llevar la plata a ojo, bo.
            </p>
            <div className="mt-5 space-y-2">
              {firstSteps.map((step) => (
                <Link
                  key={step.id}
                  href={step.href}
                  onClick={() => setStepsOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-border p-3 hover:bg-accent/60 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    {step.done ? (
                      <CircleCheck className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>
                      <span className={`block font-medium ${step.done ? "line-through text-muted-foreground" : ""}`}>{step.label}</span>
                      <span className="block text-sm text-muted-foreground">{step.subtitle}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
