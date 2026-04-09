"use client"

import { useReveal } from "@/lib/useReveal"

export function LandingRevealWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className="min-h-screen w-full bg-[#020617] relative pb-28 md:pb-0">
      <div className="hero-noise pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
