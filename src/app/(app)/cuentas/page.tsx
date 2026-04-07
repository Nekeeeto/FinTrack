"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { getIcon } from "@/lib/icons"
import { formatMoney, formatDate } from "@/lib/format"
import type { Account, Transaction } from "@/types/database"

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTx, setLoadingTx] = useState(false)

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data ?? [])
        setLoading(false)
      })
  }, [])

  async function selectAccount(account: Account) {
    setSelectedAccount(account)
    setLoadingTx(true)
    const res = await fetch(`/api/transactions?account_id=${account.id}&limit=50`)
    const data = await res.json()
    setTransactions(data.data ?? [])
    setLoadingTx(false)
  }

  // Agrupar cuentas por moneda
  const currencies = ["UYU", "USD", "BRL", "ARS"] as const
  const totalsByCurrency = currencies.reduce((acc, cur) => {
    const filtered = accounts.filter((a) => a.currency === cur)
    acc[cur] = filtered.reduce((sum, a) => sum + Number(a.balance), 0)
    return acc
  }, {} as Record<string, number>)
  // Solo mostrar monedas que tengan al menos una cuenta
  const activeCurrencies = currencies.filter((cur) =>
    accounts.some((a) => a.currency === cur) || totalsByCurrency[cur] !== 0
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Cuentas</h1>

      {/* Totales por moneda */}
      <div className={`grid gap-3 ${activeCurrencies.length <= 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
        {activeCurrencies.map((cur) => (
          <div key={cur} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total {cur}</p>
            <p className="text-2xl font-bold mt-1">{formatMoney(totalsByCurrency[cur], cur)}</p>
          </div>
        ))}
      </div>

      {/* Cards de cuentas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {accounts.map((account) => {
          const Icon = getIcon(account.icon)
          const isSelected = selectedAccount?.id === account.id
          return (
            <button
              key={account.id}
              onClick={() => selectAccount(account)}
              className={`relative overflow-hidden p-4 rounded-xl text-left transition-all ${
                isSelected ? "ring-2 ring-white/50 scale-[1.02]" : "hover:scale-[1.01]"
              }`}
              style={{ backgroundColor: account.color }}
            >
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
            </button>
          )
        })}
      </div>

      {/* Historial de la cuenta seleccionada */}
      {selectedAccount && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold">
              Movimientos — {selectedAccount.name}
            </h2>
          </div>

          {loadingTx ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Sin movimientos en esta cuenta.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => {
                const Icon = getIcon(tx.category?.icon || "tag")
                const isIncome = tx.category?.type === "income"
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (tx.category?.color || "#6b7280") + "20" }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: tx.category?.color || "#6b7280" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description || tx.category?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.date)} · {tx.category?.name}</p>
                    </div>
                    <span className={`text-sm font-semibold ${isIncome ? "text-emerald-500" : "text-foreground"}`}>
                      {isIncome ? "+" : "-"}{formatMoney(Math.abs(tx.amount), tx.currency)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
