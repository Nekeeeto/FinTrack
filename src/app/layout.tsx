import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { PWARegister } from "@/components/pwa-register"
import { getSiteUrl } from "@/lib/site-url"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Platita — finanzas personales en Uruguay",
    template: "%s | Platita",
  },
  description:
    "Controlá gastos e ingresos en pesos y dólares. Platita es tu gestor financiero personal desde el navegador.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Platita",
  },
  openGraph: {
    type: "website",
    locale: "es_UY",
    siteName: "Platita",
    images: [{ url: "/marketing-hero.png", alt: "Platita" }],
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es-UY"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full font-sans bg-background text-foreground">
        <ThemeProvider>
          <PWARegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
