import { AppMain } from "@/components/layout/app-main"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthProvider } from "@/lib/auth-context"
import { VoiceAssistant } from "@/components/voice/voice-assistant"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <Sidebar />
      <AppMain>{children}</AppMain>
      <VoiceAssistant showFab={false} />
    </AuthProvider>
  )
}
