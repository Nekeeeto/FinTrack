"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons"

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
      <div className="fixed inset-0 flex items-center justify-center bg-[#020617]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5DBCD2]" />
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4 md:p-8 bg-[#020617] overflow-hidden isolate">
      
      {/* Botón flotante para volver atrás */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors z-50 group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 group-hover:bg-white/10 transition-colors">
           <ArrowLeft className="h-4 w-4" />
        </div>
        <span className="hidden sm:inline">Volver</span>
      </Link>

      {/* Dynamic Animated Background Mesh */}
      <div className="absolute inset-0 -z-10 bg-[#020617]">
         <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-[#5DBCD2]/15 rounded-full blur-[120px] mix-blend-screen opacity-60" style={{ animation: 'hero-drift 20s ease-in-out infinite alternate' }} />
         <div className="absolute bottom-[-10%] -right-1/4 w-[600px] h-[600px] bg-[#5DBCD2]/10 rounded-full blur-[100px] mix-blend-screen opacity-50" style={{ animation: 'hero-wave 15s ease-in-out infinite alternate-reverse' }} />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="w-full max-w-[400px] mt-8">
        {/* Glassmorphism Card */}
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] p-6 sm:p-10 relative overflow-hidden">
          
          <div className="absolute inset-0 bg-linear-to-b from-white/[0.04] to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="text-center space-y-4 pb-8">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#5DBCD2]/10 border border-[#5DBCD2]/20 shadow-[0_0_20px_rgba(93,188,210,0.2)]">
                <span className="text-3xl font-extrabold text-[#5DBCD2]">$</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">Bienvenido</h1>
                <p className="text-sm text-white/55 font-medium">
                  Accedé a tu entorno privado seguro.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#5DBCD2] transition-colors" />
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-13 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-[#5DBCD2]/50 focus-visible:border-[#5DBCD2]/50 rounded-xl transition-all"
                    required
                  />
                </div>

                {/* Password con ojito */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#5DBCD2] transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-13 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-[#5DBCD2]/50 focus-visible:border-[#5DBCD2]/50 rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
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
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-white/20 data-[state=checked]:bg-[#5DBCD2] data-[state=checked]:border-[#5DBCD2] rounded-md transition-colors"
                  />
                  <span className="text-xs sm:text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs sm:text-sm font-medium text-[#5DBCD2]/80 hover:text-[#5DBCD2] transition-colors"
                >
                  {resetLoading ? "Enviando..." : "¿Clave perdida?"}
                </button>
              </div>

              {/* Mensajes */}
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                   <p className="text-xs text-red-400 text-center">{error}</p>
                </div>
              )}
              {resetSent && (
                <div className="rounded-lg bg-[#5DBCD2]/10 border border-[#5DBCD2]/20 p-3">
                   <p className="text-xs text-[#5DBCD2] text-center">
                     Te enviamos un email con instrucciones. Revisá tu bandeja.
                   </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-13 mt-2 bg-[#5DBCD2] hover:bg-[#469eaf] text-black font-bold text-base rounded-xl transition-all shadow-[0_0_20px_rgba(93,188,210,0.3)] hover:shadow-[0_0_30px_rgba(93,188,210,0.5)] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-black/50" />
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>

            <SocialLoginButtons />

            <p className="text-center text-sm text-white/50 mt-6">
              ¿No tenés cuenta?{" "}
              <Link href="/registro" className="text-[#5DBCD2] font-semibold hover:text-[#5DBCD2]/80 transition-colors">
                Creá una gratis
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs font-medium text-white/30 mt-8 tracking-wide">
          PLATITA OS — Gestor Financiero Moderno
        </p>
      </div>
    </div>
  )
}
