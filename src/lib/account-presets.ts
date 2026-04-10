import type { AccountType } from "@/types/database"

/** Preset compartido: onboarding, pantalla Cuentas y resolución de logo por nombre. */
export type AccountPreset = {
  name: string
  icon: string
  type: AccountType
  logoUrl?: string
}

/** Cuentas / bancos Uruguay + efectivo (misma fuente en onboarding y Cuentas). */
export const NACIONAL_ACCOUNT_PRESETS: AccountPreset[] = [
  { name: "Efectivo UYU", icon: "banknote", type: "cash" },
  { name: "BROU", icon: "wallet", type: "checking", logoUrl: "/banks/brou.png" },
  { name: "Santander UY", icon: "wallet", type: "checking", logoUrl: "/banks/santander.png" },
  { name: "Itaú UY", icon: "wallet", type: "checking", logoUrl: "/banks/itau.png" },
  { name: "BBVA UY", icon: "wallet", type: "checking", logoUrl: "/banks/bbva.png" },
  { name: "Scotiabank UY", icon: "wallet", type: "checking", logoUrl: "/banks/scotiabank.png" },
  { name: "HSBC UY", icon: "wallet", type: "checking", logoUrl: "https://logo.clearbit.com/hsbc.com.uy" },
  { name: "Prex", icon: "wallet", type: "checking", logoUrl: "/banks/prex.png" },
  { name: "MiDinero", icon: "wallet", type: "checking", logoUrl: "/banks/midinero.png" },
  { name: "Personalizado", icon: "wallet", type: "checking" },
]

/** Wallets internacionales (onboarding nacional/internacional + Cuentas). */
export const INTERNACIONAL_ACCOUNT_PRESETS: AccountPreset[] = [
  { name: "Binance", icon: "trending-up", type: "investment", logoUrl: "https://logo.clearbit.com/binance.com" },
  { name: "Wise", icon: "briefcase", type: "investment", logoUrl: "https://logo.clearbit.com/wise.com" },
  { name: "PayPal", icon: "briefcase", type: "investment", logoUrl: "https://logo.clearbit.com/paypal.com" },
  { name: "Revolut", icon: "briefcase", type: "investment", logoUrl: "https://logo.clearbit.com/revolut.com" },
  { name: "Payoneer", icon: "briefcase", type: "investment", logoUrl: "https://logo.clearbit.com/payoneer.com" },
  { name: "Skrill", icon: "briefcase", type: "investment", logoUrl: "https://logo.clearbit.com/skrill.com" },
  { name: "Personalizado", icon: "wallet", type: "investment" },
]

const PRESETS_WITH_LOGO: AccountPreset[] = [...NACIONAL_ACCOUNT_PRESETS, ...INTERNACIONAL_ACCOUNT_PRESETS].filter(
  (p) => p.logoUrl && p.name !== "Personalizado"
)

function normalizeAccountLabel(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

/** Quita sufijo " USD" de la cuenta hermana en dólares para matchear el preset. */
function nameForLogoLookup(displayName: string): string {
  let s = displayName.trim()
  if (s.toLowerCase().endsWith(" usd")) {
    s = s.slice(0, -4).trim()
  }
  return s
}

/**
 * Logo a mostrar:
 * - URL/path no vacío en `logo_url` → se usa tal cual.
 * - `logo_url === ""` → el usuario eligió solo ícono (no inferir por nombre).
 * - `null` / `undefined` → inferencia por nombre de cuenta (misma lista que onboarding/Cuentas), ej. "ITAU UY" → Itaú.
 */
export function resolveAccountDisplayLogoUrl(account: { name: string; logo_url?: string | null }): string | null {
  const v = account.logo_url
  if (typeof v === "string" && v === "") {
    return null
  }
  const stored = typeof v === "string" ? v.trim() : ""
  if (stored) return stored

  const key = normalizeAccountLabel(nameForLogoLookup(account.name))
  if (!key) return null

  for (const preset of PRESETS_WITH_LOGO) {
    if (normalizeAccountLabel(preset.name) === key) {
      return preset.logoUrl ?? null
    }
  }

  return null
}

/** Onboarding: grid nacional sin efectivo en efectivo (solo bancos + personalizado). */
export const ONBOARDING_NACIONAL_PRESETS = NACIONAL_ACCOUNT_PRESETS.filter((p) => p.name !== "Efectivo UYU")
