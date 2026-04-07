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
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background">{children}</main>
    </AuthProvider>
  )
}
