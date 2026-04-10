import { AuthProvider } from "@/lib/auth-context"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <main className="min-h-screen w-full bg-background">{children}</main>
    </AuthProvider>
  )
}
