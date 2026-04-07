"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, UserPlus } from "lucide-react"
import type { UserProfile } from "@/types/database"

interface UserWithStats extends UserProfile {
  transaction_count: number
  total_model_cost: number
}

export default function AdminUsersPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Link href="/admin/usuarios/nuevo" className={buttonVariants()}>
          <UserPlus className="h-4 w-4 mr-2" />
          Crear usuario
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Fotos</TableHead>
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
                        user.role === "admin"
                          ? "text-emerald-500 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {user.role}
                    </span>
                  </TableCell>
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
