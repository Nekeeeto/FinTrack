"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AccountBrandAvatar } from "@/components/accounts/account-brand-avatar"
import { formatMoney } from "@/lib/format"
import type { Account } from "@/types/database"
import { Palette } from "lucide-react"

const PRESET_COLORS = [
  "#b2bcc9",
  "#ef4444",
  "#f97316",
  "#fb923c",
  "#facc15",
  "#a3e635",
  "#4ade80",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#1a1a1a",
]

function balanceSizeClass(text: string): string {
  const len = text.length
  if (len > 12) return "text-base"
  if (len > 9) return "text-lg"
  return "text-2xl"
}

export function AccountCards({
  accounts,
  onAccountsChange,
}: {
  accounts: Account[]
  onAccountsChange?: (next: Account[]) => void
}) {
  const [savingId, setSavingId] = useState<string | null>(null)

  async function applyColor(account: Account, color: string) {
    if (color === account.color) return
    const prev = accounts
    onAccountsChange?.(prev.map((a) => (a.id === account.id ? { ...a, color } : a)))
    setSavingId(account.id)
    try {
      const res = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id, color }),
      })
      if (!res.ok) {
        onAccountsChange?.(prev)
        return
      }
      const updated = (await res.json()) as Account
      onAccountsChange?.(prev.map((a) => (a.id === updated.id ? updated : a)))
    } catch {
      onAccountsChange?.(prev)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
      {accounts.map((account) => {
        const formatted = formatMoney(account.balance, account.currency)
        return (
          <Card
            key={account.id}
            className="relative overflow-hidden p-5 border-0 shrink-0 w-[70vw] md:w-auto snap-center rounded-2xl"
            style={{ backgroundColor: account.color }}
          >
            <div className="absolute top-2 right-2 z-20">
              <Popover>
                <PopoverTrigger
                  type="button"
                  className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/35 inline-flex items-center justify-center text-white/90 transition-colors disabled:opacity-50"
                  title="Color de la cuenta"
                  aria-label={`Cambiar color de ${account.name}`}
                  disabled={savingId === account.id}
                >
                  <Palette className="h-4 w-4" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-3" sideOffset={8}>
                  <p className="text-xs text-muted-foreground mb-2">Color</p>
                  <div className="flex flex-wrap gap-2 max-w-[220px]">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => void applyColor(account, c)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${
                          account.color.toLowerCase() === c.toLowerCase()
                            ? "border-white scale-110 ring-2 ring-white/40"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Usar color ${c}`}
                      />
                    ))}
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <span>Otro</span>
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(account.color) ? account.color : "#1a1a1a"}
                      onChange={(e) => void applyColor(account, e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                  </label>
                </PopoverContent>
              </Popover>
            </div>
            <div className="relative z-10 pr-10">
              <div className="flex items-center gap-2 mb-3 min-w-0">
                <AccountBrandAvatar
                  logoUrl={account.logo_url}
                  icon={account.icon}
                  name={account.name}
                  className="h-8 w-8"
                  iconClassName="text-white"
                />
                <span className="text-sm font-medium text-white/80 uppercase tracking-wider truncate">
                  {account.name}
                </span>
              </div>
              <p className={`${balanceSizeClass(formatted)} font-bold text-white truncate`}>
                {formatted}
              </p>
              <p className="text-xs text-white/50 mt-1 font-medium">{account.currency}</p>
            </div>
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
            <div className="absolute -right-2 -bottom-8 h-20 w-20 rounded-full bg-white/5" />
          </Card>
        )
      })}
    </div>
  )
}
