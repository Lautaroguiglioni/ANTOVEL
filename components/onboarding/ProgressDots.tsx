type Props = {
  total: number
  current: number
}

export function ProgressDots({ total, current }: Props) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      className="flex items-center gap-2"
    >
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current
        const completed = i < current
        return (
          <span
            key={i}
            className={[
              "h-1.5 rounded-full transition-all duration-350",
              active
                ? "w-6 bg-[var(--neural-violet)] shadow-[0_0_12px_rgba(124,58,237,0.6)]"
                : completed
                  ? "w-1.5 bg-[var(--neural-violet)]/60"
                  : "w-1.5 bg-foreground/15",
            ].join(" ")}
          />
        )
      })}
    </div>
  )
}
