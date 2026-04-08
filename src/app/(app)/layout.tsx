import { Sidebar } from "@/components/layout/sidebar"
import { AuthProvider } from "@/lib/auth-context"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <Sidebar />
      <main className="flex-1 md:ml-64 pt-18 md:pt-0 p-4 md:p-8 bg-background min-w-0">{children}</main>
    </AuthProvider>
  )
}
