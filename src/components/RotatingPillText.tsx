"use client"

import * as React from "react"

type RotatingPillTextProps = {
  words: string[]
  intervalMs?: number
  className?: string
}

export function RotatingPillText({
  words,
  intervalMs = 2400,
  className,
}: RotatingPillTextProps) {
  const safeWords = React.useMemo(() => words.filter(Boolean), [words])
  const [idx, setIdx] = React.useState(0)
  const [animating, setAnimating] = React.useState(false)

  React.useEffect(() => {
    if (safeWords.length <= 1) return
    const t = window.setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setIdx((v) => (v + 1) % safeWords.length)
        setAnimating(false)
      }, 200)
    }, intervalMs)
    return () => window.clearInterval(t)
  }, [intervalMs, safeWords.length])

  const word = safeWords[idx] ?? ""

  return (
    <span
      className={[
        "inline-block rounded-xl bg-[#5DBCD2] px-3 py-1 text-black pill-glow whitespace-nowrap",
        "motion-reduce:transition-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      <span
        key={word}
        className={[
          "inline-block whitespace-nowrap transition-all duration-300 motion-reduce:transition-none font-bold",
          animating
            ? "opacity-0 translate-y-1"
            : "opacity-100 translate-y-0",
        ].join(" ")}
      >
        {word}
      </span>
    </span>
  )
}
