"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { UserProfile } from "@/types/database"

interface AuthContextValue {
  profile: UserProfile | null
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  profile: null,
  isAdmin: false,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/me")
        if (res.ok) {
          const data: UserProfile = await res.json()
          setProfile(data)
        }
      } catch {
        // Silenciar error — el usuario no está autenticado
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const isAdmin = profile?.role === "admin"

  return (
    <AuthContext.Provider value={{ profile, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
