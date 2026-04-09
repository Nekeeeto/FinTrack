"use client"

import * as React from "react"

type RotatingPillTextProps = {
  words: string[]
  intervalMs?: number
  className?: string
}

export function RotatingPillText({
  words,
  intervalMs = 2800,
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
      }, 400) // tiempo que dura la salida
    }, intervalMs)
    return () => window.clearInterval(t)
  }, [intervalMs, safeWords.length])

  const word = safeWords[idx] ?? ""

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-[1.25rem] bg-[#5DBCD2] px-4 py-1.5 text-black pill-glow whitespace-nowrap overflow-hidden align-middle ml-1",
        "motion-reduce:transition-none shadow-[0_0_40px_rgba(93,188,210,0.4)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      <span
        key={word}
        className={[
          "inline-block whitespace-nowrap font-extrabold tracking-tight",
          "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
          animating
            ? "opacity-0 -translate-y-8 scale-90 blur-[4px]"
            : "opacity-100 translate-y-0 scale-100 blur-0",
        ].join(" ")}
      >
        {word}
      </span>
    </span>
  )
}
