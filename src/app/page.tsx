"use client"

import { useEffect, useState } from "react"
import { AccountCards } from "@/components/dashboard/account-cards"
import { CashFlow } from "@/components/dashboard/cash-flow"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { BalanceTrend } from "@/components/dashboard/balance-trend"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Button } from "@/components/ui/button"
import type { Account, Transaction } from "@/types/database"

interface DashboardData {
  accounts: Account[]
  transactions: Transaction[]
  cashFlow: { income: number; expenses: number }
  expensesByCategory: { name: string; value: number; color: string }[]
  balanceTrend: { date: string; balance: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [period, setPeriod] = useState<"this_month" | "last_month">("this_month")

  useEffect(() => {
    fetch(`/api/dashboard?period=${period}`)
      .then((res) => res.json())
      .then(setData)
  }, [period])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Account cards */}
      <AccountCards accounts={data.accounts} />

      {/* Widgets row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CashFlow income={data.cashFlow.income} expenses={data.cashFlow.expenses} />
        <ExpenseChart data={data.expensesByCategory} />
        <BalanceTrend data={data.balanceTrend} />
      </div>

      {/* Recent transactions */}
      <RecentTransactions transactions={data.transactions} />
    </div>
  )
}
