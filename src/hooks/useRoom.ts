import { useCallback, useEffect, useState } from 'react'
import { normalizeRoomCode, trimName } from '../format.ts'
import { loadIdentity, saveIdentity } from '../lib/identity.ts'
import { supabase } from '../lib/supabase.ts'
import type { Guess, Player, RoomState } from '../types.ts'

function asRoom(data: unknown): RoomState {
  const row = data as RoomState
  return {
    ...row,
    players: row.players ?? [],
    remaining_cards: row.remaining_cards ?? [],
    used_card_ids: row.used_card_ids ?? [],
    current_card: row.current_card ?? null,
    next_card: row.next_card ?? null,
    last_result: row.last_result ?? null,
  }
}

function rpcMessage(error: { message: string }): string {
  const message = error.message.replace(/^.*ERROR:\s*/i, '').trim()
  if (message.toLowerCase().includes('fetch') || message.toLowerCase().includes('network')) {
    return 'Keine Verbindung. Prüfe Netz und Supabase-URL.'
  }
  return message || 'Etwas ist schiefgelaufen.'
}

export function useRoom() {
  const [identity, setIdentity] = useState(() => loadIdentity())
  const [room, setRoom] = useState<RoomState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [restoring, setRestoring] = useState(
    () => Boolean(loadIdentity().roomCode) && Boolean(supabase),
  )

  const playerId = identity.playerId

  const applyRoom = useCallback((next: RoomState | null) => {
    setRoom(next)
    if (next) {
      setIdentity(saveIdentity({ roomCode: next.room_code }))
    }
  }, [])

  useEffect(() => {
    if (!supabase || !identity.roomCode) {
      return
    }
    const client = supabase
    const code = identity.roomCode
    let cancelled = false

    async function restore() {
      const { data, error: fetchError } = await client
        .from('rooms')
        .select('*')
        .eq('room_code', code)
        .maybeSingle()

      if (cancelled) return
      if (fetchError) {
        setError(rpcMessage(fetchError))
        setRestoring(false)
        return
      }
      if (!data) {
        setIdentity(saveIdentity({ roomCode: null }))
        setRestoring(false)
        return
      }
      const next = asRoom(data)
      const stillIn = next.players.some((player: Player) => player.id === playerId)
      if (!stillIn) {
        setIdentity(saveIdentity({ roomCode: null }))
        setRestoring(false)
        return
      }
      setRoom(next)
      setRestoring(false)
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [identity.roomCode, playerId])

  useEffect(() => {
    if (!supabase || !room?.room_code) return

    const client = supabase
    const channel = client
      .channel(`room:${room.room_code}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `room_code=eq.${room.room_code}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            setRoom(asRoom(payload.new))
          }
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [room?.room_code])

  const runRpc = useCallback(
    async (fn: string, args: Record<string, unknown>) => {
      if (!supabase) {
        setError('Supabase ist nicht konfiguriert.')
        return
      }
      setBusy(true)
      setError(null)
      const { data, error: rpcError } = await supabase.rpc(fn, args)
      if (rpcError) {
        setError(rpcMessage(rpcError))
        setBusy(false)
        return
      }
      applyRoom(asRoom(data))
      setBusy(false)
    },
    [applyRoom],
  )

  const createRoom = useCallback(
    async (name: string) => {
      const trimmed = trimName(name)
      setIdentity(saveIdentity({ name: trimmed }))
      await runRpc('create_room', { p_player_id: playerId, p_name: trimmed })
    },
    [playerId, runRpc],
  )

  const joinRoom = useCallback(
    async (code: string, name: string) => {
      const trimmed = trimName(name)
      const roomCode = normalizeRoomCode(code)
      setIdentity(saveIdentity({ name: trimmed }))
      await runRpc('join_room', {
        p_room_code: roomCode,
        p_player_id: playerId,
        p_name: trimmed,
      })
    },
    [playerId, runRpc],
  )

  const startGame = useCallback(async () => {
    if (!room) return
    await runRpc('start_game', { p_room_code: room.room_code, p_player_id: playerId })
  }, [playerId, room, runRpc])

  const submitGuess = useCallback(
    async (guess: Guess) => {
      if (!room) return
      await runRpc('submit_guess', {
        p_room_code: room.room_code,
        p_player_id: playerId,
        p_guess: guess,
        p_turn_nonce: room.turn_nonce,
      })
    },
    [playerId, room, runRpc],
  )

  const restartGame = useCallback(async () => {
    if (!room) return
    await runRpc('restart_game', { p_room_code: room.room_code, p_player_id: playerId })
  }, [playerId, room, runRpc])

  const leaveRoom = useCallback(() => {
    setRoom(null)
    setError(null)
    setIdentity(saveIdentity({ roomCode: null }))
  }, [])

  return {
    identity,
    playerId,
    room,
    error,
    busy,
    restoring,
    createRoom,
    joinRoom,
    startGame,
    submitGuess,
    restartGame,
    leaveRoom,
  }
}
