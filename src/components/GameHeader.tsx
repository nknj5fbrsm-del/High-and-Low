export function Lives({ lives, maxLives }: { lives: number; maxLives: number }) {
  const total = Math.max(1, maxLives)
  const icons = Array.from({ length: total }, (_, index) => (index < lives ? '♥' : '♡'))
  return (
    <span
      className={`font-serif tracking-[0.12em] text-burgundy ${total > 3 ? 'text-base' : 'text-lg'}`}
      aria-label={`${lives} von ${total} Leben`}
    >
      {icons.join(' ')}
    </span>
  )
}

export function GameHeader({
  streak,
  lives,
  maxLives,
  roomCode,
  solo,
  versus,
  muted = false,
  onToggleMute,
}: {
  streak: number
  lives: number
  maxLives: number
  roomCode: string
  solo?: boolean
  versus?: boolean
  muted?: boolean
  onToggleMute?: () => void
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <p className="font-serif text-xl font-medium tracking-tight text-cream">High & Low</p>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-khaki">
          {solo ? 'Solo' : versus ? `Duell · ${roomCode}` : `Tisch · ${roomCode}`}
        </p>
      </div>
      <div className="flex items-center gap-3 text-right">
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Ton an' : 'Ton aus'}
            className="rounded border border-khaki/50 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-khaki"
          >
            {muted ? 'Ton aus' : 'Ton an'}
          </button>
        )}
        {!versus && (
          <p className="font-number text-3xl font-semibold text-cream" aria-label={`Serie ${streak}`}>
            {streak}
          </p>
        )}
        <Lives lives={lives} maxLives={maxLives} />
      </div>
    </header>
  )
}
