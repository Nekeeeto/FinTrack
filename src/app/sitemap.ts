import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site-url"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const lastModified = new Date()

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/registro`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacidad`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/terminos`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/soporte`, lastModified, changeFrequency: "weekly", priority: 0.5 },
  ]
}
