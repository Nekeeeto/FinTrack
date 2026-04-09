"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

type Provider = "google" | "facebook" | "apple"

const label: Record<Provider, string> = {
  google: "Continuar con Google",
  facebook: "Continuar con Facebook",
  apple: "Continuar con Apple",
}

const envKey: Record<Provider, string> = {
  google: "NEXT_PUBLIC_OAUTH_GOOGLE",
  facebook: "NEXT_PUBLIC_OAUTH_FACEBOOK",
  apple: "NEXT_PUBLIC_OAUTH_APPLE",
}

function isEnabled(provider: Provider): boolean {
  const val =
    provider === "google"
      ? process.env.NEXT_PUBLIC_OAUTH_GOOGLE
      : provider === "facebook"
        ? process.env.NEXT_PUBLIC_OAUTH_FACEBOOK
        : process.env.NEXT_PUBLIC_OAUTH_APPLE
  return val === "1" || val === "true"
}

export function SocialLoginButtons() {
  const [loading, setLoading] = useState<Provider | null>(null)

  async function signIn(provider: Provider) {
    setLoading(provider)
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback` },
    })
    if (error) {
      console.error(error)
      setLoading(null)
    }
  }

  const providers = (["google", "facebook", "apple"] as const).filter(isEnabled)
  if (providers.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Separador "o" */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-[#020617]/80 px-3 text-white/40 font-semibold">o</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {providers.map((p) => (
          <button
            key={p}
            type="button"
            disabled={loading !== null}
            onClick={() => void signIn(p)}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            {loading === p ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#5DBCD2]" />
            ) : (
              <ProviderIcon provider={p} />
            )}
            {label[p]}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProviderIcon({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    )
  }
  if (provider === "facebook") {
    return (
      <svg className="h-5 w-5 shrink-0 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  }
  // Apple
  return (
    <svg className="h-5 w-5 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}
