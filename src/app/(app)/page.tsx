"use client"

import { useEffect, useState, useCallback } from "react"
import { AccountCards } from "@/components/dashboard/account-cards"
import { CashFlow } from "@/components/dashboard/cash-flow"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { BalanceTrend } from "@/components/dashboard/balance-trend"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Account, Transaction } from "@/types/database"
import type { DateRange } from "react-day-picker"

interface DashboardData {
  accounts: Account[]
  transactions: Transaction[]
  cashFlow: { income: number; expenses: number }
  expensesByCategory: { name: string; value: number; color: string }[]
  balanceTrend: { date: string; balance: number }[]
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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header + selector de período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={period === "this_month" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("this_month")}
          >
            Este mes
          </Button>
          <Button
            variant={period === "last_month" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("last_month")}
          >
            Mes anterior
          </Button>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger
              className={`inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium h-8 px-3 transition-colors ${
                period === "custom"
                  ? "bg-primary text-primary-foreground"
                  : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {period === "custom" && dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "dd/MM")} — ${format(dateRange.to, "dd/MM")}`
                : "Custom"}
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

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {/* Account cards */}
          <AccountCards accounts={data.accounts} />

          {/* Métricas clave */}
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="Ingresos"
              value={data.cashFlow.income}
              color="text-emerald-500"
              prefix="+"
            />
            <MetricCard
              label="Gastos"
              value={data.cashFlow.expenses}
              color="text-red-500"
              prefix="-"
            />
            <MetricCard
              label="Flujo neto"
              value={Math.abs(net)}
              color={net >= 0 ? "text-emerald-500" : "text-red-500"}
              prefix={net >= 0 ? "+" : "-"}
            />
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-2 gap-4">
            <BalanceTrend data={data.balanceTrend} />
            <ExpenseChart data={data.expensesByCategory} />
          </div>

          {/* Recent transactions */}
          <RecentTransactions transactions={data.transactions} />
        </>
      ) : null}
    </div>
  )
}

function MetricCard({
  label,
  value,
  color,
  prefix,
}: {
  label: string
  value: number
  color: string
  prefix: string
}) {
  const formatted = value.toLocaleString("es-UY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>
        {prefix}${formatted}
      </p>
    </div>
  )
}
