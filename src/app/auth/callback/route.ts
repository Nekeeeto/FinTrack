import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { supabaseAdmin } from "@/lib/supabase/server"
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")

  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"
  const baseUrl =
    !isLocalEnv && forwardedHost
      ? `https://${forwardedHost}`
      : origin

  if (code) {
    const response = NextResponse.redirect(`${baseUrl}/inicio`)

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
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: sessionData, error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData.session) {
      const user = sessionData.session.user

      // Crear perfil si no existe (OAuth, signUp, magic link)
      await ensureUserProfile(user)

      const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .single()

      if (!profile || !profile.onboarding_completed) {
        const onboardingUrl = `${baseUrl}/onboarding`
        response.headers.set("Location", onboardingUrl)
        return response
      }

      return response
    }
  }

  return NextResponse.redirect(`${baseUrl}/login`)
}
