import { getSiteUrl } from "@/lib/site-url"

/** Datos estructurados para la home (Organization, WebSite, SoftwareApplication). */
export function PlatitaJsonLd() {
  const base = getSiteUrl()
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "Platita",
        url: base,
        logo: `${base}/icons/icon-512.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "Platita",
        inLanguage: "es-UY",
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: "Platita",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Navegador web (PWA)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "UYU",
        },
        publisher: { "@id": `${base}/#organization` },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
