/** URL pública del sitio (sin barra final). Usada en metadata, sitemap y JSON-LD. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (raw) return raw.replace(/\/$/, "")
  return "https://fin-track-alpha-seven.vercel.app"
}
