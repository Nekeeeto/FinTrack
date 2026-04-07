import { Sidebar } from "@/components/layout/sidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background">{children}</main>
    </>
  )
}
