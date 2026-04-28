type Props = {
  className?: string
}

export function AntovelLogo({ className }: Props) {
  return (
    <div
      className={`flex items-center gap-2.5 ${className ?? ""}`}
      aria-label="Antovel"
    >
      <BrainGlyph className="h-6 w-6 text-foreground" />
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        Antovel
      </span>
    </div>
  )
}

function BrainGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 4.5C7.34 4.5 6 5.84 6 7.5c0 .35.06.69.17 1A3 3 0 0 0 4.5 11.5c0 .9.4 1.7 1.03 2.25-.34.5-.53 1.1-.53 1.75A3 3 0 0 0 8 18.5c.4 0 .79-.08 1.14-.22.42 1 1.41 1.72 2.6 1.72 1.55 0 2.81-1.26 2.81-2.81V5.81C14.55 4.81 13.55 4 12.31 4 11.05 4 10 4.81 9.5 5.94c-.16-.27-.31-.62-.5-1.44Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M15 4.5c1.66 0 3 1.34 3 3 0 .35-.06.69-.17 1A3 3 0 0 1 19.5 11.5c0 .9-.4 1.7-1.03 2.25.34.5.53 1.1.53 1.75A3 3 0 0 1 16 18.5c-.4 0-.79-.08-1.14-.22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="1.6"
        fill="currentColor"
        className="animate-neural-pulse"
        style={{ color: "var(--neural-violet)" }}
      />
    </svg>
  )
}
