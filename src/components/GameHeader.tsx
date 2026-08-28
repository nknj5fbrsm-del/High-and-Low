export function Lives({ lives }: { lives: number }) {
  const icons = [0, 1, 2].map((index) => (index < lives ? '❤️' : '💔'))
  return (
    <span className="text-lg tracking-tight" aria-label={`${lives} von 3 Leben`}>
      {icons.join(' ')}
    </span>
  )
}

export function GameHeader({
  streak,
  lives,
  roomCode,
}: {
  streak: number
  lives: number
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
        <Lives lives={lives} />
      </div>
    </header>
  )
}
