import { listValidPairs } from './density.ts'
import type {
  DealResult,
  Density,
  FactCard,
  GameStatus,
  Guess,
  LastResult,
  Player,
} from './types.ts'

export type CardPick = (cards: FactCard[]) => FactCard

export const pickFirst: CardPick = (cards) => {
  if (cards.length === 0) {
    throw new Error('Keine Karten zum Ziehen')
  }
  return cards[0]
}

export const pickRandom: CardPick = (cards) => {
  if (cards.length === 0) {
    throw new Error('Keine Karten zum Ziehen')
  }
  return cards[Math.floor(Math.random() * cards.length)]
}

export function cardsOfUnit(cards: FactCard[], unit: string): FactCard[] {
  return cards.filter((card) => card.unit === unit)
}

export function cardsOfAxis(cards: FactCard[], axis: string): FactCard[] {
  return cards.filter((card) => card.axis === axis)
}

export function withoutIds(cards: FactCard[], ids: string[]): FactCard[] {
  const skip = new Set(ids)
  return cards.filter((card) => !skip.has(card.id))
}

export function canFormOpeningPair(
  cards: FactCard[],
  density: Density = 'knackig',
  excludeAxis: string | null = null,
): boolean {
  return listValidPairs(cards, density, excludeAxis).length > 0
}

export function usedIdsFrom(catalog: FactCard[], remaining: FactCard[]): string[] {
  const rest = new Set(remaining.map((card) => card.id))
  return catalog.filter((card) => !rest.has(card.id)).map((card) => card.id)
}

export function isGuessCorrect(current: FactCard, next: FactCard, guess: Guess): boolean {
  if (next.value === current.value) return true
  if (guess === 'higher') return next.value > current.value
  return next.value < current.value
}

export function isMyTurn(
  room: { players: Player[]; current_player_index: number },
  playerId: string,
): boolean {
  return room.players[room.current_player_index]?.id === playerId
}

function pickPair(
  pairs: [FactCard, FactCard][],
  pick: CardPick,
): [FactCard, FactCard] | null {
  if (pairs.length === 0) return null
  const anchors = pairs.map(([left]) => left)
  const current = pick(anchors)
  const mates = pairs
    .filter(([left, right]) => left.id === current.id || right.id === current.id)
    .map(([left, right]) => (left.id === current.id ? right : left))
  const next = pick(mates)
  return [current, next]
}

export function dealFreshPair(
  pool: FactCard[],
  catalog: FactCard[],
  density: Density,
  excludeAxis: string | null = null,
  pick: CardPick = pickRandom,
): DealResult | null {
  const fromPool = pickPair(listValidPairs(pool, density, excludeAxis), pick)
  if (fromPool) {
    const [current, next] = fromPool
    return {
      current,
      next,
      remaining: withoutIds(pool, [current.id, next.id]),
    }
  }

  const recycled = pickPair(listValidPairs(catalog, density, excludeAxis), pick)
  if (recycled) {
    const [current, next] = recycled
    return {
      current,
      next,
      remaining: withoutIds(catalog, [current.id, next.id]),
    }
  }

  const fallback = pickPair(listValidPairs(catalog, density, null), pick)
  if (!fallback) return null
  const [current, next] = fallback
  return {
    current,
    next,
    remaining: withoutIds(catalog, [current.id, next.id]),
  }
}

export function dealOpeningPair(
  pool: FactCard[],
  density: Density = 'knackig',
  pick: CardPick = pickRandom,
): DealResult | null {
  return dealFreshPair(pool, pool, density, null, pick)
}

export function resolveGuess(input: {
  current: FactCard
  next: FactCard
  remaining: FactCard[]
  catalog: FactCard[]
  lives: number
  streak: number
  currentPlayerIndex: number
  playerCount: number
  guess: Guess
  turnNonce: number
  density: Density
  pick?: CardPick
}): {
  correct: boolean
  lives: number
  streak: number
  currentPlayerIndex: number
  current: FactCard
  next: FactCard
  remaining: FactCard[]
  usedCardIds: string[]
  gameStatus: GameStatus
  lastResult: LastResult
  turnNonce: number
} {
  const pick = input.pick ?? pickRandom
  const correct = isGuessCorrect(input.current, input.next, input.guess)
  const currentPlayerIndex = (input.currentPlayerIndex + 1) % input.playerCount
  const turnNonce = input.turnNonce + 1
  const lastResult: LastResult = {
    correct,
    guess: input.guess,
    card: input.next,
    reference: input.current,
  }

  if (!correct && input.lives - 1 <= 0) {
    return {
      correct,
      lives: 0,
      streak: input.streak,
      currentPlayerIndex,
      current: input.current,
      next: input.next,
      remaining: input.remaining,
      usedCardIds: usedIdsFrom(input.catalog, input.remaining),
      gameStatus: 'game_over',
      lastResult,
      turnNonce,
    }
  }

  const deal = dealFreshPair(
    input.remaining,
    input.catalog,
    input.density,
    input.current.axis,
    pick,
  )
  if (!deal) {
    throw new Error('Kein Kartenpaar mehr möglich')
  }

  return {
    correct,
    lives: correct ? input.lives : input.lives - 1,
    streak: correct ? input.streak + 1 : input.streak,
    currentPlayerIndex,
    current: deal.current,
    next: deal.next,
    remaining: deal.remaining,
    usedCardIds: usedIdsFrom(input.catalog, deal.remaining),
    gameStatus: 'playing',
    lastResult,
    turnNonce,
  }
}
