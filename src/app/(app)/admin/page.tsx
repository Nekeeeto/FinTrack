"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, ArrowLeftRight, DollarSign, Loader2 } from "lucide-react"
import type { UserProfile } from "@/types/database"

interface UserWithStats extends UserProfile {
  transaction_count: number
  total_model_cost: number
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users")
        if (!res.ok) throw new Error("Error al cargar usuarios")
        const data: UserWithStats[] = await res.json()
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-10">
        <p>{error}</p>
      </div>
    )
  }

  const totalUsers = users.length
  const totalTransactions = users.reduce((sum, u) => sum + u.transaction_count, 0)
  const totalModelCost = users.reduce((sum, u) => sum + u.total_model_cost, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total transacciones</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTransactions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Costo modelo (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalModelCost.toFixed(4)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Fotos</TableHead>
                <TableHead className="text-right">Transacciones</TableHead>
                <TableHead>Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link
                      href={`/admin/usuarios/${user.user_id}`}
                      className="font-medium hover:underline"
                    >
                      {user.name || "Sin nombre"}
                    </Link>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={
                        user.plan === "premium"
                          ? "text-amber-500 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {user.plan}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{user.photo_count_month}</TableCell>
                  <TableCell className="text-right">{user.transaction_count}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("es-UY")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
