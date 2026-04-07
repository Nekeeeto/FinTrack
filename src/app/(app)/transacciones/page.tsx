"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, Filter, Pencil, Trash2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getIcon } from "@/lib/icons"
import { formatMoney, formatDate } from "@/lib/format"
import type { Transaction, Account, Category } from "@/types/database"
import { TransactionModal } from "@/components/transactions/transaction-modal"
import { DeleteDialog } from "@/components/transactions/delete-dialog"

export default function TransaccionesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [filterAccount, setFilterAccount] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const [page, setPage] = useState(0)
  const limit = 20

  const [modalOpen, setModalOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterAccount) params.set("account_id", filterAccount)
    if (filterCategory) params.set("category_id", filterCategory)
    if (filterFrom) params.set("from", filterFrom)
    if (filterTo) params.set("to", filterTo)
    params.set("limit", String(limit))
    params.set("offset", String(page * limit))

    const res = await fetch(`/api/transactions?${params}`)
    const data = await res.json()

    let txs: Transaction[] = data.data ?? []
    if (search.trim()) {
      const q = search.toLowerCase()
      txs = txs.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(q) ||
          tx.category?.name?.toLowerCase().includes(q) ||
          tx.account?.name?.toLowerCase().includes(q)
      )
    }

    setTransactions(txs)
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [filterAccount, filterCategory, filterFrom, filterTo, page, search])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    Promise.all([
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/categories?flat=true").then((r) => r.json()),
    ]).then(([accs, cats]) => {
      setAccounts(accs ?? [])
      setCategories(cats ?? [])
    })
  }, [])

  function handleSaved() {
    setModalOpen(false)
    setEditTx(null)
    fetchTransactions()
  }

  function handleDeleted() {
    setDeleteTx(null)
    fetchTransactions()
  }

  const totalPages = Math.ceil(total / limit)
  const hasFilters = filterAccount || filterCategory || filterFrom || filterTo

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <Button onClick={() => { setEditTx(null); setModalOpen(true) }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Nueva
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descripción, categoría..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <Button variant={showFilters || hasFilters ? "default" : "outline"} size="icon" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg border border-border bg-card">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Cuenta</label>
            <select value={filterAccount} onChange={(e) => { setFilterAccount(e.target.value); setPage(0) }} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
              <option value="">Todas</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Categoría</label>
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(0) }} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
              <option value="">Todas</option>
              {categories.filter((c) => !c.parent_id).map((c) => (
                <optgroup key={c.id} label={c.name}>
                  <option value={c.id}>{c.name} (general)</option>
                  {categories.filter((sub) => sub.parent_id === c.id).map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Desde</label>
            <input type="date" value={filterFrom} onChange={(e) => { setFilterFrom(e.target.value); setPage(0) }} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Hasta</label>
            <input type="date" value={filterTo} onChange={(e) => { setFilterTo(e.target.value); setPage(0) }} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background" />
          </div>
          {hasFilters && (
            <button onClick={() => { setFilterAccount(""); setFilterCategory(""); setFilterFrom(""); setFilterTo(""); setPage(0) }} className="col-span-full text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X className="h-3 w-3" /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No hay transacciones{hasFilters ? " con esos filtros" : ""}.</div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {transactions.map((tx) => {
              const Icon = getIcon(tx.category?.icon || "tag")
              const isIncome = tx.category?.type === "income"
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (tx.category?.color || "#6b7280") + "20" }}>
                    <Icon className="h-4 w-4" style={{ color: tx.category?.color || "#6b7280" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{tx.description || tx.category?.name}</p>
                      {tx.source === "telegram" && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500 flex-shrink-0">Telegram</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)} · {tx.category?.name} · {tx.account?.name}</p>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${isIncome ? "text-emerald-500" : "text-foreground"}`}>
                    {isIncome ? "+" : "-"}{formatMoney(Math.abs(tx.amount), tx.currency)}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditTx(tx); setModalOpen(true) }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteTx(tx)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{page * limit + 1}–{Math.min((page + 1) * limit, total)} de {total}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Siguiente</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <TransactionModal
          transaction={editTx}
          accounts={accounts}
          categories={categories}
          onClose={() => { setModalOpen(false); setEditTx(null) }}
          onSaved={handleSaved}
        />
      )}

      {deleteTx && (
        <DeleteDialog
          transaction={deleteTx}
          onClose={() => setDeleteTx(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
