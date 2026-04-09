/**
 * Isotipo “platita”: pinch con trazos gruesos para leerse bien a ~32–40px.
 * Color vía currentColor; glow en `globals.css` (.platita-isotype-neon).
 */
export function PlatitaIsotype({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      overflow="visible"
    >
      <g
        stroke="currentColor"
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 7 33 Q 10 22, 17.5 18.5" />
        <path d="M 37 9 Q 31 14.5, 24.5 18.5" />
      </g>
      <path
        className="platita-sparkle-fill"
        fill="currentColor"
        d="M 21 15.2 L 23.6 18.5 L 21 21.8 L 18.4 18.5 Z"
      />
    </svg>
  )
}
