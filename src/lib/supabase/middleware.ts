import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ["/", "/login", "/auth"]
// Rutas API que manejan su propia auth (webhook Telegram, etc.)
const PASSTHROUGH_API_ROUTES = ["/api/telegram/webhook"]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // API routes: dejar pasar (cada route maneja su propia auth)
  if (pathname.startsWith("/api/")) {
    return supabaseResponse
  }

  // Rutas de auth callback: siempre permitir
  if (pathname.startsWith("/auth")) {
    return supabaseResponse
  }

  // Landing page (/): si el usuario está autenticado, redirigir a /inicio
  if (pathname === "/") {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = "/inicio"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Login: si ya está autenticado, redirigir a /inicio
  if (pathname === "/login") {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = "/inicio"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Todas las demás rutas requieren autenticación
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Chequear si el usuario completó el onboarding
  // (solo para rutas que NO sean /onboarding)
  if (pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single()

    if (profile && !profile.onboarding_completed) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
