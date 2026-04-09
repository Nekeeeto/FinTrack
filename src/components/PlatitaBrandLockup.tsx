import Link from "next/link"
import { PlatitaIsotype } from "@/components/PlatitaIsotype"
import { cn } from "@/lib/utils"

const sizes = {
  sm: {
    wrap: "gap-2",
    icon: "h-7 w-7 shrink-0",
    text: "text-sm font-semibold tracking-tight",
  },
  md: {
    wrap: "gap-2.5",
    icon: "h-9 w-9 sm:h-10 sm:w-10 shrink-0",
    text: "text-lg sm:text-xl font-semibold tracking-tight",
  },
  lg: {
    wrap: "gap-3 sm:gap-3.5",
    icon: "h-11 w-11 sm:h-[3.25rem] sm:w-[3.25rem] shrink-0",
    text: "text-2xl sm:text-3xl font-semibold tracking-tight",
  },
} as const

type Size = keyof typeof sizes

type PlatitaBrandLockupProps = {
  size?: Size
  href?: string
  className?: string
  wordmarkClassName?: string
}

export function PlatitaBrandLockup({
  size = "md",
  href,
  className,
  wordmarkClassName,
}: PlatitaBrandLockupProps) {
  const s = sizes[size]

  const content = (
    <>
      <span
        className={cn(
          "platita-isotype-neon inline-flex items-center justify-center rounded-xl text-[#10b981]",
          s.icon
        )}
      >
        <PlatitaIsotype className="h-[85%] w-[85%]" />
      </span>
      <span
        className={cn(s.text, "text-foreground/95", wordmarkClassName)}
      >
        Platita
      </span>
    </>
  )

  const flexClass = cn(
    "inline-flex items-center",
    s.wrap,
    href ? undefined : className
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center rounded-xl outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          s.wrap,
          className
        )}
      >
        {content}
      </Link>
    )
  }

  return <span className={flexClass}>{content}</span>
}
