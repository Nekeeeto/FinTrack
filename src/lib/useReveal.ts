"use client"

import { useEffect, useRef } from "react"

/**
 * Hook que observa elementos con clase `.reveal` dentro del ref
 * y les agrega `.revealed` cuando entran al viewport.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const targets = container.querySelectorAll(".reveal")
    if (targets.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    )

    for (const el of targets) io.observe(el)
    return () => io.disconnect()
  }, [])

  return ref
}
