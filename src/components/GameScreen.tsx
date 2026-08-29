import { dealerLine, guessLabels, isSoloRoom, livesForMode } from '../axis.ts'
import { isMyTurn } from '../gameLogic.ts'
import { REVEAL_MS } from '../types.ts'
import type { Guess, RoomState } from '../types.ts'
import { FactCardView } from './FactCardView.tsx'
import { GameHeader } from './GameHeader.tsx'
import { LeaveRoomButton } from './LeaveRoomButton.tsx'
import { useEffect, useState } from 'react'

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
  const solo = isSoloRoom(room)

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
  const remark =
    revealing && reference && mystery ? dealerLine(reference.value, mystery.value) : null

  if (!reference || !mystery) {
    return (
      <div className="page-table flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
        <p className="text-khaki">Karten werden gelegt …</p>
        <LeaveRoomButton onLeave={onLeave} />
      </div>
    )
  }

  return (
    <div className="page-table flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <GameHeader
        streak={room.streak}
        lives={room.lives}
        maxLives={maxLives}
        roomCode={room.room_code}
        solo={solo}
      />

      <div className="mt-4 text-center">
        <p className="font-serif text-lg text-cream">
          {revealing ? (revealing.correct ? 'Richtig.' : 'Falsch.') : solo || mine ? 'Dein Blatt.' : `Warten auf ${currentName}`}
        </p>
        {revealing?.correct && (
          <p className="reward-pop mt-1 font-number text-sm font-semibold text-khaki">
            +1{room.streak >= 3 ? ` · Serie ${room.streak}` : ''}
          </p>
        )}
        {remark && <p className="mt-1 font-serif text-sm italic text-khaki">{remark}</p>}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        <FactCardView card={reference} label="Gelegt" tone="reference" />
        <FactCardView
          card={mystery}
          label="Nächste Karte"
          tone={revealing ? (revealing.correct ? 'correct' : 'wrong') : 'hidden'}
          hideValue={!revealing}
        />
      </div>

      {error && <p className="mt-4 text-center text-sm text-khaki">{error}</p>}

      {canGuess && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => onGuess('higher')} className="tab-btn tab-btn-burgundy">
            {labels.higher}
          </button>
          <button type="button" onClick={() => onGuess('lower')} className="tab-btn tab-btn-khaki">
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
