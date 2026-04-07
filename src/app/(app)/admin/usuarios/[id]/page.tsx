"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Loader2,
  Trash2,
  CreditCard,
  DollarSign,
} from "lucide-react"
import type { UserProfile } from "@/types/database"
import type { Transaction } from "@/types/database"

interface UserDetail extends UserProfile {
  transaction_count: number
  total_model_cost: number
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/users/${id}`)
        if (!res.ok) throw new Error("Usuario no encontrado")
        const data: UserDetail = await res.json()
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Cargar transacciones recientes del usuario
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch(`/api/admin/users/${id}/transactions`)
        if (res.ok) {
          const data: Transaction[] = await res.json()
          setTransactions(data)
        }
      } catch {
        // No es crítico si falla
      }
    }

    fetchTransactions()
  }, [id])

  async function handleTogglePlan() {
    if (!user) return
    setActionLoading(true)

    try {
      const newPlan = user.plan === "free" ? "premium" : "free"
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al actualizar plan")
        return
      }

      const updated: UserProfile = await res.json()
      setUser((prev) => (prev ? { ...prev, ...updated } : prev))
    } catch {
      setError("Error de conexión")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al eliminar usuario")
        return
      }

      router.push("/admin/usuarios")
    } catch {
      setError("Error de conexión")
    } finally {
      setActionLoading(false)
      setDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="text-destructive text-center py-10">
        <p>{error}</p>
        <Link href="/admin/usuarios" className={buttonVariants({ variant: "ghost", className: "mt-4" })}>
          Volver
        </Link>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/usuarios" className={buttonVariants({ variant: "ghost" })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a usuarios
      </Link>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil de {user.name || user.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{user.name || "Sin nombre"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <p className="font-medium">
                <span
                  className={
                    user.role === "admin"
                      ? "text-emerald-500"
                      : "text-muted-foreground"
                  }
                >
                  {user.role}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-medium">
                <span
                  className={
                    user.plan === "premium"
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }
                >
                  {user.plan}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fotos este mes</p>
              <p className="font-medium">{user.photo_count_month}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transacciones</p>
              <p className="font-medium">{user.transaction_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registro</p>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleDateString("es-UY")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleTogglePlan}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Cambiar a {user.plan === "free" ? "premium" : "free"}
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button variant="destructive" />}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar usuario
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar usuario</DialogTitle>
              <DialogDescription>
                Vas a eliminar a <strong>{user.name || user.email}</strong>.
                Esta acción no se puede deshacer. Se eliminará el usuario de
                autenticación y todos sus datos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancelar
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Sí, eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Costo modelo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Costo total del modelo (USD)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${user.total_model_cost.toFixed(4)}</p>
        </CardContent>
      </Card>

      {/* Transacciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este usuario no tiene transacciones registradas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Moneda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.date).toLocaleDateString("es-UY")}
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.category?.name || "-"}</TableCell>
                    <TableCell className="text-right">
                      {tx.amount.toLocaleString("es-UY", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{tx.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
