export type Guess = 'higher' | 'lower'
export type GameStatus = 'lobby' | 'playing' | 'game_over'
export type GameMode = 'adult' | 'kids'
export type Axis =
  | 'weight'
  | 'price'
  | 'height'
  | 'distance'
  | 'year'
  | 'speed'
  | 'temp'
  | 'count'
  | 'population'
  | 'area'

export interface FactCard {
  id: string
  title: string
  value: number
  unit: string
  axis: Axis
}

export interface Player {
  id: string
  name: string
}

export interface LastResult {
  correct: boolean
  guess: Guess
  card: FactCard
  reference: FactCard
  resolved_at?: string
}

export type ModeVotes = Record<string, GameMode>

export interface RoomState {
  room_code: string
  players: Player[]
  host_id: string
  current_player_index: number
  lives: number
  streak: number
  current_card: FactCard | null
  next_card: FactCard | null
  remaining_cards: FactCard[]
  used_card_ids: string[]
  game_status: GameStatus
  last_result: LastResult | null
  turn_nonce: number
  max_players: number
  votes: ModeVotes
  selected_mode: GameMode
}

export interface DealResult {
  current: FactCard
  next: FactCard
  remaining: FactCard[]
}

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6
export const DEFAULT_PLAYERS = 3
export const SOLO_PLAYERS = 1
export const MAX_LIVES = 3
export const KIDS_LIVES = 5
export const REVEAL_MS = 1700
