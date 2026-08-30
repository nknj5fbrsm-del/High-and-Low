import { ADULT_DECK, KIDS_DECK } from './deck.ts'
import {
  axesWithPairs,
  isSubsetPair,
  listValidPairs,
  normalizeDensity,
  pairFitsDensity,
  usesYearGap,
  valueRatio,
  yearGap,
} from './density.ts'
import type { Density, FactCard } from './types.ts'

const card = (id: string, value: number, axis: FactCard['axis'] = 'population'): FactCard => ({
  id,
  title: id,
  value,
  unit: axis === 'year' ? 'Jahr' : 'Mio.',
  axis,
})

describe('normalizeDensity', () => {
  it('kennt nur Locker, Knackig, Haarscharf', () => {
    expect(normalizeDensity('locker')).toBe('locker')
    expect(normalizeDensity('knackig')).toBe('knackig')
    expect(normalizeDensity('haarscharf')).toBe('haarscharf')
    expect(normalizeDensity('easy')).toBe('knackig')
    expect(normalizeDensity(undefined)).toBe('knackig')
  })
})

describe('pairFitsDensity', () => {
  it('nutzt Ratio bei Mengen, nie über 4', () => {
    expect(pairFitsDensity(card('a', 2.04), card('b', 1.86), 'haarscharf')).toBe(true)
    expect(pairFitsDensity(card('a', 330, 'height'), card('b', 443, 'height'), 'knackig')).toBe(true)
    expect(pairFitsDensity(card('a', 330, 'height'), card('b', 157, 'height'), 'locker')).toBe(true)
    expect(pairFitsDensity(card('a', 84), card('b', 3.8), 'locker')).toBe(false)
    expect(valueRatio(84, 3.8)).toBeGreaterThan(4)
  })

  it('nutzt Jahresabstand statt Ratio', () => {
    expect(usesYearGap('year')).toBe(true)
    expect(yearGap(1756, 1770)).toBe(14)
    expect(pairFitsDensity(card('mozart', 1756, 'year'), card('beethoven', 1770, 'year'), 'haarscharf')).toBe(
      true,
    )
    expect(pairFitsDensity(card('picasso', 1881, 'year'), card('vangogh', 1853, 'year'), 'knackig')).toBe(true)
    expect(pairFitsDensity(card('bach', 1685, 'year'), card('mozart', 1756, 'year'), 'locker')).toBe(true)
    expect(pairFitsDensity(card('mozart', 1756, 'year'), card('beethoven', 1770, 'year'), 'locker')).toBe(false)
    expect(pairFitsDensity(card('a', 1756, 'year'), card('b', 1756, 'year'), 'haarscharf')).toBe(false)
  })

  it('lehnt Teilmengen ab (Deutschland gegen Berlin)', () => {
    const de = card('k-de', 84)
    const berlin = card('berlin', 3.88)
    expect(isSubsetPair(de, berlin)).toBe(true)
    expect(pairFitsDensity(de, berlin, 'locker')).toBe(false)
  })

  it('hält beide Karten in derselben Kategorie', () => {
    expect(pairFitsDensity(card('a', 10, 'weight'), card('b', 12, 'height'), 'haarscharf')).toBe(false)
  })
})

describe('Stapel-Dichte', () => {
  const decks = [
    ['Erwachsene', ADULT_DECK],
    ['Kinder', KIDS_DECK],
  ] as const
  const densities: Density[] = ['locker', 'knackig', 'haarscharf']

  it('hat in jedem Stapel und jeder Dichte mindestens zwei Kategorien mit Paar', () => {
    for (const [name, deck] of decks) {
      for (const density of densities) {
        expect(axesWithPairs(deck, density).length, `${name} ${density}`).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('liefert nur gültige Paare und nie Ratio über 4', () => {
    for (const deck of [ADULT_DECK, KIDS_DECK]) {
      for (const density of densities) {
        for (const [left, right] of listValidPairs(deck, density)) {
          expect(left.axis).toBe(right.axis)
          expect(left.id).not.toBe(right.id)
          expect(pairFitsDensity(left, right, density)).toBe(true)
          if (!usesYearGap(left.axis)) {
            expect(valueRatio(left.value, right.value)).toBeLessThanOrEqual(4)
          }
        }
      }
    }
  })
})
