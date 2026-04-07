import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await getAuthUser()

  if (!auth) {
    redirect("/login")
  }

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("role")
    .eq("user_id", auth.userId)
    .single()

  if (!profile || profile.role !== "admin") {
    redirect("/inicio")
  }

  return <>{children}</>
}
