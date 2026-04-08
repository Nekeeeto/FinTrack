"use client"

import { Card } from "@/components/ui/card"
import { getIcon } from "@/lib/icons"
import { formatMoney } from "@/lib/format"
import type { Account } from "@/types/database"

function balanceSizeClass(text: string): string {
  const len = text.length
  if (len > 12) return "text-base"
  if (len > 9) return "text-lg"
  return "text-2xl"
}

export function AccountCards({ accounts }: { accounts: Account[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
      {accounts.map((account) => {
        const Icon = getIcon(account.icon)
        const formatted = formatMoney(account.balance, account.currency)
        return (
          <Card
            key={account.id}
            className="relative overflow-hidden p-5 border-0 flex-shrink-0 w-[70vw] md:w-auto snap-center rounded-2xl"
            style={{ backgroundColor: account.color }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white/80 uppercase tracking-wider truncate">
                  {account.name}
                </span>
              </div>
              <p className={`${balanceSizeClass(formatted)} font-bold text-white truncate`}>
                {formatted}
              </p>
              <p className="text-xs text-white/50 mt-1 font-medium">{account.currency}</p>
            </div>
            {/* Decorative circle */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
            <div className="absolute -right-2 -bottom-8 h-20 w-20 rounded-full bg-white/5" />
          </Card>
        )
      })}
    </div>
  )
}
