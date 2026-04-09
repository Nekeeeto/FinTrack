/**
 * Isotipo “platita”: gesto (pulgar + índice) + destello geométrico.
 * Color vía currentColor; glow y animación en `globals.css` (.platita-isotype-neon).
 */
export function PlatitaIsotype({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 26.5C7 17 11.8 12.2 19.8 15" />
        <path d="M33 9C33 14.2 27.2 13.6 20.2 15" />
      </g>
      <path
        className="platita-sparkle-fill"
        fill="currentColor"
        d="M20 11.8 22.15 14.5 20 17.2 17.85 14.5z"
      />
    </svg>
  )
}
