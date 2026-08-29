import { streakTitle } from '../axis.ts'
import { Lives } from './GameHeader.tsx'
import { LeaveRoomButton } from './LeaveRoomButton.tsx'

export function GameOverScreen({
  streak,
  maxLives,
  roomCode,
  busy,
  error,
  onRestart,
  onLeave,
}: {
  streak: number
  maxLives: number
  roomCode: string
  busy: boolean
  error: string | null
  onRestart: () => void
  onLeave: () => void
}) {
  return (
    <div className="flex min-h-dvh flex-col items-stretch px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
        Team-Stapel · {roomCode}
      </p>
      <h1 className="font-display mt-6 text-4xl font-extrabold text-white">Game Over</h1>
      <p className="mt-3 text-zinc-400">Keine Leben mehr. Streak steht.</p>

      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/80 px-6 py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Finaler Streak</p>
        <p className="font-display mt-3 text-7xl font-extrabold text-amber-300">🔥 {streak}</p>
        <p className="mt-4 inline-block rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] text-amber-200">
          {streakTitle(streak)}
        </p>
        <div className="mt-5">
          <Lives lives={0} maxLives={maxLives} />
        </div>
      </div>

      {error && <p className="mt-4 text-center text-sm text-rose-300">{error}</p>}

      <button
        type="button"
        onClick={onRestart}
        disabled={busy}
        className="mt-auto h-14 rounded-2xl bg-lime-400 text-lg font-bold text-zinc-950 disabled:opacity-40"
      >
        Neues Spiel starten
      </button>
      <div className="mt-3">
        <LeaveRoomButton onLeave={onLeave} />
      </div>
    </div>
  )
}
