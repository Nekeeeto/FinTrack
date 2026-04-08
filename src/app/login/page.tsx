"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
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

    const { error } = await supabase.auth.signInWithPassword({
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

    window.location.href = "/inicio"
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Ingresá tu email primero para recuperar la contraseña.")
      return
    }
    setResetLoading(true)
    setError("")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setResetLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
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
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
            <span className="text-3xl font-bold text-emerald-500">$</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Biyuya</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresá tus credenciales para acceder
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>

              {/* Password con ojito */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Recordarme + Olvidé contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <span className="text-xs text-muted-foreground">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                {resetLoading ? "Enviando..." : "¿Olvidaste tu contraseña?"}
              </button>
            </div>

            {/* Mensajes */}
            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            {resetSent && (
              <p className="text-xs text-emerald-500 text-center">
                Te enviamos un email para restablecer tu contraseña. Revisá tu bandeja de entrada.
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Biyuya v1.0 — Gestor Financiero Personal
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
