import { dealerLine, guessLabels, isSoloRoom, livesForRoom } from '../axis.ts'
import { isMyTurn } from '../gameLogic.ts'
import { playRevealSound, isSoundMuted, toggleSoundMuted } from '../lib/sounds.ts'
import { MAX_LIVES, REVEAL_MS } from '../types.ts'
import type { Guess, RoomState } from '../types.ts'
import { FactCardView } from './FactCardView.tsx'
import { GameHeader, Lives } from './GameHeader.tsx'
import { LeaveRoomButton } from './LeaveRoomButton.tsx'
import { useEffect, useRef, useState } from 'react'

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
  const [muted, setMuted] = useState(() => isSoundMuted())
  const heardNonce = useRef<number | null>(null)
  const mine = isMyTurn(room, playerId)
  const currentName = room.players[room.current_player_index]?.name ?? 'jemanden'
  const last = room.last_result
  const revealing = last && revealDoneFor !== room.turn_nonce ? last : null
  const solo = isSoloRoom(room)
  const versus = room.play_style === 'versus'
  const myLives = versus ? (room.player_lives[playerId] ?? 0) : room.lives

  useEffect(() => {
    if (!room.last_result) return
    if (heardNonce.current !== room.turn_nonce) {
      heardNonce.current = room.turn_nonce
      playRevealSound(room.last_result.correct)
    }
    const timer = window.setTimeout(() => setRevealDoneFor(room.turn_nonce), REVEAL_MS)
    return () => window.clearTimeout(timer)
  }, [room.last_result, room.turn_nonce])
  const canGuess = mine && !revealing && !busy && room.game_status === 'playing'
  const reference = revealing ? revealing.reference : room.current_card
  const mystery = revealing ? revealing.card : room.next_card
  const labels = reference ? guessLabels(reference.axis) : guessLabels('height')
  const maxLives = livesForRoom()
  const remark =
    revealing && reference && mystery
      ? dealerLine(reference.value, mystery.value, reference.axis)
      : null

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
        lives={myLives}
        maxLives={maxLives}
        roomCode={room.room_code}
        solo={solo}
        versus={versus}
        muted={muted}
        onToggleMute={() => setMuted(toggleSoundMuted())}
      />

      {versus && !solo && (
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-khaki">
          {room.players.map((player) => {
            const lives = room.player_lives[player.id] ?? 0
            const active = room.players[room.current_player_index]?.id === player.id
            return (
              <li key={player.id} className={active ? 'text-cream' : lives === 0 ? 'opacity-40' : ''}>
                <span className="font-medium">{player.name}</span>{' '}
                <Lives lives={lives} maxLives={MAX_LIVES} />
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-4 text-center">
        <p className="font-serif text-lg text-cream">
          {revealing
            ? revealing.correct
              ? 'Richtig.'
              : 'Falsch.'
            : solo || mine
              ? 'Dein Blatt.'
              : `Warten auf ${currentName}`}
        </p>
        {revealing?.correct && !versus && (
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
