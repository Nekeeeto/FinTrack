"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { AccountCards } from "@/components/dashboard/account-cards"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { BalanceTrend } from "@/components/dashboard/balance-trend"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { MonthlyFlow } from "@/components/dashboard/monthly-flow"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { ExchangeRatesWidget } from "@/components/dashboard/exchange-rates-widget"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Account, Transaction } from "@/types/database"
import type { DateRange } from "react-day-picker"
import Link from "next/link"

interface DashboardData {
  accounts: Account[]
  transactions: Transaction[]
  cashFlow: { income: number; expenses: number }
  expensesByCategory: { name: string; value: number; color: string }[]
  balanceTrend: { date: string; balance: number }[]
  monthlyFlow: { month: string; label: string; income: number; expenses: number; net: number }[]
  budgetProgress: { id: string; category_id: string; category_name: string; category_color: string; limit: number; spent: number; percentage: number }[]
}

type PeriodOption = "this_month" | "last_month" | "custom"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodOption>("this_month")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    let url = "/api/dashboard?period="

    if (period === "custom" && dateRange?.from && dateRange?.to) {
      const from = format(dateRange.from, "yyyy-MM-dd")
      const to = format(dateRange.to, "yyyy-MM-dd")
      url += `custom&from=${from}&to=${to}`
    } else {
      url += period
    }

    const res = await fetch(url)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [period, dateRange])

  useEffect(() => {
    if (period !== "custom" || (dateRange?.from && dateRange?.to)) {
      fetchData()
    }
  }, [period, fetchData, dateRange])

  function handleSelectRange(range: DateRange | undefined) {
    setDateRange(range)
    if (range?.from && range?.to) {
      setPeriod("custom")
      setCalendarOpen(false)
    }
  }

  const net = data ? data.cashFlow.income - data.cashFlow.expenses : 0
  const totalBalance = data
    ? data.accounts.reduce((sum, a) => sum + a.balance, 0)
    : 0

  const periodLabel = period === "this_month"
    ? format(new Date(), "MMMM yyyy", { locale: es })
    : period === "last_month"
      ? format(new Date(new Date().getFullYear(), new Date().getMonth() - 1), "MMMM yyyy", { locale: es })
      : dateRange?.from && dateRange?.to
        ? `${format(dateRange.from, "dd/MM")} — ${format(dateRange.to, "dd/MM")}`
        : ""

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header con saludo + balance total */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg md:text-xl font-medium text-muted-foreground">Balance total</h1>
          {/* Period pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPeriod("this_month")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                period === "this_month"
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Este mes
            </button>
            <button
              onClick={() => setPeriod("last_month")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                period === "last_month"
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Anterior
            </button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  period === "custom"
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <CalendarIcon className="h-3 w-3" />
                {period === "custom" && dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "dd/MM")} — ${format(dateRange.to, "dd/MM")}`
                  : "Rango"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleSelectRange}
                  locale={es}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <p className="text-3xl md:text-4xl font-bold tracking-tight">
          ${totalBalance.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5 capitalize">{periodLabel}</p>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {/* Ingresos / Gastos - cards estilo glassmorphism */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-500/70 uppercase tracking-wider">Ingresos</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-emerald-500 truncate">
                +${data.cashFlow.income.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-500/70 uppercase tracking-wider">Gastos</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-red-500 truncate">
                -${data.cashFlow.expenses.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Account cards - horizontal scroll en mobile */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Mis cuentas</h2>
              <Link href="/cuentas" className="text-xs text-emerald-500 font-medium flex items-center gap-0.5 hover:underline">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <AccountCards accounts={data.accounts} />
          </div>

          {/* Budget progress */}
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

          {/* Cotizaciones */}
          <ExchangeRatesWidget />

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <BalanceTrend data={data.balanceTrend} />
            <ExpenseChart data={data.expensesByCategory} />
          </div>

          {/* Monthly flow chart */}
          {data.monthlyFlow && (
            <MonthlyFlow data={data.monthlyFlow} />
          )}

          {/* Recent transactions */}
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
  )
}
