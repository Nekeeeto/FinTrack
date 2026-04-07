"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getIcon } from "@/lib/icons"
import { formatMoney, formatDate } from "@/lib/format"
import type { Transaction } from "@/types/database"

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Últimas transacciones
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground">No hay transacciones todavía</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Últimas transacciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((tx) => {
          const Icon = getIcon(tx.category?.icon || "tag")
          const isIncome = tx.category?.type === "income"
          return (
            <div key={tx.id} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: (tx.category?.color || "#6b7280") + "20" }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: tx.category?.color || "#6b7280" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium truncate">
                    {tx.description || tx.category?.name}
                  </p>
                  <SourceBadge source={tx.source} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(tx.date)} · {tx.account?.name}
                </p>
              </div>
              <span
                className={`text-sm font-semibold flex-shrink-0 ${
                  isIncome ? "text-emerald-500" : "text-foreground"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatMoney(Math.abs(tx.amount), tx.currency)}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function SourceBadge({ source }: { source: string }) {
  if (source === "telegram") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500 flex-shrink-0">
        Telegram
      </span>
    )
  }
  if (source === "import") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 flex-shrink-0">
        Import
      </span>
    )
  }
  // "manual" — no badge, es el default
  return null
}
