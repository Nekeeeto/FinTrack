import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")

  if (code) {
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
          },
        },
      }
    )

    const { data: sessionData, error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData.session) {
      const userId = sessionData.session.user.id

      // Verificar si el usuario tiene perfil (bypass RLS con supabaseAdmin)
      const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("user_id", userId)
        .single()

      // Determinar la URL de redirección base
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      const baseUrl =
        !isLocalEnv && forwardedHost
          ? `https://${forwardedHost}`
          : origin

      // Sin perfil -> no está invitado, redirigir a login con error
      if (!profile) {
        return NextResponse.redirect(
          `${baseUrl}/login?error=no-profile`
        )
      }

      // Perfil existe pero no completó onboarding
      if (!profile.onboarding_completed) {
        return NextResponse.redirect(`${baseUrl}/onboarding`)
      }

      // Todo OK -> ir al inicio
      return NextResponse.redirect(`${baseUrl}/inicio`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
