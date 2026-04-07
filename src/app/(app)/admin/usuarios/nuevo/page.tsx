"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { UserProfile } from "@/types/database"

interface CreateUserResponse {
  profile: UserProfile
  message: string
}

export default function AdminCreateUserPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState<CreateUserResponse | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || email.split("@")[0] }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al crear usuario")
        return
      }

      setCreated(data as CreateUserResponse)
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Link href="/admin/usuarios" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a usuarios
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
              Usuario creado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{created.profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{created.profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-medium">{created.profile.plan}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {created.message}
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreated(null)
                  setEmail("")
                  setName("")
                }}
              >
                Crear otro
              </Button>
              <Button
                onClick={() =>
                  router.push(`/admin/usuarios/${created.profile.user_id}`)
                }
              >
                Ver usuario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link href="/admin/usuarios" className={buttonVariants({ variant: "ghost" })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a usuarios
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Crear usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre (opcional)
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Nombre del usuario"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear usuario
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
