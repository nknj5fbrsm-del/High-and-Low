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
  onLeave: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_PLAYERS)
  const isHost = room?.host_id === playerId
  const players: Player[] = room?.players ?? []
  const seats = room?.max_players ?? DEFAULT_PLAYERS
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
    <div className="flex min-h-dvh flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-400">
          Koop · 2–6 Spieler
        </p>
        <h1 className="font-display mt-2 text-4xl font-extrabold leading-none tracking-tight text-white">
          High & Low
        </h1>
        <p className="mt-1 text-lg font-medium text-zinc-400">Team-Stapel</p>
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
          <span className="mb-2 block text-sm font-medium text-zinc-300">Dein Name</span>
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={20}
            autoComplete="nickname"
            placeholder="z. B. Nils"
            disabled={inRoom}
            className="h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-lg text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
          />
        </label>

        {inRoom && room ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Raumcode</p>
            <button
              type="button"
              onClick={() => void copyCode()}
              className="font-display mt-2 text-5xl font-extrabold tracking-[0.2em] text-lime-300"
            >
              {room.room_code}
            </button>
            <p className="mt-2 text-sm text-zinc-500">
              {copied ? 'Code kopiert.' : 'Tippen zum Kopieren · an die anderen weitergeben'}
            </p>
          </section>
        ) : (
          <>
            <fieldset>
              <legend className="mb-2 block text-sm font-medium text-zinc-300">Spielerzahl</legend>
              <div className="grid grid-cols-5 gap-2">
                {PLAYER_OPTIONS.map((count) => {
                  const selected = maxPlayers === count
                  return (
                    <button
                      key={count}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setMaxPlayers(count)}
                      className={`h-14 rounded-2xl text-lg font-bold ${
                        selected
                          ? 'bg-lime-400 text-zinc-950'
                          : 'border border-zinc-700 bg-zinc-900 text-white'
                      }`}
                    >
                      {count}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Start erst, wenn {maxPlayers} Personen im Raum sind.
              </p>
            </fieldset>

            <button
              type="button"
              onClick={() => onCreate(maxPlayers)}
              disabled={busy || name.trim().length === 0}
              className="h-14 w-full rounded-2xl bg-lime-400 text-lg font-bold text-zinc-950 disabled:opacity-40"
            >
              Raum erstellen
            </button>

            <div className="relative py-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              oder beitreten
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">Raumcode</span>
              <input
                value={joinCode}
                onChange={(event) => onJoinCodeChange(normalizeRoomCode(event.target.value))}
                maxLength={4}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="ABCD"
                className="h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-center font-display text-2xl font-extrabold tracking-[0.4em] text-white outline-none placeholder:text-zinc-700 focus:border-lime-400"
              />
            </label>
            <button
              type="button"
              onClick={onJoin}
              disabled={busy || name.trim().length === 0 || joinCode.length !== 4}
              className="h-14 w-full rounded-2xl border border-zinc-600 text-lg font-bold text-white disabled:opacity-40"
            >
              Raum beitreten
            </button>
          </>
        )}

        {inRoom && room && (
          <section>
            <p className="text-sm font-medium text-zinc-400">
              Spieler {players.length}/{seats}
            </p>
            <ul className="mt-3 space-y-2">
              {Array.from({ length: seats }, (_, index) => {
                const player = players[index]
                return (
                  <li
                    key={player?.id ?? `empty-${index}`}
                    className="flex h-12 items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4"
                  >
                    <span className={player ? 'font-medium text-white' : 'text-zinc-600'}>
                      {player ? player.name : 'Warten …'}
                    </span>
                    {player && player.id === room.host_id && (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime-400">
                        Host
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {inRoom && (
          <section>
            <p className="text-sm font-medium text-zinc-300">Welcher Stapel?</p>
            <p className="mt-1 text-sm text-zinc-500">
              Mehrheit gewinnt. Gleichstand entscheidet die Stimme des Hosts.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ModeVoteButton
                mode="adult"
                selected={myVote === 'adult'}
                count={counts.adult}
                disabled={busy}
                onVote={onVote}
                detail="3 Leben, härtere Fakten"
              />
              <ModeVoteButton
                mode="kids"
                selected={myVote === 'kids'}
                count={counts.kids}
                disabled={busy}
                onVote={onVote}
                detail="5 Leben, leichterer Stapel"
              />
            </div>
          </section>
        )}

        {error && (
          <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        {inRoom && isHost && full && (
          <button
            type="button"
            onClick={onStart}
            disabled={busy}
            className="h-14 w-full rounded-2xl bg-lime-400 text-lg font-bold text-zinc-950 disabled:opacity-40"
          >
            Spiel starten
          </button>
        )}

        {inRoom && !isHost && full && (
          <p className="text-center text-sm text-zinc-500">Warte, bis der Host startet …</p>
        )}

        {inRoom && !full && (
          <p className="text-center text-sm text-zinc-500">
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
      className={`rounded-2xl px-3 py-4 text-left disabled:opacity-40 ${
        selected
          ? 'bg-lime-400 text-zinc-950'
          : 'border border-zinc-700 bg-zinc-900 text-white'
      }`}
    >
      <span className="block text-lg font-bold">{modeLabel(mode)}</span>
      <span className={`mt-1 block text-xs ${selected ? 'text-zinc-800' : 'text-zinc-500'}`}>
        {detail}
      </span>
      <span className="mt-2 block text-sm font-semibold tabular-nums">
        {count} {count === 1 ? 'Stimme' : 'Stimmen'}
      </span>
    </button>
  )
}
