"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Loader2,
  Trash2,
  DollarSign,
  Save,
  Eye,
  EyeOff,
} from "lucide-react"
import type { UserProfile, UserRole, UserPlan } from "@/types/database"
import type { Transaction } from "@/types/database"
import { useAuth } from "@/lib/auth-context"

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
  const { profile: adminProfile } = useAuth()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formRole, setFormRole] = useState<UserRole>("user")
  const [formPlan, setFormPlan] = useState<UserPlan>("free")
  const [formOnboarding, setFormOnboarding] = useState(false)
  const [formPhotoCount, setFormPhotoCount] = useState(0)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const isSelf = adminProfile?.user_id === id

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

  useEffect(() => {
    if (!user) return
    setFormName(user.name ?? "")
    setFormEmail(user.email ?? "")
    setFormRole(user.role)
    setFormPlan(user.plan)
    setFormOnboarding(user.onboarding_completed)
    setFormPhotoCount(user.photo_count_month)
    setNewPassword("")
  }, [user])

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaveLoading(true)
    setError("")
    setSuccess("")

    const payload: Record<string, unknown> = {
      name: formName.trim(),
      email: formEmail.trim(),
      role: formRole,
      plan: formPlan,
      onboarding_completed: formOnboarding,
      photo_count_month: formPhotoCount,
    }

    const trimmedPass = newPassword.trim()
    if (trimmedPass.length > 0) {
      if (trimmedPass.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        setSaveLoading(false)
        return
      }
      payload.password = trimmedPass
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al guardar")
        return
      }

      setUser(data as UserDetail)
      setNewPassword("")
      setSuccess("Cambios guardados.")
    } catch {
      setError("Error de conexión")
    } finally {
      setSaveLoading(false)
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
      setConfirmDelete(false)
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
      {success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
      )}

      {/* Editar perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Editar usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={formRole}
                  onValueChange={(v) => setFormRole(v as UserRole)}
                  disabled={isSelf}
                >
                  <SelectTrigger id="edit-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">user</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
                {isSelf && (
                  <p className="text-xs text-muted-foreground">
                    No podés cambiar tu propio rol desde acá.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Plan</Label>
                <Select
                  value={formPlan}
                  onValueChange={(v) => setFormPlan(v as UserPlan)}
                >
                  <SelectTrigger id="edit-plan" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">free</SelectItem>
                    <SelectItem value="premium">premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-photos">Fotos este mes (contador)</Label>
                <Input
                  id="edit-photos"
                  type="number"
                  min={0}
                  value={formPhotoCount}
                  onChange={(e) =>
                    setFormPhotoCount(Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formOnboarding}
                    onCheckedChange={(c) => setFormOnboarding(c === true)}
                  />
                  <span className="text-sm font-medium">Onboarding completado</span>
                </label>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-password">Nueva contraseña (opcional)</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Dejar vacío para no cambiar"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <Button type="submit" disabled={saveLoading}>
                {saveLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar cambios
              </Button>
              <div className="text-sm text-muted-foreground">
                <span>Transacciones: {user.transaction_count}</span>
                <span className="mx-2">·</span>
                <span>
                  Registro: {new Date(user.created_at).toLocaleDateString("es-UY")}
                </span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Acciones destructivas */}
      <div className="flex gap-3">
        {!confirmDelete ? (
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar usuario
          </Button>
        ) : (
          <div className="flex items-center gap-2 border border-destructive rounded-lg px-3 py-1.5">
            <span className="text-sm text-destructive font-medium">Seguro?</span>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sí, eliminar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
          </div>
        )}
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
                      {Number(tx.amount).toLocaleString("es-UY", {
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
