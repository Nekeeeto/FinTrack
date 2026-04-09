import Link from "next/link"
import { Globe, Music2, Mail } from "lucide-react"

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col items-center text-center gap-5 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5DBCD2]/15 border border-[#5DBCD2]/25">
              <span className="text-[#5DBCD2] font-extrabold text-xl">$</span>
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">PLATITA</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Características
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Precios
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Iniciar sesión
            </Link>
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="h-5 w-5" />
            </a>
            <a href="#" aria-label="TikTok" className="text-muted-foreground hover:text-foreground transition-colors">
              <Music2 className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Contacto" className="text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} PLATITA. Todos los derechos reservados.</span>
            <span className="hidden sm:inline text-border">|</span>
            <Link
              href="/privacidad"
              className="hover:text-foreground transition-colors underline decoration-border underline-offset-4"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="hover:text-foreground transition-colors underline decoration-border underline-offset-4"
            >
              Términos
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
