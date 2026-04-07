"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react"
import { formatMoney } from "@/lib/format"

interface CashFlowProps {
  income: number
  expenses: number
}

export function CashFlow({ income, expenses }: CashFlowProps) {
  const net = income - expenses

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Flujo de efectivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Ingresos</span>
          </div>
          <span className="text-sm font-semibold text-emerald-500">
            +{formatMoney(income)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Gastos</span>
          </div>
          <span className="text-sm font-semibold text-red-500">
            -{formatMoney(expenses)}
          </span>
        </div>
        <div className="border-t border-border pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Neto</span>
          </div>
          <span className={`text-sm font-bold ${net >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {formatMoney(net)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
