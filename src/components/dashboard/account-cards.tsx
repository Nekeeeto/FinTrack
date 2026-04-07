"use client"

import { Card } from "@/components/ui/card"
import { getIcon } from "@/lib/icons"
import { formatMoney } from "@/lib/format"
import type { Account } from "@/types/database"

export function AccountCards({ accounts }: { accounts: Account[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {accounts.map((account) => {
        const Icon = getIcon(account.icon)
        return (
          <Card
            key={account.id}
            className="relative overflow-hidden p-4 border-0"
            style={{ backgroundColor: account.color }}
          >
            <div className="relative z-10">
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
            </div>
          </Card>
        )
      })}
    </div>
  )
}
