import { useState } from 'react'
import { modeLabel, voteCounts } from '../axis.ts'
import { DEFAULT_PLAYERS, MAX_PLAYERS, MIN_PLAYERS } from '../types.ts'
import type { GameMode, Player, RoomState } from '../types.ts'
import { normalizeRoomCode } from '../format.ts'
import { LeaveRoomButton } from './LeaveRoomButton.tsx'

const PLAYER_OPTIONS = Array.from(
  { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
  (_, index) => MIN_PLAYERS + index,
)

export function LobbyScreen({
  name,
  onNameChange,
  joinCode,
  onJoinCodeChange,
  room,
  storedRoomCode = null,
  playerId,
  error,
  busy,
  onCreate,
  onJoin,
  onStart,
  onVote,
  onSolo,
  onStartMode,
  onLeave,
}: {
  name: string
  onNameChange: (value: string) => void
  joinCode: string
  onJoinCodeChange: (value: string) => void
  room: RoomState | null
  storedRoomCode?: string | null
  playerId: string
  error: string | null
  busy: boolean
  onCreate: (maxPlayers: number) => void
  onJoin: () => void
  onStart: () => void
  onVote: (mode: GameMode) => void
  onSolo: (mode: GameMode) => void
  onStartMode: (mode: GameMode) => void
  onLeave: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_PLAYERS)
  const isHost = room?.host_id === playerId
  const players: Player[] = room?.players ?? []
  const seats = room?.max_players ?? DEFAULT_PLAYERS
  const soloRoom = Boolean(room) && seats === 1
  const full = Boolean(room) && players.length === seats
  const inRoom = Boolean(room)
  const canLeave = Boolean(room || storedRoomCode)
  const votes = room?.votes ?? {}
  const counts = voteCounts(votes)
  const myVote = votes[playerId]

  async function copyCode() {
    if (!room) return
    try {
      await navigator.clipboard.writeText(room.room_code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="page-table flex min-h-dvh flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="pt-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-khaki">
          Karten auf dem Tisch
        </p>
        <h1 className="font-serif mt-2 text-4xl font-medium leading-none tracking-tight text-cream">
          High & Low
        </h1>
        <p className="mt-2 font-serif text-lg text-khaki">Fakten, eine Richtung, eine Serie.</p>
      </header>

      <form
        className="mt-8 flex flex-1 flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (inRoom) return
          if (joinCode.trim()) onJoin()
          else onCreate(maxPlayers)
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-khaki">Dein Name</span>
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={20}
            autoComplete="nickname"
            placeholder="z. B. Nils"
            disabled={inRoom}
            className="field-input"
          />
        </label>

        {!inRoom && (
          <section>
            <p className="text-sm font-medium text-cream">Allein spielen</p>
            <p className="mt-1 text-sm text-khaki">Kein Warten. Karte liegt, nächste bleibt zu.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={busy || name.trim().length === 0}
                onClick={() => onSolo('adult')}
                className="tab-btn tab-btn-burgundy"
              >
                Erwachsene
              </button>
              <button
                type="button"
                disabled={busy || name.trim().length === 0}
                onClick={() => onSolo('kids')}
                className="tab-btn tab-btn-khaki"
              >
                Kinder
              </button>
            </div>
          </section>
        )}

        {inRoom && room && !soloRoom ? (
          <section className="trivia-card">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-burgundy">Raumcode</p>
            <button
              type="button"
              onClick={() => void copyCode()}
              className="font-number mt-2 text-5xl font-semibold tracking-[0.18em] text-ink"
            >
              {room.room_code}
            </button>
            <p className="mt-2 text-sm text-ink/60">
              {copied ? 'Code kopiert.' : 'Tippen zum Kopieren · an die anderen weitergeben'}
            </p>
          </section>
        ) : !inRoom ? (
          <>
            <div className="relative py-1 text-center text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-khaki">
              oder zu zweit bis sechst
            </div>

            <fieldset>
              <legend className="mb-2 block text-sm font-medium text-khaki">Spielerzahl</legend>
              <div className="grid grid-cols-5 gap-2">
                {PLAYER_OPTIONS.map((count) => {
                  const selected = maxPlayers === count
                  return (
                    <button
                      key={count}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setMaxPlayers(count)}
                      className={`h-14 rounded text-lg font-bold ${
                        selected ? 'tab-btn-burgundy' : 'tab-btn-ghost'
                      }`}
                    >
                      {count}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-sm text-khaki">
                Start erst, wenn {maxPlayers} Personen am Tisch sind.
              </p>
            </fieldset>

            <button
              type="button"
              onClick={() => onCreate(maxPlayers)}
              disabled={busy || name.trim().length === 0}
              className="tab-btn tab-btn-khaki"
            >
              Raum erstellen
            </button>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-khaki">Raumcode</span>
              <input
                value={joinCode}
                onChange={(event) => onJoinCodeChange(normalizeRoomCode(event.target.value))}
                maxLength={4}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="ABCD"
                className="field-input text-center font-number text-2xl font-semibold tracking-[0.4em]"
              />
            </label>
            <button
              type="button"
              onClick={onJoin}
              disabled={busy || name.trim().length === 0 || joinCode.length !== 4}
              className="tab-btn tab-btn-ghost"
            >
              Raum beitreten
            </button>
          </>
        ) : null}

        {inRoom && room && soloRoom && (
          <section>
            <p className="font-serif text-xl text-cream">Welcher Stapel?</p>
            <p className="mt-1 text-sm text-khaki">Ein Blatt. Keine leeren Stühle.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => onStartMode('adult')}
                className="tab-btn tab-btn-burgundy"
              >
                Erwachsene
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onStartMode('kids')}
                className="tab-btn tab-btn-khaki"
              >
                Kinder
              </button>
            </div>
          </section>
        )}

        {inRoom && room && !soloRoom && (
          <section>
            <p className="text-sm font-medium text-khaki">
              Spieler {players.length}/{seats}
            </p>
            <ul className="mt-3 space-y-2">
              {Array.from({ length: seats }, (_, index) => {
                const player = players[index]
                return (
                  <li
                    key={player?.id ?? `empty-${index}`}
                    className="flex h-12 items-center justify-between rounded border-2 border-khaki/40 bg-table/40 px-4"
                  >
                    <span className={player ? 'font-medium text-cream' : 'text-khaki/70'}>
                      {player ? player.name : 'Warten …'}
                    </span>
                    {player && player.id === room.host_id && (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-khaki">
                        Host
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {inRoom && !soloRoom && (
          <section>
            <p className="text-sm font-medium text-cream">Welcher Stapel?</p>
            <p className="mt-1 text-sm text-khaki">
              Mehrheit gewinnt. Gleichstand entscheidet die Stimme des Hosts.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ModeVoteButton
                mode="adult"
                selected={myVote === 'adult'}
                count={counts.adult}
                disabled={busy}
                onVote={onVote}
                detail="3 Leben, enge Fakten"
              />
              <ModeVoteButton
                mode="kids"
                selected={myVote === 'kids'}
                count={counts.kids}
                disabled={busy}
                onVote={onVote}
                detail="5 Leben, weiterer Stapel"
              />
            </div>
          </section>
        )}

        {error && (
          <p className="rounded border-2 border-khaki bg-table px-4 py-3 text-sm text-cream">{error}</p>
        )}

        {inRoom && !soloRoom && isHost && full && (
          <button type="button" onClick={onStart} disabled={busy} className="tab-btn tab-btn-burgundy">
            Spiel starten
          </button>
        )}

        {inRoom && !soloRoom && !isHost && full && (
          <p className="text-center text-sm text-khaki">Warte, bis der Host startet …</p>
        )}

        {inRoom && !soloRoom && !full && (
          <p className="text-center text-sm text-khaki">
            Noch {seats - players.length} {seats - players.length === 1 ? 'Platz' : 'Plätze'} frei.
          </p>
        )}

        {canLeave && <LeaveRoomButton onLeave={onLeave} />}
      </form>
    </div>
  )
}

function ModeVoteButton({
  mode,
  selected,
  count,
  disabled,
  onVote,
  detail,
}: {
  mode: GameMode
  selected: boolean
  count: number
  disabled: boolean
  onVote: (mode: GameMode) => void
  detail: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onVote(mode)}
      className={`rounded px-3 py-4 text-left disabled:opacity-40 ${
        selected ? 'tab-btn-burgundy' : 'tab-btn-ghost'
      }`}
    >
      <span className="block text-lg font-bold">{modeLabel(mode)}</span>
      <span className={`mt-1 block text-xs ${selected ? 'text-cream/80' : 'text-khaki'}`}>{detail}</span>
      <span className="mt-2 block text-sm font-semibold tabular-nums">
        {count} {count === 1 ? 'Stimme' : 'Stimmen'}
      </span>
    </button>
  )
}
