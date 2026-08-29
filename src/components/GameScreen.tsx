import { useEffect, useState } from 'react'
import { FactCardView } from './FactCardView.tsx'
import { GameHeader } from './GameHeader.tsx'
import { LeaveRoomButton } from './LeaveRoomButton.tsx'
import { guessLabels, livesForMode } from '../axis.ts'
import { isMyTurn } from '../gameLogic.ts'
import { REVEAL_MS } from '../types.ts'
import type { Guess, RoomState } from '../types.ts'

export function GameScreen({
  room,
  playerId,
  busy,
  error,
  onGuess,
  onLeave,
}: {
  room: RoomState
  playerId: string
  busy: boolean
  error: string | null
  onGuess: (guess: Guess) => void
  onLeave: () => void
}) {
  const [revealDoneFor, setRevealDoneFor] = useState<number | null>(null)
  const mine = isMyTurn(room, playerId)
  const currentName = room.players[room.current_player_index]?.name ?? 'jemanden'
  const last = room.last_result
  const revealing = last && revealDoneFor !== room.turn_nonce ? last : null

  useEffect(() => {
    if (!room.last_result) return
    const timer = window.setTimeout(() => setRevealDoneFor(room.turn_nonce), REVEAL_MS)
    return () => window.clearTimeout(timer)
  }, [room.last_result, room.turn_nonce])
  const canGuess = mine && !revealing && !busy && room.game_status === 'playing'
  const reference = revealing ? revealing.reference : room.current_card
  const mystery = revealing ? revealing.card : room.next_card
  const labels = reference ? guessLabels(reference.axis) : guessLabels('height')
  const maxLives = livesForMode(room.selected_mode)

  if (!reference || !mystery) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
        <p className="text-zinc-400">Karten werden vorbereitet …</p>
        <LeaveRoomButton onLeave={onLeave} />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <GameHeader
        streak={room.streak}
        lives={room.lives}
        maxLives={maxLives}
        roomCode={room.room_code}
      />

      <div
        className={`relative mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${
          revealing
            ? revealing.correct
              ? 'bg-lime-400/15 text-lime-300'
              : 'bg-rose-500/15 text-rose-300'
            : mine
              ? 'bg-lime-400/15 text-lime-300'
              : 'bg-zinc-800 text-zinc-400'
        }`}
      >
        {revealing ? (
          revealing.correct ? (
            <span className="inline-flex flex-wrap items-center justify-center gap-2">
              Richtig!
              <span className="reward-pop font-display text-2xl font-extrabold text-lime-200">+1</span>
              {room.streak >= 3 && (
                <span className="reward-pop rounded-full bg-amber-300/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200">
                  Combo ×{room.streak}
                </span>
              )}
            </span>
          ) : (
            'Falsch!'
          )
        ) : mine ? (
          'Du bist dran!'
        ) : (
          `Warten auf ${currentName}…`
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        <FactCardView card={reference} label="Referenz" tone="reference" />
        <FactCardView
          card={mystery}
          label="Nächste Karte"
          tone={revealing ? (revealing.correct ? 'correct' : 'wrong') : 'hidden'}
          hideValue={!revealing}
        />
      </div>

      {error && <p className="mt-4 text-center text-sm text-rose-300">{error}</p>}

      {canGuess && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onGuess('higher')}
            className="h-16 rounded-2xl bg-lime-400 text-xl font-extrabold tracking-wide text-zinc-950"
          >
            {labels.higher}
          </button>
          <button
            type="button"
            onClick={() => onGuess('lower')}
            className="h-16 rounded-2xl bg-orange-500 text-xl font-extrabold tracking-wide text-zinc-950"
          >
            {labels.lower}
          </button>
        </div>
      )}

      <div className="mt-4">
        <LeaveRoomButton onLeave={onLeave} />
      </div>
    </div>
  )
}
