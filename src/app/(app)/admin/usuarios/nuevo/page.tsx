"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, CheckCircle2, Copy, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import type { UserProfile } from "@/types/database"

interface CreateUserResponse {
  profile: UserProfile
  credentials: { email: string; password: string }
  message: string
}

export default function AdminCreateUserPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState<CreateUserResponse | null>(null)
  const [copied, setCopied] = useState(false)

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    let pass = ""
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(pass + "!")
    setShowPassword(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || email.split("@")[0],
          password,
        }),
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

  async function copyCredentials() {
    if (!created) return
    const text = `Biyuya - Tus credenciales:\nEmail: ${created.credentials.email}\nContraseña: ${created.credentials.password}\nLink: ${window.location.origin}/login`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{created.profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{created.credentials.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contraseña</p>
              <p className="font-mono font-medium bg-muted px-3 py-2 rounded-md">
                {created.credentials.password}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={copyCredentials}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copiado!" : "Copiar credenciales para enviar"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Enviá estas credenciales al usuario. Cuando inicie sesión por primera vez completará el onboarding.
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreated(null)
                  setEmail("")
                  setName("")
                  setPassword("")
                  setShowPassword(false)
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
              <label htmlFor="name" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Nombre del usuario"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generar
                </Button>
              </div>
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
