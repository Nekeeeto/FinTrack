"use client"

import { useReveal } from "@/lib/useReveal"

export function LandingRevealWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className="min-h-screen w-full bg-background relative">
      <div className="hero-noise pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
