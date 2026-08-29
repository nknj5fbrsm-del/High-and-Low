import type {
  DealResult,
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

export function canFormOpeningPair(cards: FactCard[]): boolean {
  const counts = new Map<string, number>()
  for (const card of cards) {
    counts.set(card.axis, (counts.get(card.axis) ?? 0) + 1)
  }
  return [...counts.values()].some((count) => count >= 2)
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

export function dealOpeningPair(
  pool: FactCard[],
  pick: CardPick = pickRandom,
): DealResult | null {
  const axes = [...new Set(pool.map((card) => card.axis))]
  const viable = axes.filter((axis) => cardsOfAxis(pool, axis).length >= 2)
  if (viable.length === 0) return null

  const axisCards = viable.map((axis) => cardsOfAxis(pool, axis)[0])
  const chosenAxis = pick(axisCards).axis
  const group = cardsOfAxis(pool, chosenAxis)
  const current = pick(group)
  const next = pick(group.filter((card) => card.id !== current.id))
  return {
    current,
    next,
    remaining: withoutIds(pool, [current.id, next.id]),
  }
}

export function dealAfterReference(
  remaining: FactCard[],
  catalog: FactCard[],
  reference: FactCard,
  pick: CardPick = pickRandom,
): DealResult {
  const sameAxis = cardsOfAxis(
    remaining.filter((card) => card.id !== reference.id),
    reference.axis,
  )

  if (sameAxis.length > 0) {
    const next = pick(sameAxis)
    return {
      current: reference,
      next,
      remaining: withoutIds(remaining, [next.id]),
    }
  }

  let freshPool = remaining.filter((card) => card.id !== reference.id)
  if (!canFormOpeningPair(freshPool)) {
    freshPool = withoutIds(catalog, [reference.id])
    if (!canFormOpeningPair(freshPool)) {
      freshPool = catalog
    }
  }

  const opening = dealOpeningPair(freshPool, pick)
  if (!opening) {
    throw new Error('Kein Kartenpaar mehr möglich')
  }
  return opening
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

  const reference = correct ? input.next : input.current
  const deal = dealAfterReference(input.remaining, input.catalog, reference, pick)

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
