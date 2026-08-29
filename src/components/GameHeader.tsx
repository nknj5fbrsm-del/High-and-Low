export function Lives({ lives, maxLives }: { lives: number; maxLives: number }) {
  const total = Math.max(1, maxLives)
  const icons = Array.from({ length: total }, (_, index) => (index < lives ? '❤️' : '💔'))
  return (
    <span
      className={`tracking-tight ${total > 3 ? 'text-sm' : 'text-lg'}`}
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
}: {
  streak: number
  lives: number
  maxLives: number
  roomCode: string
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <p className="font-display text-lg font-extrabold tracking-tight text-white">High & Low</p>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Team-Stapel · {roomCode}
        </p>
      </div>
      <div className="flex items-center gap-3 text-right">
        <p className="font-display text-2xl font-extrabold text-amber-300" aria-label={`Streak ${streak}`}>
          🔥 {streak}
        </p>
        <Lives lives={lives} maxLives={maxLives} />
      </div>
    </header>
  )
}
