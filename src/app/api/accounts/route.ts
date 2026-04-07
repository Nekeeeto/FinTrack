import { NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"

export async function GET() {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const { data, error } = await auth.supabase
    .from("accounts")
    .select("*")
    .eq("user_id", auth.userId)
    .order("created_at")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
