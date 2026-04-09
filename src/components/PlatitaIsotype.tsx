/**
 * Isotipo “platita”: pulgar e índice con puntas cercanas (pinch) + destello entre medias.
 * Color vía currentColor; glow en `globals.css` (.platita-isotype-neon).
 */
export function PlatitaIsotype({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Pulgar: entra desde abajo-izquierda */}
        <path d="M 9 32 Q 12 21, 18.5 17.5" />
        {/* Índice: entra desde arriba-derecha; puntas no comparten el mismo pixel para leerse como dos dedos */}
        <path d="M 39 11 Q 32 15, 25.5 17.5" />
      </g>
      {/* Destello geométrico entre las puntas (~18.5–25.5 en x, y≈17.5) */}
      <path
        className="platita-sparkle-fill"
        fill="currentColor"
        d="M 22 14.2 L 24.35 17.5 L 22 20.8 L 19.65 17.5 Z"
      />
    </svg>
  )
}
