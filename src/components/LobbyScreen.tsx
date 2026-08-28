import { useState } from 'react'
import type { Player, RoomState } from '../types.ts'
import { MAX_PLAYERS } from '../types.ts'
import { normalizeRoomCode } from '../format.ts'

export function LobbyScreen({
  name,
  onNameChange,
  joinCode,
  onJoinCodeChange,
  room,
  playerId,
  error,
  busy,
  onCreate,
  onJoin,
  onStart,
  onLeave,
}: {
  name: string
  onNameChange: (value: string) => void
  joinCode: string
  onJoinCodeChange: (value: string) => void
  room: RoomState | null
  playerId: string
  error: string | null
  busy: boolean
  onCreate: () => void
  onJoin: () => void
  onStart: () => void
  onLeave: () => void
}) {
  const [copied, setCopied] = useState(false)
  const isHost = room?.host_id === playerId
  const players: Player[] = room?.players ?? []
  const inRoom = Boolean(room)

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
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-400">Koop · 3 Spieler</p>
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
          else onCreate()
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
            <button
              type="button"
              onClick={onCreate}
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

        {inRoom && (
          <section>
            <p className="text-sm font-medium text-zinc-400">
              Spieler {players.length}/{MAX_PLAYERS}
            </p>
            <ul className="mt-3 space-y-2">
              {Array.from({ length: MAX_PLAYERS }, (_, index) => {
                const player = players[index]
                return (
                  <li
                    key={player?.id ?? `empty-${index}`}
                    className="flex h-12 items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4"
                  >
                    <span className={player ? 'font-medium text-white' : 'text-zinc-600'}>
                      {player ? player.name : 'Warten …'}
                    </span>
                    {player && player.id === room?.host_id && (
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

        {error && (
          <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        {inRoom && isHost && players.length === MAX_PLAYERS && (
          <button
            type="button"
            onClick={onStart}
            disabled={busy}
            className="h-14 w-full rounded-2xl bg-lime-400 text-lg font-bold text-zinc-950 disabled:opacity-40"
          >
            Spiel starten
          </button>
        )}

        {inRoom && !isHost && players.length === MAX_PLAYERS && (
          <p className="text-center text-sm text-zinc-500">Warte, bis der Host startet …</p>
        )}

        {inRoom && (
          <button type="button" onClick={onLeave} className="text-sm text-zinc-500 underline-offset-4 hover:underline">
            Raum verlassen
          </button>
        )}
      </form>
    </div>
  )
}
