"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

interface BudgetItem {
  id: string
  category_id: string
  category_name: string
  category_color: string
  limit: number
  spent: number
  percentage: number
}

export function BudgetProgress({ data }: { data: BudgetItem[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Presupuestos
            </CardTitle>
            <Link
              href="/presupuestos"
              className="text-xs text-emerald-500 hover:underline"
            >
              Configurar
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-24">
          <p className="text-sm text-muted-foreground">Sin presupuestos configurados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Presupuestos del mes
          </CardTitle>
          <Link
            href="/presupuestos"
            className="text-xs text-emerald-500 hover:underline"
          >
            Ver todos
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const isOver = item.percentage >= 100
          const isWarning = item.percentage >= 80 && item.percentage < 100
          const barColor = isOver
            ? "bg-red-500"
            : isWarning
            ? "bg-amber-500"
            : "bg-emerald-500"

          return (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.category_color }}
                  />
                  <span className="text-sm font-medium">{item.category_name}</span>
                  {isOver && (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatMoney(item.spent)} / {formatMoney(item.limit)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-end">
                <span
                  className={`text-xs font-medium ${
                    isOver
                      ? "text-red-500"
                      : isWarning
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
