"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import type { Transaction } from "@/types/database"

interface Props {
  transaction: Transaction
  onClose: () => void
  onDeleted: () => void
}

export function DeleteDialog({ transaction, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Error al eliminar")
        return
      }
      onDeleted()
    } catch {
      setError("Error de conexión")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="font-semibold text-lg">Eliminar transacción</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-1">
          ¿Eliminar esta transacción? Esta acción no se puede deshacer.
        </p>
        <p className="text-sm font-medium mb-4">
          {transaction.description || transaction.category?.name} — {formatMoney(transaction.amount, transaction.currency)}
        </p>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}
