import Link from "next/link"
import { LANDING_CONTAINER, LANDING_FOOTER_Y } from "@/lib/landing-layout"
import { PlatitaBrandLockup } from "@/components/PlatitaBrandLockup"

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className={`${LANDING_CONTAINER} ${LANDING_FOOTER_Y}`}>
        <div className="flex flex-col items-center text-center gap-5 sm:gap-6">
          <PlatitaBrandLockup size="md" href="/" />

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
            <a href="#store" className="text-muted-foreground hover:text-foreground transition-colors">
              Web y PWA
            </a>
            <Link href="/soporte" className="text-muted-foreground hover:text-foreground transition-colors">
              Ayuda
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Iniciar sesión
            </Link>
          </nav>

          <p className="text-xs text-muted-foreground text-center max-w-sm leading-relaxed">
            Cómo tratamos tus datos:{" "}
            <Link href="/privacidad" className="text-[#5DBCD2] hover:underline">
              política de privacidad
            </Link>
            .
          </p>

          <p className="text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} Platita. Todos los derechos reservados.</span>
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
