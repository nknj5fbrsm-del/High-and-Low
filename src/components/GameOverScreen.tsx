import { streakTitle } from '../axis.ts'
import { Lives } from './GameHeader.tsx'
import { LeaveRoomButton } from './LeaveRoomButton.tsx'

export function GameOverScreen({
  streak,
  best,
  solo,
  maxLives,
  roomCode,
  busy,
  error,
  onRestart,
  onLeave,
}: {
  streak: number
  best: number
  solo: boolean
  maxLives: number
  roomCode: string
  busy: boolean
  error: string | null
  onRestart: () => void
  onLeave: () => void
}) {
  return (
    <div className="page-table flex min-h-dvh flex-col items-stretch px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-khaki">
        {solo ? 'Solo' : `Tisch · ${roomCode}`}
      </p>
      {solo ? (
        <>
          <h1 className="font-serif mt-6 text-4xl font-medium text-cream">Rekord: {best}.</h1>
          <p className="mt-3 font-serif text-lg text-khaki">Diese Runde: {streak}. Leben waren nur Puffer.</p>
        </>
      ) : (
        <>
          <h1 className="font-serif mt-6 text-4xl font-medium text-cream">Keine Karten mehr.</h1>
          <p className="mt-3 text-khaki">Die Serie steht.</p>
        </>
      )}

      <div className="trivia-card mt-8 px-6 py-8 text-center">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-burgundy">Serie</p>
        <p className="font-number mt-3 text-7xl font-semibold text-ink">{streak}</p>
        {!solo && (
          <p className="mt-4 inline-block font-serif text-sm text-burgundy">{streakTitle(streak)}</p>
        )}
        <div className="mt-5">
          <Lives lives={0} maxLives={maxLives} />
        </div>
      </div>

      {error && <p className="mt-4 text-center text-sm text-khaki">{error}</p>}

      <button type="button" onClick={onRestart} disabled={busy} className="tab-btn tab-btn-burgundy mt-auto">
        {solo ? 'Nochmal.' : 'Neues Spiel'}
      </button>
      <div className="mt-3">
        <LeaveRoomButton onLeave={onLeave} />
      </div>
    </div>
  )
}
