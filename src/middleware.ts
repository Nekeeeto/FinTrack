import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y assets de Next.js
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
}
