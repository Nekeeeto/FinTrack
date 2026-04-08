"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Chequear sesión existente directamente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/inicio")
      } else {
        setChecking(false)
      }
    })
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      if (error.message === "Invalid login credentials") {
        setError("Email o contraseña incorrectos.")
      } else {
        setError(error.message)
      }
      return
    }

    // Verificar si completó onboarding
    if (data.session) {
      try {
        const res = await fetch("/api/me")
        const profile = await res.json()
        if (profile && !profile.onboarding_completed) {
          router.replace("/onboarding")
          return
        }
      } catch {
        // Si falla, seguir al inicio
      }
      router.replace("/inicio")
    }

    setLoading(false)
  }

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2 pb-4">
          <h1 className="text-2xl font-bold">
            <span className="text-emerald-500">$</span> Biyuya
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresá tus credenciales para acceder
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
