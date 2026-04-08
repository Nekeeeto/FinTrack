import { AuthProvider } from "@/lib/auth-context"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <main className="min-h-screen w-full flex items-center justify-center bg-background">
        {children}
      </main>
    </AuthProvider>
  )
}
