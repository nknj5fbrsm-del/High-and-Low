import { ADULT_DECK, KIDS_DECK, axesInDeck } from './deck.ts'
import {
  canFormOpeningPair,
  cardsOfAxis,
  dealFreshPair,
  dealOpeningPair,
  isGuessCorrect,
  isMyTurn,
  pickFirst,
  resolveGuess,
  usedIdsFrom,
} from './gameLogic.ts'
import { MAX_LIVES } from './types.ts'
import type { Axis, FactCard } from './types.ts'

const kg = (id: string, value: number): FactCard => ({
  id,
  title: id,
  value,
  unit: 'kg',
  axis: 'weight',
})
const m = (id: string, value: number): FactCard => ({
  id,
  title: id,
  value,
  unit: 'm',
  axis: 'height',
})

const miniDeck: FactCard[] = [
  kg('a', 10),
  kg('b', 20),
  kg('c', 30),
  m('d', 100),
  m('e', 300),
]

describe('Deck', () => {
  it('hat mindestens 80 Erwachsenen- und 40 Kinderkarten', () => {
    expect(ADULT_DECK.length).toBeGreaterThanOrEqual(80)
    expect(KIDS_DECK.length).toBeGreaterThanOrEqual(40)
  })

  it('hat einzigartige IDs über beide Stapel', () => {
    const ids = [...ADULT_DECK, ...KIDS_DECK].map((card) => card.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('hat pro Achse mindestens 2 Karten und eine Einheit', () => {
    for (const deck of [ADULT_DECK, KIDS_DECK]) {
      for (const axis of axesInDeck(deck)) {
        const group = cardsOfAxis(deck, axis)
        expect(group.length).toBeGreaterThanOrEqual(2)
        expect(new Set(group.map((card) => card.unit)).size).toBe(1)
      }
    }
  })

  it('hat für jede Karte eine Achse', () => {
    const axes: Axis[] = [
      'weight',
      'price',
      'height',
      'distance',
      'year',
      'speed',
      'temp',
      'count',
      'population',
      'area',
    ]
    for (const card of [...ADULT_DECK, ...KIDS_DECK]) {
      expect(axes).toContain(card.axis)
    }
  })

  it('hat keine Elektronik-Preise', () => {
    for (const card of [...ADULT_DECK, ...KIDS_DECK]) {
      expect(card.axis).not.toBe('price')
      expect(card.unit).not.toBe('€')
    }
    expect(ADULT_DECK.find((card) => card.id === 'iphone-16')).toBeUndefined()
    expect(ADULT_DECK.find((card) => card.id === 'steam-deck')).toBeUndefined()
  })

  it('enthält Geburtsjahre der vorgesehenen Künstler', () => {
    expect(ADULT_DECK.find((card) => card.id === 'mozart')?.value).toBe(1756)
    expect(ADULT_DECK.find((card) => card.id === 'beethoven')?.value).toBe(1770)
    expect(ADULT_DECK.find((card) => card.id === 'picasso')?.value).toBe(1881)
    expect(ADULT_DECK.find((card) => card.id === 'vangogh')?.value).toBe(1853)
    expect(ADULT_DECK.find((card) => card.id === 'bach')?.value).toBe(1685)
    expect(KIDS_DECK.find((card) => card.id === 'k-mozart')?.value).toBe(1756)
    expect(KIDS_DECK.find((card) => card.id === 'k-beethoven')?.value).toBe(1770)
    expect(KIDS_DECK.find((card) => card.id === 'k-bach')?.value).toBe(1685)
    expect(KIDS_DECK.find((card) => card.id === 'k-picasso')?.value).toBe(1881)
  })

  it('enthält die vorgesehenen Vergleichspaare', () => {
    expect(ADULT_DECK.find((card) => card.id === 'wien')?.value).toBe(2.04)
    expect(ADULT_DECK.find((card) => card.id === 'hamburg')?.value).toBe(1.86)
    expect(ADULT_DECK.find((card) => card.id === 'oesterreich')?.value).toBe(83879)
    expect(ADULT_DECK.find((card) => card.id === 'tschechien')?.value).toBe(78871)
    expect(ADULT_DECK.find((card) => card.id === 'eiffelturm-hoehe')?.value).toBe(330)
    expect(ADULT_DECK.find((card) => card.id === 'empire-state')?.value).toBe(443)
    expect(KIDS_DECK.find((card) => card.id === 'k-eiffel')?.value).toBe(330)
    expect(KIDS_DECK.find((card) => card.id === 'k-dom')?.value).toBe(157)
    expect(KIDS_DECK.find((card) => card.id === 'k-tiger')?.value).toBeGreaterThan(
      KIDS_DECK.find((card) => card.id === 'k-loewe')?.value ?? 0,
    )
    expect(KIDS_DECK.find((card) => card.id === 'k-de')?.value).toBe(84)
    expect(KIDS_DECK.find((card) => card.id === 'k-it')?.value).toBe(59)
  })
})

describe('isGuessCorrect', () => {
  const low = kg('low', 10)
  const high = kg('high', 50)
  const same = kg('same', 10)

  it('wertet höher richtig', () => {
    expect(isGuessCorrect(low, high, 'higher')).toBe(true)
    expect(isGuessCorrect(high, low, 'higher')).toBe(false)
  })

  it('wertet niedriger richtig', () => {
    expect(isGuessCorrect(high, low, 'lower')).toBe(true)
    expect(isGuessCorrect(low, high, 'lower')).toBe(false)
  })

  it('zählt gleiche Werte als richtig', () => {
    expect(isGuessCorrect(low, same, 'higher')).toBe(true)
    expect(isGuessCorrect(low, same, 'lower')).toBe(true)
  })
})

describe('dealOpeningPair', () => {
  it('zieht zwei Karten derselben Achse passend zur Dichte', () => {
    const deal = dealOpeningPair(miniDeck, 'locker', pickFirst)
    expect(deal).not.toBeNull()
    expect(deal?.current.axis).toBe(deal?.next.axis)
    expect(deal?.current.id).not.toBe(deal?.next.id)
    expect(deal?.remaining).toHaveLength(miniDeck.length - 2)
  })

  it('gibt null zurück, wenn kein Dichte-Paar existiert', () => {
    expect(dealOpeningPair([kg('a', 1), m('d', 2)], 'locker', pickFirst)).toBeNull()
  })
})

describe('dealFreshPair', () => {
  it('legt ein komplett neues Paar und wechselt die Kategorie', () => {
    const remaining = [kg('a', 10), kg('b', 20), kg('c', 30), m('d', 100), m('e', 300)]
    const deal = dealFreshPair(remaining, miniDeck, 'locker', 'weight', pickFirst)
    expect(deal).not.toBeNull()
    expect(deal?.current.axis).toBe('height')
    expect(deal?.next.axis).toBe('height')
    expect(deal?.current.id).not.toBe('a')
    expect(['d', 'e']).toContain(deal?.current.id)
    expect(['d', 'e']).toContain(deal?.next.id)
  })

  it('macht die rechte Karte nicht zur nächsten linken', () => {
    const right = kg('b', 20)
    const remaining = [kg('c', 30), m('d', 100), m('e', 300)]
    const deal = dealFreshPair(remaining, miniDeck, 'locker', right.axis, pickFirst)
    expect(deal?.current.id).not.toBe(right.id)
    expect(deal?.current.axis).not.toBe(right.axis)
  })

  it('gibt null zurück statt dieselbe Kategorie nochmal zu legen', () => {
    const onlyKg = [kg('a', 10), kg('b', 20), kg('c', 30)]
    expect(dealFreshPair(onlyKg, onlyKg, 'locker', 'weight', pickFirst)).toBeNull()
  })

  it('kann die linke und rechte Karte tauschen', () => {
    const pickLast = (cards: FactCard[]) => cards[cards.length - 1]
    const deal = dealOpeningPair([m('d', 100), m('e', 300)], 'locker', pickLast)
    expect(deal?.current.id).toBe('e')
    expect(deal?.next.id).toBe('d')
  })
})

describe('resolveGuess', () => {
  it('erhöht den Streak und rotiert den Zug bei richtig', () => {
    const current = kg('a', 10)
    const next = kg('b', 20)
    const remaining = [kg('c', 30), m('d', 100), m('e', 300)]
    const result = resolveGuess({
      current,
      next,
      remaining,
      catalog: miniDeck,
      lives: MAX_LIVES,
      streak: 4,
      currentPlayerIndex: 0,
      playerCount: 3,
      guess: 'higher',
      turnNonce: 7,
      density: 'locker',
      pick: pickFirst,
    })

    expect(result.correct).toBe(true)
    expect(result.streak).toBe(5)
    expect(result.lives).toBe(3)
    expect(result.currentPlayerIndex).toBe(1)
    expect(result.turnNonce).toBe(8)
    expect(result.gameStatus).toBe('playing')
    expect(result.current.id).not.toBe('b')
    expect(result.current.axis).not.toBe('weight')
    expect(result.current.axis).toBe(result.next.axis)
    expect(result.lastResult.card.id).toBe('b')
  })

  it('zieht ein Leben ab und gibt den Zug weiter bei falsch', () => {
    const result = resolveGuess({
      current: kg('a', 10),
      next: kg('b', 20),
      remaining: [kg('c', 30), m('d', 100), m('e', 300)],
      catalog: miniDeck,
      lives: 3,
      streak: 2,
      currentPlayerIndex: 2,
      playerCount: 3,
      guess: 'lower',
      turnNonce: 0,
      density: 'locker',
      pick: pickFirst,
    })

    expect(result.correct).toBe(false)
    expect(result.lives).toBe(2)
    expect(result.streak).toBe(2)
    expect(result.currentPlayerIndex).toBe(0)
    expect(result.current.id).not.toBe('a')
    expect(result.current.axis).not.toBe('weight')
    expect(result.gameStatus).toBe('playing')
  })

  it('beendet das Spiel bei 0 Leben', () => {
    const result = resolveGuess({
      current: kg('a', 10),
      next: kg('b', 20),
      remaining: [kg('c', 30), m('d', 100), m('e', 300)],
      catalog: miniDeck,
      lives: 1,
      streak: 9,
      currentPlayerIndex: 1,
      playerCount: 3,
      guess: 'lower',
      turnNonce: 3,
      density: 'locker',
      pick: pickFirst,
    })

    expect(result.lives).toBe(0)
    expect(result.gameStatus).toBe('game_over')
    expect(result.streak).toBe(9)
    expect(result.currentPlayerIndex).toBe(2)
  })

  it('wechselt die Kategorie ohne extra Leben zu verlieren', () => {
    const result = resolveGuess({
      current: kg('a', 10),
      next: kg('c', 30),
      remaining: [m('d', 100), m('e', 300)],
      catalog: miniDeck,
      lives: 3,
      streak: 0,
      currentPlayerIndex: 0,
      playerCount: 3,
      guess: 'higher',
      turnNonce: 1,
      density: 'locker',
      pick: pickFirst,
    })

    expect(result.correct).toBe(true)
    expect(result.lives).toBe(3)
    expect(result.current.unit).toBe('m')
    expect(result.next.unit).toBe('m')
  })
})

describe('Turnier-Helfer', () => {
  it('erkennt den aktuellen Spieler', () => {
    expect(
      isMyTurn(
        {
          players: [
            { id: 'p1', name: 'Max' },
            { id: 'p2', name: 'Nils' },
            { id: 'p3', name: 'Anna' },
          ],
          current_player_index: 1,
        },
        'p2',
      ),
    ).toBe(true)
    expect(
      isMyTurn(
        {
          players: [
            { id: 'p1', name: 'Max' },
            { id: 'p2', name: 'Nils' },
          ],
          current_player_index: 0,
        },
        'p2',
      ),
    ).toBe(false)
  })

  it('berechnet used_card_ids als Katalog minus Reststapel', () => {
    const remaining = [kg('c', 30)]
    expect(usedIdsFrom(miniDeck, remaining).sort()).toEqual(['a', 'b', 'd', 'e'])
  })

  it('weiß, wann ein Opening-Paar möglich ist', () => {
    expect(canFormOpeningPair(miniDeck)).toBe(true)
    expect(canFormOpeningPair([kg('a', 1)])).toBe(false)
  })
})
