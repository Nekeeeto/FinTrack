"use client"

import Image from "next/image"
import { useState } from "react"
import { getIcon } from "@/lib/icons"
import { resolveAccountDisplayLogoUrl } from "@/lib/account-presets"
import { cn } from "@/lib/utils"

export function AccountBrandAvatar({
  logoUrl,
  icon,
  name,
  className,
  imageClassName,
  iconClassName,
}: {
  logoUrl?: string | null
  icon: string
  name: string
  className?: string
  imageClassName?: string
  iconClassName?: string
}) {
  const [logoError, setLogoError] = useState(false)
  const Icon = getIcon(icon)
  const resolvedSrc = resolveAccountDisplayLogoUrl({ name, logo_url: logoUrl })

  if (resolvedSrc && !logoError) {
    return (
      <span
        className={cn(
          "box-border grid shrink-0 place-items-center overflow-hidden",
          "border border-black/10 bg-white p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
          className,
          "rounded-full"
        )}
      >
        <Image
          src={resolvedSrc}
          alt={`Logo ${name}`}
          width={64}
          height={64}
          unoptimized={resolvedSrc.startsWith("/")}
          onError={() => setLogoError(true)}
          className={cn("max-h-full max-w-full object-contain object-center", imageClassName)}
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-white/15",
        className
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", iconClassName)} aria-hidden />
    </span>
  )
}
