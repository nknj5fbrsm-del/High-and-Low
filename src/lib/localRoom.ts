import { ADULT_DECK } from '../deck.ts'
import { normalizeDensity } from '../density.ts'
import { dealOpeningPair, resolveGuess, usedIdsFrom } from '../gameLogic.ts'
import { trimName } from '../format.ts'
import { MAX_LIVES, SOLO_PLAYERS } from '../types.ts'
import type { Density, Guess, RoomState } from '../types.ts'

const LOCAL_ROOM_KEY = 'high-low-team-stapel.localRoom'

export function openSoloRoom(input: {
  playerId: string
  name: string
  density?: Density
}): RoomState {
  const name = trimName(input.name)
  if (name.length < 1) {
    throw new Error('Bitte gib einen Namen (1–20 Zeichen) ein.')
  }
  const density = normalizeDensity(input.density)
  const deal = dealOpeningPair(ADULT_DECK, density)
  if (!deal) throw new Error('Kartenstapel ist unvollständig.')
  return {
    room_code: 'SOLO',
    players: [{ id: input.playerId, name }],
    host_id: input.playerId,
    current_player_index: 0,
    lives: MAX_LIVES,
    streak: 0,
    current_card: deal.current,
    next_card: deal.next,
    remaining_cards: deal.remaining,
    used_card_ids: usedIdsFrom(ADULT_DECK, deal.remaining),
    game_status: 'playing',
    last_result: null,
    turn_nonce: 1,
    max_players: SOLO_PLAYERS,
    play_style: 'team',
    player_lives: {},
    winner_id: null,
    selected_density: density,
  }
}

export function applyLocalGuess(room: RoomState, playerId: string, guess: Guess): RoomState {
  if (room.game_status !== 'playing') throw new Error('Gerade ist keine Runde offen.')
  if (room.players[room.current_player_index]?.id !== playerId) {
    throw new Error('Du bist nicht dran.')
  }
  if (!room.current_card || !room.next_card) throw new Error('Karten fehlen.')
  const resolved = resolveGuess({
    current: room.current_card,
    next: room.next_card,
    remaining: room.remaining_cards,
    catalog: ADULT_DECK,
    lives: room.lives,
    streak: room.streak,
    currentPlayerIndex: room.current_player_index,
    playerCount: room.players.length,
    guess,
    turnNonce: room.turn_nonce,
    density: room.selected_density,
    playStyle: room.play_style,
    players: room.players,
    playerLives: room.player_lives,
  })
  return {
    ...room,
    lives: resolved.lives,
    streak: resolved.streak,
    current_player_index: resolved.currentPlayerIndex,
    current_card: resolved.current,
    next_card: resolved.next,
    remaining_cards: resolved.remaining,
    used_card_ids: resolved.usedCardIds,
    game_status: resolved.gameStatus,
    last_result: resolved.lastResult,
    turn_nonce: resolved.turnNonce,
    player_lives: resolved.playerLives,
    winner_id: resolved.winnerId,
  }
}

export function restartLocalRoom(room: RoomState): RoomState {
  const player = room.players.find((entry) => entry.id === room.host_id) ?? room.players[0]
  return openSoloRoom({
    playerId: player?.id ?? room.host_id,
    name: player?.name ?? 'Spieler',
    density: room.selected_density,
  })
}

export function readLocalRoom(playerId: string): RoomState | null {
  try {
    const raw = sessionStorage.getItem(LOCAL_ROOM_KEY)
    if (!raw) return null
    const room = JSON.parse(raw) as RoomState
    if (!room?.players?.some((player) => player.id === playerId)) return null
    if (room.max_players !== SOLO_PLAYERS) return null
    return room
  } catch {
    return null
  }
}

export function writeLocalRoom(room: RoomState | null): void {
  try {
    if (!room) sessionStorage.removeItem(LOCAL_ROOM_KEY)
    else sessionStorage.setItem(LOCAL_ROOM_KEY, JSON.stringify(room))
  } catch {
    // privater Modus
  }
}
